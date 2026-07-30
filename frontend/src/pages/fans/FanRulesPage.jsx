import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, message, Space, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPointsRules, createPointsRule, updatePointsRule, deletePointsRule, getLevelRules, updateLevelRule } from '../../services/api';
import { FAN_LEVELS } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";

const fixedSystemLogic = [
  '粉丝兑换奖励时只扣除可用积分',
  '终身成长积分永不扣除',
  '兑换奖励不会降低粉丝等级',
  '门店只负责核销，积分由系统发放',
  '一个 UWELL 唯一产品码只能被领取一次',
  '同一粉丝不能从同一活动重复获得积分',
];

const configurableParameters = [
  '每日计分扫码上限',
  '扫码积分和每日签到积分',
  '社区点赞/评论/发帖积分与每日上限',
  '粉丝等级阈值',
  '奖励积分成本和等级要求',
  '活动奖励积分和有效期',
];

const reviewAndAuditItems = [
  '高价值奖励审批',
  '人工积分调整',
  '可疑扫码处理',
  '门店自建活动积分支持',
  '社区滥用积分回退',
];

const FanRulesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const { data: rules = [], isLoading: rulesLoading } = useQuery({ queryKey: ['points-rules'], queryFn: getPointsRules });
  const { data: levelRules = [], isLoading: levelsLoading } = useQuery({ queryKey: ['level-rules'], queryFn: getLevelRules });

  const createMut = useMutation({ mutationFn: createPointsRule, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['points-rules'] }); message.success('规则已创建'); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updatePointsRule(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['points-rules'] }); message.success('规则已更新'); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: deletePointsRule, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['points-rules'] }); message.success('规则已删除'); } });
  const levelMut = useMutation({ mutationFn: ({ id, data }) => updateLevelRule(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['level-rules'] }); message.success('等级已更新'); } });

  const levelMap = Object.fromEntries(FAN_LEVELS.map(f => [f.value, f]));
  const closeModal = () => { setModalOpen(false); form.resetFields(); setEditing(null); };

  const ruleColumns = [
    { title: '动作类型', dataIndex: 'action_type', key: 'action' },
    { title: '积分', dataIndex: 'points', key: 'points', render: (v) => <span style={{ fontWeight: 600, color: '#52c41a' }}>+{v}</span> },
    { title: '说明', dataIndex: 'description', key: 'desc' },
    { title: '启用', dataIndex: 'is_active', key: 'active', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => deleteMut.mutate(r.id)}>删除</Button>
      </Space>
    )},
  ];

  const levelColumns = [
    { title: '等级', dataIndex: 'level', key: 'level', render: (l) => <Tag color={levelMap[l]?.color}>{levelMap[l]?.label}</Tag> },
    { title: '最低积分', dataIndex: 'min_points', key: 'min' },
    { title: '权益', dataIndex: 'benefits', key: 'benefits', render: (v, r) => (
      <Input value={v} onChange={(e) => levelMut.mutate({ id: r.id, data: { benefits: e.target.value } })} style={{ width: 300 }} />
    )},
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
      <Button type="link" onClick={() => navigate('/app/fans/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; 返回粉丝列表</Button>
      <Card className="liquid-glass admin-readable-card" title="规则设置边界" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, color: 'rgba(255,255,255,0.68)' }}>
          试运营阶段可以调整参数，但固定系统逻辑不能在此页面随意改变。
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <Card size="small" title="固定系统逻辑">
            <Space orientation="vertical" size={6}>
              {fixedSystemLogic.map((item) => <Tag key={item} color="volcano">{item}</Tag>)}
            </Space>
          </Card>
          <Card size="small" title="可配置运营参数">
            <Space orientation="vertical" size={6}>
              {configurableParameters.map((item) => <Tag key={item} color="green">{item}</Tag>)}
            </Space>
          </Card>
          <Card size="small" title="需要审核和审计日志">
            <Space orientation="vertical" size={6}>
              {reviewAndAuditItems.map((item) => <Tag key={item} color="gold">{item}</Tag>)}
            </Space>
          </Card>
        </div>
      </Card>
      <Card className="liquid-glass" title="积分规则" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>新增规则</Button>} style={{ marginBottom: 16 }}>
        {rulesLoading ? <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div> : <Table columns={ruleColumns} dataSource={rules} rowKey="id" pagination={false} size="small" />}
      </Card>
      <Card className="liquid-glass" title="等级规则">
        {levelsLoading ? <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div> : <Table columns={levelColumns} dataSource={levelRules} rowKey="id" pagination={false} size="small" />}
      </Card>

      <Modal title={editing ? '编辑规则' : '新增规则'} open={modalOpen} onOk={async () => { const v = await form.validateFields(); if (editing) updateMut.mutate({ id: editing.id, data: v }); else createMut.mutate(v); }} onCancel={closeModal}>
        <Form form={form} layout="vertical">
          <Form.Item name="action_type" label="动作类型" rules={[{ required: true }]}><Input placeholder="例如：完成拜访" /></Form.Item>
          <Form.Item name="points" label="积分" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="说明"><Input /></Form.Item>
          <Form.Item name="is_active" label="启用"><Select options={[{ label: '是', value: true }, { label: '否', value: false }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
    </PageTransition>);
};

export default FanRulesPage;

