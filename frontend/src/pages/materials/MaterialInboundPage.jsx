import useLanguageStore from '../../stores/languageStore';
import React, { useState } from 'react';
import { Form, Select, InputNumber, Input, Button, Card, Table, message, Spin, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, createInbound, getInbounds } from '../../services/api';
import useAuthStore from '../../stores/authStore';

const MaterialInboundPage = () => {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();

  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { data: inbounds = [], isLoading } = useQuery({ queryKey: ['inbounds'], queryFn: () => getInbounds({}) });

  const mutation = useMutation({
    mutationFn: createInbound,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inbounds'] }); queryClient.invalidateQueries({ queryKey: ['material-stocks'] }); message.success('Inbound recorded successfully'); form.resetFields(); },
  });

  const handleSubmit = async (values) => {
    await mutation.mutateAsync({ ...values, operator_id: profile?.id || 'u-admin' });
  };

  const columns = [
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: (v) => new Date(v).toLocaleString('en-US') },
    { title: 'Material', dataIndex: ['materials', 'name'], key: 'name' },
    { title: 'SKU', dataIndex: ['materials', 'sku'], key: 'sku' },
    { title: 'Quantity', dataIndex: 'qty', key: 'qty' },
    { title: 'Operator', dataIndex: ['profiles', 'name'], key: 'op' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  return (
    <div>
      <Card title="Inbound Management" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleSubmit} style={{ marginBottom: 16 }}>
          <Form.Item name="material_id" label="Material" rules={[{ required: true, message: 'Required' }]}>
            <Select placeholder="Select material" style={{ width: 200 }} options={materials.map((m) => ({ label: `${m.name} (${m.sku})`, value: m.id }))} />
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
         <Table rowKey="id" dataSource={inbounds} columns={columns} pagination={{ pageSize: 10 }} />}
      </Card>
    </div>
  );
};

export default MaterialInboundPage;
