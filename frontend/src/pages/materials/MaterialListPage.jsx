import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Card, Spin, Empty, Popconfirm, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../services/api';

const MATERIAL_CATEGORIES = ['Promotional', 'Display', 'Office Supply', 'Gift', 'Other'];

const MaterialListPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [form] = Form.useForm();

  const { data: materials = [], isLoading } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });

  const createMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materials'] }); message.success('Material created'); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, material }) => updateMaterial(id, material),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materials'] }); message.success('Material updated'); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materials'] }); message.success('Material deleted'); },
  });

  const closeModal = () => { setModalOpen(false); form.resetFields(); setImageUrl(''); setEditingMaterial(null); };

  const openAddModal = () => { setEditingMaterial(null); form.resetFields(); setImageUrl(''); setModalOpen(true); };

  const openEditModal = (record) => {
    setEditingMaterial(record);
    form.setFieldsValue(record);
    setImageUrl(record.image_url || '');
    setModalOpen(true);
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => { setImageUrl(e.target.result); };
    reader.readAsDataURL(file);
    return false; // prevent auto upload
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, image_url: imageUrl || null };
      if (editingMaterial) {
        await updateMutation.mutateAsync({ id: editingMaterial.id, material: data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch { /* validation */ }
  };

  const columns = [
    {
      title: 'Image', dataIndex: 'image_url', key: 'image', width: 80,
      render: (url) => url ? <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 48, height: 48, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No img</div>,
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v) => v || '-' },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (v) => v || '-' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', render: (v) => v || '-' },
    { title: 'Unit Cost', dataIndex: 'unit_cost', key: 'unit_cost', render: (v) => (v != null ? `$${v.toFixed(2)}` : '-') },
    {
      title: 'Actions', key: 'action', width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>Edit</Button>
          <Popconfirm title="Delete this material?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title={<span style={{ fontSize: 18, fontWeight: 600 }}>Material Catalog</span>} extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Add Material</Button>
      }>
        {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
         !materials.length ? <Empty description="No materials yet. Click Add Material to create one." /> :
         <Table rowKey="id" dataSource={materials} columns={columns} pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} items` }} />}
      </Card>

      <Modal title={editingMaterial ? 'Edit Material' : 'Add Material'} open={modalOpen} onOk={handleSubmit} onCancel={closeModal} confirmLoading={createMutation.isPending || updateMutation.isPending} destroyOnClose width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Material Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="e.g. Promotional Poster" />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Please enter SKU' }]}>
            <Input placeholder="e.g. MTL-001" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select placeholder="Select category" options={MATERIAL_CATEGORIES.map((c) => ({ label: c, value: c }))} allowClear />
          </Form.Item>
          <Form.Item name="unit" label="Unit">
            <Input placeholder="e.g. pcs, box, set" />
          </Form.Item>
          <Form.Item name="unit_cost" label="Unit Cost ($)">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" prefix="$" />
          </Form.Item>
          <Form.Item label="Image">
            <Space direction="vertical">
              {imageUrl && <img src={imageUrl} alt="preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />}
              <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload}>
                <Button icon={<UploadOutlined />}>{imageUrl ? 'Change Image' : 'Upload Image'}</Button>
              </Upload>
              {imageUrl && <Button type="link" danger size="small" onClick={() => setImageUrl('')}>Remove Image</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialListPage;
