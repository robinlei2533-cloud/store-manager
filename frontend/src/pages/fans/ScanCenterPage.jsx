import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, message, Popconfirm, Row, Col, Statistic, Spin, Empty } from 'antd';
import { PlusOutlined, QrcodeOutlined, ScanOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQrCodes, createQrCode, updateQrCode, deleteQrCode, scanQrCode, getScanRecords, getProducts, getStores } from '../../services/api';
import { FAN_LEVELS } from '../../utils/constants';

const levelMap = Object.fromEntries(FAN_LEVELS.map(f => [f.value, f]));

const QrCard = ({ qr, onScan, onToggle, onDelete }) => (
  <Card size="small" style={{ width: 200, textAlign: 'center' }}>
    <div style={{ width: 120, height: 120, margin: '0 auto 12px', background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d9d9d9' }}>
      <QrcodeOutlined style={{ fontSize: 48, color: '#999' }} />
    </div>
    <div style={{ fontWeight: 600, marginBottom: 4 }}>{qr.code}</div>
    <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{qr.products?.name || '-'}</div>
    <Tag color={qr.is_active ? 'green' : 'default'}>{qr.is_active ? 'Active' : 'Inactive'}</Tag>
    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{qr.stores?.name || '-'} · {qr.scan_count} scans</div>
    <Space style={{ marginTop: 8 }}>
      <Button type="primary" size="small" icon={<ScanOutlined />} disabled={!qr.is_active} onClick={() => onScan(qr)}>Simulate Scan</Button>
      <Button size="small" onClick={() => onToggle(qr)}>{qr.is_active ? 'Disable' : 'Enable'}</Button>
      <Popconfirm title="Delete?" onConfirm={() => onDelete(qr)}><Button danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
    </Space>
  </Card>
);

const ScanCenterPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: qrCodes = [], isLoading: qrLoading } = useQuery({ queryKey: ['qr-codes'], queryFn: () => getQrCodes({}) });
  const { data: scanRecords = [], isLoading: scanLoading } = useQuery({ queryKey: ['scan-records'], queryFn: () => getScanRecords({}) });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });

  const createMut = useMutation({ mutationFn: createQrCode, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qr-codes'] }); message.success('QR Code created'); setModalOpen(false); form.resetFields(); } });
  const toggleMut = useMutation({ mutationFn: ({ id, data }) => updateQrCode(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qr-codes'] }); message.success('Status updated'); } });
  const deleteMut = useMutation({ mutationFn: deleteQrCode, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qr-codes'] }); message.success('QR Code deleted'); } });
  const scanMut = useMutation({
    mutationFn: scanQrCode,
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['qr-codes'] }); queryClient.invalidateQueries({ queryKey: ['scan-records'] }); queryClient.invalidateQueries({ queryKey: ['fans'] }); message.success(`Scan successful! +${data.points} points awarded to ${data.fan?.stores?.name || 'store'}`); },
    onError: (err) => message.error(err.message || 'Scan failed'),
  });

  const totalScans = scanRecords.length;
  const totalPoints = scanRecords.reduce((sum, r) => sum + r.points_earned, 0);
  const activeQrCount = qrCodes.filter(q => q.is_active).length;

  const scanColumns = [
    { title: 'Time', dataIndex: 'created_at', key: 'time', render: (v) => new Date(v).toLocaleString('en-US') },
    { title: 'Product', dataIndex: ['products', 'name'], key: 'product' },
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store' },
    { title: 'Points', dataIndex: 'points_earned', key: 'points', render: (v) => <span style={{ color: '#52c41a', fontWeight: 600 }}>+{v}</span> },
    { title: 'Fan Level', dataIndex: ['fans', 'level'], key: 'level', render: (l) => l ? <Tag color={levelMap[l]?.color}>{levelMap[l]?.label}</Tag> : '-' },
  ];

  return (
    <Card>
      <Tabs items={[
        { key: 'qr', label: 'QR Code Management', children: (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}><Card size="small"><Statistic title="Total QR Codes" value={qrCodes.length} prefix={<QrcodeOutlined />} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="Active Codes" value={activeQrCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="Total Scans" value={totalScans} prefix={<ScanOutlined />} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="Total Points Awarded" value={totalPoints} valueStyle={{ color: '#722ed1' }} /></Card></Col>
            </Row>
            <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); form.setFieldsValue({ points: 5 }); setModalOpen(true); }}>Generate QR Code</Button>
            {qrLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> :
             qrCodes.length === 0 ? <Empty description="No QR codes" /> :
             <Row gutter={[16, 16]}>
               {qrCodes.map(qr => (
                 <Col key={qr.id}><QrCard qr={qr} onScan={(q) => scanMut.mutate(q.id)} onToggle={(q) => toggleMut.mutate({ id: q.id, data: { is_active: !q.is_active } })} onDelete={(q) => deleteMut.mutate(q.id)} /></Col>
               ))}
             </Row>}
          </div>
        )},
        { key: 'records', label: 'Scan Records', children: scanLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> : <Table columns={scanColumns} dataSource={scanRecords} rowKey="id" pagination={{ pageSize: 15, showTotal: (t) => `Total ${t} scans` }} /> },
      ]} />

      <Modal title="Generate QR Code" open={modalOpen} onOk={async () => { const v = await form.validateFields(); const code = `QR-${v.product_id?.slice(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`; createMut.mutate({ ...v, code }); }} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="product_id" label="Product" rules={[{ required: true, message: 'Required' }]}><Select placeholder="Select product" options={products.map(p => ({ label: `${p.name} (${p.sku})`, value: p.id }))} /></Form.Item>
          <Form.Item name="store_id" label="Store" rules={[{ required: true, message: 'Required' }]}><Select placeholder="Select store" options={stores.map(s => ({ label: s.name, value: s.id }))} /></Form.Item>
          <Form.Item name="points" label="Points per Scan" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ScanCenterPage;
