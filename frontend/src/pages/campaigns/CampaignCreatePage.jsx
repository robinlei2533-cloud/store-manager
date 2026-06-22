import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, InputNumber, Button, Card, message, Spin, Checkbox, Row, Col, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getStores, getCampaignById, createCampaign, updateCampaign } from '../../services/api';
import { CAMPAIGN_TYPES } from '../../utils/constants';

const { TextArea } = Input;

const CampaignCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });

  useEffect(() => {
    if (id) {
      setLoading(true);
      getCampaignById(id).then(c => {
        form.setFieldsValue({ ...c, start_date: c.start_date ? dayjs(c.start_date) : null, end_date: c.end_date ? dayjs(c.end_date) : null, target_stores: c.target_stores || [] });
      }).finally(() => setLoading(false));
    } else {
      form.setFieldsValue({ status: 'planned', budget: 5000 });
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const data = { ...values, start_date: values.start_date?.format('YYYY-MM-DD'), end_date: values.end_date?.format('YYYY-MM-DD') };
      if (id) await updateCampaign(id, data);
      else await createCampaign(data);
      message.success(id ? 'Campaign updated' : 'Campaign created');
      navigate('/campaigns');
    } catch (err) { message.error(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <div>
      <Button type="link" onClick={() => navigate('/campaigns')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back</Button>
      <Card title={id ? 'Edit Campaign' : 'New Campaign'}>
        <Form form={form} layout="vertical" style={{ maxWidth: 700 }}>
          <Form.Item name="name" label="Campaign Name" rules={[{ required: true, message: 'Required' }]}><Input placeholder="e.g. Summer Promotion" /></Form.Item>
          <Form.Item name="type" label="Type"><Select options={CAMPAIGN_TYPES.map(t => ({ label: t, value: t }))} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="start_date" label="Start Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="end_date" label="End Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="status" label="Status"><Select options={[{ label: 'Planned', value: 'planned' }, { label: 'Ongoing', value: 'ongoing' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }]} /></Form.Item>
          <Form.Item name="budget" label="Budget ($)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="Description"><TextArea rows={3} /></Form.Item>
          <Divider>Target Stores</Divider>
          <Form.Item name="target_stores" label="Select Stores">
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                {stores.map(s => (
                  <Col span={8} key={s.id} style={{ marginBottom: 8 }}>
                    <Checkbox value={s.id}>{s.name} ({s.level || '-'})</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>{id ? 'Update' : 'Create'} Campaign</Button>
            <Button size="large" style={{ marginLeft: 8 }} onClick={() => navigate('/campaigns')}>Cancel</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CampaignCreatePage;
