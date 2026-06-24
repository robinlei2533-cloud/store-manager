import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Card, Spin, Empty, Popconfirm, Image, Tag, Tabs, InputNumber as Num, Tooltip, Statistic, Row, Col, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, InboxOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, getMaterialStocks, updateMaterialStock, getInbounds, createInbound, getOutbounds, createOutbound, updateOutboundStatus, getStores, IS_LOCAL_MODE } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import { ROLES } from '../../utils/constants';
import localDb from '../../services/db/localDb';

const MATERIAL_CATEGORIES = ['Promotional', 'Display', 'Office Supply', 'Gift', 'Store', 'Uniform', 'Sample', 'Other'];

// ============ Material Catalog Tab ============
const CatalogTab = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [form] = Form.useForm();

  const { data: materials = [], isLoading } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { data: stocks = [] } = useQuery({ queryKey: ['material-stocks'], queryFn: getMaterialStocks });

  const createMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materials'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('Material created'); closeModal(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, material }) => updateMaterial(id, material),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materials'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('Material updated'); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materials'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('Material deleted'); },
  });

  // Direct stock update
  const updateStockMutation = useMutation({
    mutationFn: ({ materialId, qty, safetyStock }) => updateMaterialStock(materialId, qty, safetyStock),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); },
  });

  const closeModal = () => { setModalOpen(false); form.resetFields(); setImageUrl(''); setEditingMaterial(null); };
  const openAddModal = () => { setEditingMaterial(null); form.resetFields(); setImageUrl(''); setModalOpen(true); };
  const openEditModal = (record) => { setEditingMaterial(record); form.setFieldsValue(record); setImageUrl(record.image_url || ''); setModalOpen(true); };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => { setImageUrl(e.target.result); };
    reader.readAsDataURL(file);
    return false;
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
    } catch (err) {
      if (err?.errorFields) return; // form validation error, already shown by form
      message.error(err?.message || 'Operation failed. Please try again.');
    }
  };

  const getStockInfo = (materialId) => {
    const stock = stocks.find(s => s.material_id === materialId);
    return stock || { qty: 0, safety_stock: 10 };
  };

  const columns = [
    {
      title: 'Image', dataIndex: 'image_url', key: 'image', width: 70,
      render: (url) => url
        ? <Image src={url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />
        : <div style={{ width: 48, height: 48, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 10 }}>N/A</div>,
    },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 180 },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120, render: v => v || '-' },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 110, render: v => v ? <Tag>{v}</Tag> : '-' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 70 },
    { title: 'Unit Cost', dataIndex: 'unit_cost', key: 'unit_cost', width: 90, render: v => v != null ? `$${v.toFixed(2)}` : '-' },
    {
      title: 'Current Stock', key: 'qty', width: 120,
      render: (_, record) => {
        const stock = getStockInfo(record.id);
        return (
          <Tooltip title="Click to edit">
            <InputNumber
              value={stock.qty}
              min={0}
              size="small"
              style={{ width: 80 }}
              onChange={(v) => updateStockMutation.mutate({ materialId: record.id, qty: v || 0, safetyStock: stock.safety_stock })}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Safety Stock', key: 'safety', width: 120,
      render: (_, record) => {
        const stock = getStockInfo(record.id);
        return (
          <InputNumber
            value={stock.safety_stock}
            min={0}
            size="small"
            style={{ width: 80 }}
            onChange={(v) => updateStockMutation.mutate({ materialId: record.id, qty: stock.qty, safetyStock: v || 0 })}
          />
        );
      },
    },
    {
      title: 'Status', key: 'status', width: 100,
      render: (_, record) => {
        const stock = getStockInfo(record.id);
        if (stock.qty === 0) return <Tag color="red">Out of Stock</Tag>;
        if (stock.qty <= stock.safety_stock) return <Tag color="orange">Low Stock</Tag>;
        return <Tag color="green">Normal</Tag>;
      },
    },
    {
      title: 'Actions', key: 'action', width: 140, fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>Edit</Button>
          <Popconfirm title="Delete this material?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title={<span style={{ fontSize: 18, fontWeight: 600 }}>Material Catalog</span>} extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Add Material</Button>
    }>
      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
       !materials.length ? <Empty description="No materials yet. Click Add Material to create one." /> :
       <Table
         rowKey="id"
         dataSource={materials}
         columns={columns}
         pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} items` }}
         scroll={{ x: 1100 }}
       />
      }

      <Modal
        title={editingMaterial ? 'Edit Material' : 'Add Material'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width="90%" style={{ maxWidth: 520 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Material Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="e.g. Promotional Poster" />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Please enter SKU' }]}>
            <Input placeholder="e.g. MTL-001" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select placeholder="Select category" options={MATERIAL_CATEGORIES.map(c => ({ label: c, value: c }))} allowClear />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="unit" label="Unit">
                <Input placeholder="e.g. pcs, box, set" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="unit_cost" label="Unit Cost ($)">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0.00" prefix="$" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Image">
            <Space direction="vertical">
              {imageUrl && <img src={imageUrl} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />}
              <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload}>
                <Button icon={<UploadOutlined />}>{imageUrl ? 'Change Image' : 'Upload Image'}</Button>
              </Upload>
              {imageUrl && <Button type="link" danger size="small" onClick={() => setImageUrl('')}>Remove Image</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

// ============ Stock Dashboard Tab ============
const StockTab = () => {
  const { data: stocks = [], isLoading } = useQuery({ queryKey: ['material-stocks'], queryFn: getMaterialStocks });
  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });

  const enrichedStocks = stocks.map(s => {
    const mat = materials.find(m => m.id === s.material_id);
    return { ...s, image_url: mat?.image_url };
  });

  const lowStockCount = enrichedStocks.filter(s => s.qty <= s.safety_stock).length;
  const outOfStockCount = enrichedStocks.filter(s => s.qty === 0).length;
  const totalValue = enrichedStocks.reduce((sum, s) => sum + (s.qty * (s.materials?.unit_cost || 0)), 0);

  const columns = [
    {
      title: 'Image', dataIndex: 'image_url', key: 'image', width: 70,
      render: (url) => url
        ? <Image src={url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} />
        : <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 10 }}>N/A</div>,
    },
    { title: 'Material', dataIndex: ['materials', 'name'], key: 'name' },
    { title: 'SKU', dataIndex: ['materials', 'sku'], key: 'sku' },
    { title: 'Category', dataIndex: ['materials', 'category'], key: 'cat', render: v => v ? <Tag>{v}</Tag> : '-' },
    { title: 'Current Stock', dataIndex: 'qty', key: 'qty', sorter: (a, b) => a.qty - b.qty, render: v => <span style={{ fontWeight: 700, fontSize: 14 }}>{v}</span> },
    { title: 'Safety Stock', dataIndex: 'safety_stock', key: 'safety' },
    { title: 'Unit', dataIndex: ['materials', 'unit'], key: 'unit' },
    { title: 'Stock Value', key: 'value', render: (_, r) => `$${((r.qty || 0) * (r.materials?.unit_cost || 0)).toFixed(2)}` },
    {
      title: 'Status', key: 'status', width: 120,
      render: (_, r) => {
        if (r.qty === 0) return <Tag color="red">Out of Stock</Tag>;
        if (r.qty <= r.safety_stock) return <Tag color="orange">Low Stock</Tag>;
        return <Tag color="green">Normal</Tag>;
      },
    },
    {
      title: 'Stock Level', key: 'bar', width: 150,
      render: (_, r) => {
        const pct = r.safety_stock > 0 ? Math.min(100, Math.round((r.qty / (r.safety_stock * 2)) * 100)) : 100;
        return <Progress percent={pct} size="small" status={r.qty === 0 ? 'exception' : r.qty <= r.safety_stock ? 'active' : 'success'} />;
      },
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} lg={6}><Card size="small"><Statistic title="Total Items" value={enrichedStocks.length} prefix={<InboxOutlined />} /></Card></Col>
        <Col xs={12} sm={12} lg={6}><Card size="small"><Statistic title="Low Stock" value={lowStockCount} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={12} sm={12} lg={6}><Card size="small"><Statistic title="Out of Stock" value={outOfStockCount} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col xs={12} sm={12} lg={6}><Card size="small"><Statistic title="Total Stock Value" value={totalValue} prefix="$" valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Card title="Inventory Dashboard">
        {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
         !enrichedStocks.length ? <Empty description="No inventory data" /> :
         <Table
           rowKey="id"
           dataSource={enrichedStocks}
           columns={columns}
           pagination={{ pageSize: 15, showTotal: (t) => `Total ${t} items` }}
           scroll={{ x: 1000 }}
           rowClassName={(r) => r.qty <= r.safety_stock ? 'low-stock-row' : ''}
         />
        }
      </Card>
    </div>
  );
};

// ============ Inbound Tab ============
const InboundTab = () => {
  const queryClient = useQueryClient();
  const profile = useAuthStore(s => s.profile);
  const [form] = Form.useForm();

  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { data: inbounds = [], isLoading } = useQuery({ queryKey: ['inbounds'], queryFn: () => getInbounds({}) });

  const mutation = useMutation({
    mutationFn: createInbound,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inbounds'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('Inbound recorded'); form.resetFields(); },
  });

  const handleSubmit = async (values) => {
    await mutation.mutateAsync({ ...values, operator_id: profile?.id || 'u-admin' });
  };

  const columns = [
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: v => new Date(v).toLocaleString('en-US') },
    { title: 'Material', dataIndex: ['materials', 'name'], key: 'name' },
    { title: 'SKU', dataIndex: ['materials', 'sku'], key: 'sku' },
    { title: 'Quantity', dataIndex: 'qty', key: 'qty', render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Operator', dataIndex: ['profiles', 'name'], key: 'op' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  return (
    <div>
      <Card title="New Inbound" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleSubmit} style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Form.Item name="material_id" label="Material" rules={[{ required: true, message: 'Required' }]}>
            <Select placeholder="Select material" style={{ width: 220 }} showSearch optionFilterProp="label" options={materials.map(m => ({ label: `${m.name} (${m.sku})`, value: m.id }))} />
          </Form.Item>
          <Form.Item name="qty" label="Quantity" rules={[{ required: true, message: 'Required' }]}>
            <InputNumber min={1} placeholder="0" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input placeholder="Optional notes" style={{ width: 250 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>Submit Inbound</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card title="Inbound History">
        {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> :
         <Table rowKey="id" dataSource={inbounds} columns={columns} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />}
      </Card>
    </div>
  );
};

// ============ Outbound Tab ============
const OutboundTab = () => {
  const queryClient = useQueryClient();
  const profile = useAuthStore(s => s.profile);
  const [form] = Form.useForm();
  const canApprove = profile?.role === ROLES.ADMIN || profile?.role === ROLES.MANAGER;

  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });
  const { data: outbounds = [], isLoading } = useQuery({ queryKey: ['outbounds'], queryFn: () => getOutbounds({}) });

  const mutation = useMutation({
    mutationFn: createOutbound,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['outbounds'] }); message.success('Request submitted'); form.resetFields(); },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOutboundStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['outbounds'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('Status updated'); },
  });

  const statusMap = { pending: { color: 'orange', text: 'Pending' }, approved: { color: 'green', text: 'Approved' }, rejected: { color: 'red', text: 'Rejected' }, delivered: { color: 'blue', text: 'Delivered' } };

  const columns = [
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: v => new Date(v).toLocaleString('en-US') },
    { title: 'Material', dataIndex: ['materials', 'name'], key: 'name' },
    { title: 'Qty', dataIndex: 'qty', key: 'qty' },
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store', render: v => v || '-' },
    { title: 'Applicant', dataIndex: ['profiles', 'name'], key: 'app' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag> },
    ...(canApprove ? [{
      title: 'Actions', key: 'action', render: (_, r) => r.status === 'pending' ? (
        <Space>
          <Button type="link" size="small" onClick={() => statusMutation.mutate({ id: r.id, status: 'approved' })}>Approve</Button>
          <Button type="link" danger size="small" onClick={() => statusMutation.mutate({ id: r.id, status: 'rejected' })}>Reject</Button>
        </Space>
      ) : r.status === 'approved' ? <Button type="link" size="small" onClick={() => statusMutation.mutate({ id: r.id, status: 'delivered' })}>Mark Delivered</Button> : null,
    }] : []),
  ];

  return (
    <div>
      <Card title="New Requisition" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={async (v) => { await mutation.mutateAsync({ ...v, applicant_id: profile?.id || 'u-admin', status: 'pending' }); }} style={{ maxWidth: 500 }}>
          <Form.Item name="material_id" label="Material" rules={[{ required: true }]}>
            <Select placeholder="Select material" options={materials.map(m => ({ label: `${m.name} (${m.sku})`, value: m.id }))} />
          </Form.Item>
          <Form.Item name="qty" label="Quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="store_id" label="Store">
            <Select placeholder="Select store" allowClear options={stores.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Form.Item name="reason" label="Reason"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={mutation.isPending}>Submit Request</Button></Form.Item>
        </Form>
      </Card>
      <Card title="Outbound Records">
        {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> :
         <Table rowKey="id" dataSource={outbounds} columns={columns} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />}
      </Card>
    </div>
  );
};

// ============ Main Page ============
const MaterialListPage = () => {
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'catalog', label: <span><InboxOutlined /> Catalog & Stock</span>, children: <CatalogTab /> },
          { key: 'dashboard', label: <span><WarningOutlined /> Stock Dashboard</span>, children: <StockTab /> },
          { key: 'inbound', label: 'Inbound', children: <InboundTab /> },
          { key: 'outbound', label: 'Outbound', children: <OutboundTab /> },
        ]}
      />
    </div>
  );
};

export default MaterialListPage;
