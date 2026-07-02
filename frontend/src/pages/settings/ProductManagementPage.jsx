import useLanguageStore from '../../stores/languageStore';
import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Card, Spin, Empty, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import PageTransition from "../../components/common/PageTransition";

const CATEGORIES = ['Beverage', 'Snack', 'Food', 'Daily Use', 'Other'];

const ProductManagementPage = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguageStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const { data: products = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const createMut = useMutation({ mutationFn: createProduct, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); message.success(t('product_created')); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updateProduct(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); message.success(t('product_updated')); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: deleteProduct, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); message.success(t('product_deleted')); } });

  const closeModal = () => { setModalOpen(false); form.resetFields(); setEditing(null); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: values });
    else await createMut.mutateAsync(values);
  };

  const columns = [
    { title: t('product_name'), dataIndex: 'name', key: 'name' },
    { title: t('product_sku'), dataIndex: 'sku', key: 'sku' },
    { title: t('product_category'), dataIndex: 'category', key: 'category' },
    { title: t('product_unit_price'), dataIndex: 'unit_price', key: 'price', render: (v) => `$${(v || 0).toFixed(2)}` },
    { title: t('actions'), key: 'action', render: (_, r) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>{t('edit')}</Button>
        <Popconfirm title={t('delete_product_confirm')} onConfirm={() => deleteMut.mutate(r.id)}><Button type="link" danger icon={<DeleteOutlined />}>{t('delete')}</Button></Popconfirm>
      </Space>
    )},
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass admin-readable-card" title={t('set_product_mgmt')} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>{t('add_product')}</Button>}>
      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> :
       !products.length ? <Empty description={t('no_products')} /> :
       <Table rowKey="id" dataSource={products} columns={columns} pagination={{ pageSize: 10 }} />}
      <Modal title={editing ? t('edit_product') : t('add_product')} open={modalOpen} onOk={handleSubmit} onCancel={closeModal} confirmLoading={createMut.isPending || updateMut.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('product_name')} rules={[{ required: true, message: t('required') }]}><Input /></Form.Item>
          <Form.Item name="sku" label={t('product_sku')} rules={[{ required: true, message: t('required') }]}><Input /></Form.Item>
          <Form.Item name="category" label={t('product_category')}><Select options={CATEGORIES.map(c => ({ label: c, value: c }))} allowClear /></Form.Item>
          <Form.Item name="unit_price" label={t('product_unit_price')}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Card>
    </div>
    </PageTransition>);
};

export default ProductManagementPage;
