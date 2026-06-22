import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Card, Spin, Empty, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';

const CATEGORIES = ['Beverage', 'Snack', 'Food', 'Daily Use', 'Other'];

const ProductManagementPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const { data: products = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const createMut = useMutation({ mutationFn: createProduct, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); message.success('Product created'); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updateProduct(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); message.success('Product updated'); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: deleteProduct, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); message.success('Product deleted'); } });

  const closeModal = () => { setModalOpen(false); form.resetFields(); setEditing(null); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: values });
    else await createMut.mutateAsync(values);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Unit Price', dataIndex: 'unit_price', key: 'price', render: (v) => `$${(v || 0).toFixed(2)}` },
    { title: 'Actions', key: 'action', render: (_, r) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>Edit</Button>
        <Popconfirm title="Delete this product?" onConfirm={() => deleteMut.mutate(r.id)}><Button type="link" danger icon={<DeleteOutlined />}>Delete</Button></Popconfirm>
      </Space>
    )},
  ];

  return (
    <Card title="Product Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>Add Product</Button>}>
      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> :
       !products.length ? <Empty description="No products" /> :
       <Table rowKey="id" dataSource={products} columns={columns} pagination={{ pageSize: 10 }} />}
      <Modal title={editing ? 'Edit Product' : 'Add Product'} open={modalOpen} onOk={handleSubmit} onCancel={closeModal} confirmLoading={createMut.isPending || updateMut.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Required' }]}><Input /></Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Required' }]}><Input /></Form.Item>
          <Form.Item name="category" label="Category"><Select options={CATEGORIES.map(c => ({ label: c, value: c }))} allowClear /></Form.Item>
          <Form.Item name="unit_price" label="Unit Price ($)"><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductManagementPage;
