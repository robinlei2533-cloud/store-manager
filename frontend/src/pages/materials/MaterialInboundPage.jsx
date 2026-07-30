import React from 'react';
import { Form, Select, InputNumber, Input, Button, Card, Table, message, Spin, Empty } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, createInbound, getInbounds } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import PageTransition from "../../components/common/PageTransition";

const MaterialInboundPage = () => {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();

  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { data: inbounds = [], isLoading } = useQuery({ queryKey: ['inbounds'], queryFn: () => getInbounds({}) });

  const mutation = useMutation({
    mutationFn: createInbound,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inbounds'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('入库记录已提交'); form.resetFields(); },
  });

  const handleSubmit = async (values) => {
    await mutation.mutateAsync({ ...values, operator_id: profile?.id || 'u-admin' });
  };

  const columns = [
    { title: '日期', dataIndex: 'created_at', key: 'date', render: (v) => new Date(v).toLocaleString('zh-CN') },
    { title: '物料', dataIndex: ['materials', 'name'], key: 'name' },
    { title: 'SKU', dataIndex: ['materials', 'sku'], key: 'sku' },
    { title: '数量', dataIndex: 'qty', key: 'qty' },
    { title: '操作人', dataIndex: ['profiles', 'name'], key: 'op' },
    { title: '备注', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top admin-material-inbound-page" style={{minHeight:"100vh",padding:24}}>
      <Card className="liquid-glass admin-material-inbound-form-card" title="入库管理" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleSubmit} style={{ marginBottom: 16 }}>
          <Form.Item name="material_id" label="物料" rules={[{ required: true, message: '必填' }]}>
            <Select placeholder="选择物料" style={{ width: 200 }} options={materials.map((m) => ({ label: `${m.name} (${m.sku})`, value: m.id }))} />
          </Form.Item>
          <Form.Item name="qty" label="数量" rules={[{ required: true, message: '必填' }]}>
            <InputNumber min={1} placeholder="0" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input placeholder="可选备注" style={{ width: 250 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>提交入库</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card className="liquid-glass" title="入库历史">
        {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> :
         <Table className="admin-material-inbound-table" rowKey="id" dataSource={inbounds} columns={columns} pagination={{ pageSize: 10 }} scroll={{ x: 760 }}
           locale={{ emptyText: <Empty description="暂无入库记录" /> }} />}
      </Card>
    </div>
    </PageTransition>);
};

export default MaterialInboundPage;
