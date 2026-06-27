import useLanguageStore from '../../stores/languageStore';
﻿import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, message, Space, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPointsRules, createPointsRule, updatePointsRule, deletePointsRule, getLevelRules, updateLevelRule } from '../../services/api';
import { FAN_LEVELS } from '../../utils/constants';

const FanRulesPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const { data: rules = [], isLoading: rulesLoading } = useQuery({ queryKey: ['points-rules'], queryFn: getPointsRules });
  const { data: levelRules = [], isLoading: levelsLoading } = useQuery({ queryKey: ['level-rules'], queryFn: getLevelRules });

  const createMut = useMutation({ mutationFn: createPointsRule, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['points-rules'] }); message.success('Rule created'); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updatePointsRule(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['points-rules'] }); message.success('Rule updated'); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: deletePointsRule, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['points-rules'] }); message.success('Rule deleted'); } });
  const levelMut = useMutation({ mutationFn: ({ id, data }) => updateLevelRule(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['level-rules'] }); message.success('Level updated'); } });

  const levelMap = Object.fromEntries(FAN_LEVELS.map(f => [f.value, f]));
  const closeModal = () => { setModalOpen(false); form.resetFields(); setEditing(null); };

  const ruleColumns = [
    { title: 'Action Type', dataIndex: 'action_type', key: 'action' },
    { title: 'Points', dataIndex: 'points', key: 'points', render: (v) => <span style={{ fontWeight: 600, color: '#52c41a' }}>+{v}</span> },
    { title: 'Description', dataIndex: 'description', key: 'desc' },
    { title: 'Active', dataIndex: 'is_active', key: 'active', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag> },
    { title: 'Actions', key: 'action', render: (_, r) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>Edit</Button>
        <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => deleteMut.mutate(r.id)}>Delete</Button>
      </Space>
    )},
  ];

  const levelColumns = [
    { title: 'Level', dataIndex: 'level', key: 'level', render: (l) => <Tag color={levelMap[l]?.color}>{levelMap[l]?.label}</Tag> },
    { title: 'Min Points', dataIndex: 'min_points', key: 'min' },
    { title: 'Benefits', dataIndex: 'benefits', key: 'benefits', render: (v, r) => (
      <Input value={v} onChange={(e) => levelMut.mutate({ id: r.id, data: { benefits: e.target.value } })} style={{ width: 300 }} />
    )},
  ];

  return (
    <div>
      <Button type="link" onClick={() => navigate('/app/fans/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Fans</Button>
      <Card title="Points Rules" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>Add Rule</Button>} style={{ marginBottom: 16 }}>
        {rulesLoading ? <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div> : <Table columns={ruleColumns} dataSource={rules} rowKey="id" pagination={false} size="small" />}
      </Card>
      <Card title="Level Rules">
        {levelsLoading ? <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div> : <Table columns={levelColumns} dataSource={levelRules} rowKey="id" pagination={false} size="small" />}
      </Card>

      <Modal title={editing ? 'Edit Rule' : 'Add Rule'} open={modalOpen} onOk={async () => { const v = await form.validateFields(); if (editing) updateMut.mutate({ id: editing.id, data: v }); else createMut.mutate(v); }} onCancel={closeModal}>
        <Form form={form} layout="vertical">
          <Form.Item name="action_type" label="Action Type" rules={[{ required: true }]}><Input placeholder="e.g. Complete Visit" /></Form.Item>
          <Form.Item name="points" label="Points" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="Description"><Input /></Form.Item>
          <Form.Item name="is_active" label="Active"><Select options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FanRulesPage;

