import React, { useState } from 'react';
import { Form, Select, InputNumber, Input, Button, Card, Table, Tabs, Tag, message, Spin, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, getStores, createOutbound, getOutbounds, updateOutboundStatus } from '../../services/api';
import { OUTBOUND_STATUS } from '../../utils/constants';
import useAuthStore from '../../stores/authStore';
import { ROLES } from '../../utils/constants';

const MaterialOutboundPage = () => {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('apply');

  const canApprove = profile?.role === ROLES.ADMIN || profile?.role === ROLES.MANAGER;

  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });
  const { data: outbounds = [], isLoading } = useQuery({ queryKey: ['outbounds'], queryFn: () => getOutbounds({}) });

  const mutation = useMutation({
    mutationFn: createOutbound,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['outbounds'] }); message.success('Outbound request submitted'); form.resetFields(); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOutboundStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['outbounds'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('Status updated'); },
  });

  const handleSubmit = async (values) => {
    await mutation.mutateAsync({ ...values, applicant_id: profile?.id || 'u-admin', status: 'pending' });
  };

  const statusMap = { pending: { color: 'orange', text: 'Pending' }, approved: { color: 'green', text: 'Approved' }, rejected: { color: 'red', text: 'Rejected' }, delivered: { color: 'blue', text: 'Delivered' } };

  const columns = [
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: (v) => new Date(v).toLocaleString('en-US') },
    { title: 'Material', dataIndex: ['materials', 'name'], key: 'name' },
    { title: 'Qty', dataIndex: 'qty', key: 'qty' },
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store', render: (v) => v || '-' },
    { title: 'Applicant', dataIndex: ['profiles', 'name'], key: 'app' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag> },
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
    <Card title="Outbound / Requisition">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        { key: 'apply', label: 'New Requisition', children: (
          <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
            <Form.Item name="material_id" label="Material" rules={[{ required: true, message: 'Required' }]}>
              <Select placeholder="Select material" options={materials.map((m) => ({ label: `${m.name} (${m.sku})`, value: m.id }))} />
            </Form.Item>
            <Form.Item name="qty" label="Quantity" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="store_id" label="Store">
              <Select placeholder="Select store" allowClear options={stores.map((s) => ({ label: s.name, value: s.id }))} />
            </Form.Item>
            <Form.Item name="reason" label="Reason"><Input.TextArea placeholder="Reason for requisition" rows={2} /></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit" loading={mutation.isPending}>Submit Request</Button></Form.Item>
          </Form>
        )},
        { key: 'records', label: 'Outbound Records', children: isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> : <Table rowKey="id" dataSource={outbounds} columns={columns} pagination={{ pageSize: 10 }} /> },
      ]} />
    </Card>
  );
};

export default MaterialOutboundPage;
