import React, { useState } from 'react';
import { Form, Select, InputNumber, Input, Button, Card, Table, Tabs, Tag, message, Spin, Space, Empty } from 'antd';
import { CheckOutlined, CloseOutlined, TruckOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, getStores, createOutbound, getOutbounds, updateOutboundStatus } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import { ROLES } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";
import localDb from '../../services/db/localDb';
import { canViewCompanyScope, getAssignedStoreIds } from '../../utils/uwellRoleAccess';

const MaterialOutboundPage = () => {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('apply');

  const canApprove = profile?.role === ROLES.ADMIN || profile?.role === ROLES.MANAGER;
  const canManageCompany = canViewCompanyScope(profile);
  const assignedStoreIds = canManageCompany ? null : getAssignedStoreIds(profile, localDb.all('stores') || []);

  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { data: stores = [] } = useQuery({ queryKey: ['stores-for-outbound', profile?.id], queryFn: () => getStores({ assigned_to: canManageCompany ? null : profile }) });
  const { data: outbounds = [], isLoading } = useQuery({ queryKey: ['outbounds', profile?.id], queryFn: () => getOutbounds({ assigned_store_ids: assignedStoreIds }) });

  const mutation = useMutation({
    mutationFn: createOutbound,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['outbounds'] }); message.success('出库申领已提交'); form.resetFields(); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOutboundStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['outbounds'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('状态已更新'); },
  });

  const handleSubmit = async (values) => {
    await mutation.mutateAsync({ ...values, applicant_id: profile?.id || 'u-admin', status: 'pending' });
  };

  const statusMap = { pending: { color: 'orange', text: '待审批' }, approved: { color: 'green', text: '已通过' }, rejected: { color: 'red', text: '已拒绝' }, delivered: { color: 'blue', text: '已送达' } };

  const columns = [
    { title: '日期', dataIndex: 'created_at', key: 'date', render: (v) => new Date(v).toLocaleString('zh-CN') },
    { title: '物料', dataIndex: ['materials', 'name'], key: 'name' },
    { title: '数量', dataIndex: 'qty', key: 'qty' },
    { title: '门店', dataIndex: ['stores', 'name'], key: 'store', render: (v) => v || '-' },
    { title: '申请人', dataIndex: ['profiles', 'name'], key: 'app' },
    { title: '原因', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag> },
    ...(canApprove ? [{
      title: '操作', key: 'action', render: (_, r) => r.status === 'pending' ? (
        <Space>
          <Button type="link" size="small" icon={<CheckOutlined />} title="Approve outbound" aria-label="Approve outbound" onClick={() => statusMutation.mutate({ id: r.id, status: 'approved' })}>通过</Button>
          <Button type="link" danger size="small" icon={<CloseOutlined />} title="Reject outbound" aria-label="Reject outbound" onClick={() => statusMutation.mutate({ id: r.id, status: 'rejected' })}>拒绝</Button>
        </Space>
      ) : r.status === 'approved' ? <Button type="link" size="small" icon={<TruckOutlined />} title="Mark outbound delivered" aria-label="Mark outbound delivered" onClick={() => statusMutation.mutate({ id: r.id, status: 'delivered' })}>标记送达</Button> : null,
    }] : []),
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top admin-material-outbound-page" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass" title="出库 / 申领">
      <Tabs className="admin-material-outbound-tabs" activeKey={activeTab} onChange={setActiveTab} items={[
        { key: 'apply', label: '新建申领', children: (
          <Form className="admin-material-outbound-form" form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
            <Form.Item name="material_id" label="物料" rules={[{ required: true, message: '必填' }]}>
              <Select placeholder="选择物料" options={materials.map((m) => ({ label: `${m.name} (${m.sku})`, value: m.id }))} />
            </Form.Item>
            <Form.Item name="qty" label="数量" rules={[{ required: true, message: '必填' }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="store_id" label="门店">
              <Select placeholder="选择门店" allowClear options={stores.map((s) => ({ label: s.name, value: s.id }))} />
            </Form.Item>
            <Form.Item name="reason" label="原因"><Input.TextArea placeholder="填写申领原因" rows={2} /></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit" loading={mutation.isPending}>提交申请</Button></Form.Item>
          </Form>
        )},
        { key: 'records', label: '出库记录', children: isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> : <Table className="admin-material-outbound-records-table" rowKey="id" dataSource={outbounds} columns={columns} pagination={{ pageSize: 10 }} scroll={{ x: 920 }} locale={{ emptyText: <Empty description="暂无出库记录" /> }} /> },
      ]} />
    </Card>
    </div>
    </PageTransition>);
};

export default MaterialOutboundPage;
