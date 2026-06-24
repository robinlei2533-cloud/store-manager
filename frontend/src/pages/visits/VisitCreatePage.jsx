import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, InputNumber, Button, Card, Upload, message, Spin, Divider, Space, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import { getStores, getProducts, createVisit, updateVisit, getVisitById, getVisitSales, getVisitPhotos, upsertVisitSales, uploadVisitPhoto, deleteVisitPhoto } from '../../services/api';
import { PHOTO_TYPES } from '../../utils/constants';

const { TextArea } = Input;

const VisitCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();
  const [salesRows, setSalesRows] = useState([{ product_id: null, sales_qty: 0, sales_amount: 0, stock_qty: 0 }]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([getVisitById(id), getVisitSales(id), getVisitPhotos(id)]).then(([v, s, p]) => {
        form.setFieldsValue({ ...v, visit_date: v.visit_date ? dayjs(v.visit_date) : dayjs() });
        if (s.length > 0) setSalesRows(s.map(r => ({ product_id: r.product_id, sales_qty: r.sales_qty, sales_amount: r.sales_amount, stock_qty: r.stock_qty })));
        setPhotos(p);
      }).finally(() => setLoading(false));
    } else {
      form.setFieldsValue({ visit_date: dayjs(), status: 'draft' });
    }
  }, [id]);

  const handleAddRow = () => setSalesRows([...salesRows, { product_id: null, sales_qty: 0, sales_amount: 0, stock_qty: 0 }]);
  const handleRemoveRow = (idx) => setSalesRows(salesRows.filter((_, i) => i !== idx));
  const handleRowChange = (idx, field, value) => {
    const newRows = [...salesRows];
    newRows[idx][field] = value;
    setSalesRows(newRows);
  };

  const handlePhotoUpload = async (file, photoType) => {
    const tempUrl = URL.createObjectURL(file);
    setPhotos([...photos, { photo_type: photoType, photo_url: tempUrl, file, temp: true }]);
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const visitData = { ...values, visit_date: values.visit_date?.format('YYYY-MM-DD'), rep_id: profile?.id || 'u-rep1' };

      let visitId = id;
      if (id) { await updateVisit(id, visitData); }
      else { const newVisit = await createVisit(visitData); visitId = newVisit.id; }

      const validSales = salesRows.filter(r => r.product_id);
      if (validSales.length > 0) {
        await upsertVisitSales(validSales.map(r => ({ ...r, visit_id: visitId })));
      }

      const newPhotos = photos.filter(p => p.temp && p.file);
      for (const p of newPhotos) {
        await uploadVisitPhoto(visitId, p.file, p.photo_type);
      }

      queryClient.invalidateQueries({ queryKey: ['visits'] });
      message.success(id ? 'Visit updated' : 'Visit created');
      navigate(`/visits/${visitId}`);
    } catch (err) {
      message.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <div>
      <Button type="link" onClick={() => navigate('/app/visits/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Visits</Button>
      <Card title={id ? 'Edit Visit' : 'New Visit'}>
        <Form form={form} layout="vertical">
          <Form.Item name="store_id" label="Store" rules={[{ required: true, message: 'Please select a store' }]}>
            <Select placeholder="Select store" showSearch optionFilterProp="label" options={stores.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Form.Item name="visit_date" label="Visit Date" rules={[{ required: true, message: 'Required' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[{ label: 'Draft', value: 'draft' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }]} />
          </Form.Item>
          <Form.Item name="notes" label="Notes"><TextArea rows={3} placeholder="Visit notes..." /></Form.Item>
        </Form>

        <Divider>Sales Data</Divider>
        {salesRows.map((row, idx) => (
          <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="center">
            <Select placeholder="Product" style={{ width: 200 }} value={row.product_id} onChange={(v) => handleRowChange(idx, 'product_id', v)} options={products.map(p => ({ label: p.name, value: p.id }))} />
            <InputNumber placeholder="Qty" min={0} value={row.sales_qty} onChange={(v) => handleRowChange(idx, 'sales_qty', v || 0)} />
            <InputNumber placeholder="Amount" min={0} prefix="$" value={row.sales_amount} onChange={(v) => handleRowChange(idx, 'sales_amount', v || 0)} />
            <InputNumber placeholder="Stock" min={0} value={row.stock_qty} onChange={(v) => handleRowChange(idx, 'stock_qty', v || 0)} />
            {salesRows.length > 1 && <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemoveRow(idx)} />}
          </Space>
        ))}
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddRow} style={{ marginBottom: 16 }}>Add Product</Button>

        <Divider>Photos</Divider>
        <Space wrap style={{ marginBottom: 16 }}>
          {PHOTO_TYPES.map(pt => (
            <Upload key={pt.value} accept="image/*" showUploadList={false} beforeUpload={(file) => handlePhotoUpload(file, pt.value)}>
              <Button icon={<UploadOutlined />}>Upload {pt.label}</Button>
            </Upload>
          ))}
        </Space>
        {photos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {photos.map((p, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <Image src={p.photo_url} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 8 }} />
                <Button type="link" danger size="small" icon={<DeleteOutlined />} style={{ position: 'absolute', top: 0, right: 0 }} onClick={() => {
                  if (p.id) deleteVisitPhoto(p.id);
                  setPhotos(photos.filter((_, i) => i !== idx));
                }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>{id ? 'Update Visit' : 'Create Visit'}</Button>
          <Button size="large" style={{ marginLeft: 8 }} onClick={() => navigate('/app/visits/list')}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
};

export default VisitCreatePage;
