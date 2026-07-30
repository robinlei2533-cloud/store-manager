import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tabs, Table, Tag, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Space, Spin, Empty, Row, Col, Statistic, message, Popconfirm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import localDb from '../../services/db/localDb';
import { getCampaignById, createCampaignTask, updateCampaignTask, deleteCampaignTask, createCampaignReport, updateCampaignReport, updateCampaign } from '../../services/api';
import PageTransition from "../../components/common/PageTransition";

const { TextArea } = Input;
const statusConfig = { planned: '已计划', ongoing: '进行中', completed: '已完成', cancelled: '已取消' };
const taskStatusConfig = { pending: '待处理', ongoing: '进行中', done: '已完成' };
const deliveryStatusConfig = {
  none: { label: '未分配', color: 'default' },
  delivered: { label: '已送达', color: 'success' },
  shipping: { label: '运输中', color: 'processing' },
  pending: { label: '待审批', color: 'orange' },
};

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm] = Form.useForm();
  const [claims, setClaims] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [reportForm] = Form.useForm();
  const [deliveryModal, setDeliveryModal] = useState({ open: false, claim: null, storeName: "" });
  const [deliveryForm] = Form.useForm();
  const allOutbounds = (localDb.all("material_outbound") || []);

  const getDeliveryStatus = (claimId) => {
    const obs = allOutbounds.filter(o => o.claim_id === claimId);
    if (obs.length === 0) return { status: "none", ...deliveryStatusConfig.none };
    if (obs.some(o => o.status === "delivered")) return { status: "delivered", ...deliveryStatusConfig.delivered };
    if (obs.some(o => o.status === "approved")) return { status: "shipping", ...deliveryStatusConfig.shipping };
    return { status: "pending", ...deliveryStatusConfig.pending };
  };

  const handleAssignMaterial = async () => {
    const v = await deliveryForm.validateFields();
    const claim = deliveryModal.claim;
    localDb.insert("material_outbound", {
      id: "mo-" + Date.now(),
      material_id: v.material_id,
      qty: v.qty,
      store_id: claim.store_id,
      claim_id: claim.id,
      applicant_id: "u-admin",
      status: "pending",
      reason: "活动：" + (campaign?.name || "") + " - 物料配送",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const claimRecord = localDb.findById("campaign_claims", claim.id);
    if (claimRecord && claimRecord.status === "pending") {
      localDb.update("campaign_claims", claim.id, { status: "in_progress" });
    }
    setClaims(prev => [...prev]);
    setDeliveryModal({ open: false, claim: null, storeName: "" });
    deliveryForm.resetFields();
    message.success("已分配物料发货");
  };

  const materials = localDb.all("materials") || [];

  const { data: campaign, isLoading } = useQuery({ queryKey: ['campaign', id], queryFn: () => getCampaignById(id), enabled: !!id });

  const campaignClaims = useMemo(() => (localDb.all('campaign_claims') || []).filter(c => c.campaign_id === id), [id]);
  const storeList = useMemo(() => localDb.all('stores') || [], []);
  useEffect(() => { setClaims(campaignClaims); setAllStores(storeList); }, [campaignClaims, storeList]);
  const taskMut = useMutation({ mutationFn: ({ data, taskId }) => taskId ? updateCampaignTask(taskId, data) : createCampaignTask(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); message.success('任务已保存'); setTaskModalOpen(false); taskForm.resetFields(); setEditingTask(null); } });
  const deleteTaskMut = useMutation({ mutationFn: deleteCampaignTask, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); message.success('任务已删除'); } });
  const reportMut = useMutation({ mutationFn: ({ data, reportId }) => reportId ? updateCampaignReport(reportId, data) : createCampaignReport(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); message.success('复盘报告已保存'); setReportModalOpen(false); } });
  const approvalMut = useMutation({
    mutationFn: (data) => updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      message.success('活动审核已保存');
    },
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!campaign) return <Empty />;

  const taskColumns = [
    { title: '任务', dataIndex: 'title', key: 'title' },
    { title: '截止日期', dataIndex: 'due_date', key: 'due', render: (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'done' ? 'success' : s === 'ongoing' ? 'processing' : 'default'}>{taskStatusConfig[s] || s}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => (
      <Space>
        {r.status !== 'done' && <Button type="link" size="small" onClick={() => { taskMut.mutate({ taskId: r.id, data: { status: 'done' } }); }}>标记完成</Button>}
        <Button type="link" size="small" onClick={() => { setEditingTask(r); taskForm.setFieldsValue({ ...r, due_date: r.due_date ? dayjs(r.due_date) : null }); setTaskModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deleteTaskMut.mutate(r.id)}><Button type="link" danger size="small">删除</Button></Popconfirm>
      </Space>
    )},
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top admin-campaign-detail-page">
      <Button type="link" onClick={() => navigate('/app/campaigns')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; 返回活动列表</Button>
      <Card className="liquid-glass admin-campaign-detail-card" title={campaign.name} extra={(
        <Space>
          {campaign.source === 'store_application' && campaign.approval_status !== 'approved' && (
            <Button
              type="primary"
              size="small"
              onClick={() => approvalMut.mutate({ approval_status: 'approved', fan_visible: true, status: 'ongoing' })}
            >
              通过并展示到粉丝端
            </Button>
          )}
          {campaign.source === 'store_application' && campaign.approval_status !== 'rejected' && (
            <Button
              danger
              size="small"
              onClick={() => approvalMut.mutate({ approval_status: 'rejected', fan_visible: false, status: 'cancelled' })}
            >
              拒绝
            </Button>
          )}
          <Tag color={campaign.status === 'ongoing' ? 'processing' : campaign.status === 'completed' ? 'default' : 'blue'}>{statusConfig[campaign.status]}</Tag>
        </Space>
      )}>
        <Descriptions className="admin-campaign-detail-descriptions" column={{ xs: 1, sm: 1, md: 2, lg: 3 }} bordered>
          <Descriptions.Item label="活动类型">{campaign.type}</Descriptions.Item>
          {campaign.source === 'store_application' && (
            <Descriptions.Item label="粉丝端可见">
              <Tag color={campaign.fan_visible ? 'green' : 'orange'}>{campaign.approval_status || 'pending'}</Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="开始日期">{campaign.start_date}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{campaign.end_date}</Descriptions.Item>
          <Descriptions.Item label="预算">${campaign.budget || 0}</Descriptions.Item>
          <Descriptions.Item label="实际成本">${campaign.actual_cost || 0}</Descriptions.Item>
          <Descriptions.Item label="门店数">{campaign.target_stores?.length || 0}</Descriptions.Item>
          <Descriptions.Item label="活动说明" span={{ xs: 1, sm: 1, md: 2, lg: 3 }}>{campaign.description}</Descriptions.Item>
        </Descriptions>
        <Tabs className="admin-campaign-detail-tabs" style={{ marginTop: 16 }} items={[
          { key: 'overview', label: '概览', children: (
            <div>
              <h4>目标门店</h4>
              <Row gutter={[8, 8]}>
                {campaign.target_store_details?.map(s => (
                  <Col xs={24} sm={12} md={8} key={s.id}>
                    <Tag className="campaign-store-tag" color={s.level === 'A' ? 'green' : s.level === 'B' ? 'blue' : 'default'}>{s.name}（等级 {s.level || '-'}）</Tag>
                  </Col>
                ))}
              </Row>
            </div>
          )},
          { key: 'tasks', label: `任务（${campaign.tasks?.length || 0}）`, children: (
            <div>
              <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setEditingTask(null); taskForm.resetFields(); setTaskModalOpen(true); }}>新增任务</Button>
              <div className="admin-campaign-detail-table-wrap admin-campaign-detail-task-table">
                <Table columns={taskColumns} dataSource={campaign.tasks || []} rowKey="id" pagination={false} size="small" scroll={{ x: 620 }} locale={{ emptyText: '暂无任务' }} />
              </div>
            </div>
          )},
          { key: 'claims', label: '申领（' + claims.length + '）', children: (
            <div className="admin-campaign-detail-table-wrap admin-campaign-detail-claims-table">
              <Table dataSource={claims} rowKey='id' size='small' pagination={false} scroll={{ x: 840 }}
                columns={[
                  { title: '门店', key: 'store', render: (_, r) => {
                    const st = allStores.find(s => s.id === r.store_id);
                    return st?.name || r.store_id;
                  }},
                  { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'completed' ? 'success' : s === 'in_progress' ? 'processing' : 'default'}>{s}</Tag> },
                  { title: '配送', key: 'delivery', render: (_, r) => {
                    const ds = getDeliveryStatus(r.id);
                    return <Tag color={ds.color}>{ds.label}</Tag>;
                  }},
                  { title: '已用物料', dataIndex: 'materials_used', key: 'mat', render: (v) => v || 0 },
                  { title: '效果', dataIndex: 'effect', key: 'effect' },
                  { title: '申领时间', dataIndex: 'claimed_at', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-' },
                  { title: '操作', key: 'action', render: (_, r) => {
                    const ds = getDeliveryStatus(r.id);
                    if (ds.status === "none") {
                      const st = allStores.find(s => s.id === r.store_id);
                      return <Button size="small" type="primary" onClick={() => setDeliveryModal({ open: true, claim: r, storeName: st?.name || r.store_id })}>分配物料</Button>;
                    }
                    return null;
                  }},
                ]}
              />
            </div>
          )},
          { key: 'report', label: '活动复盘报告', children: campaign.report ? (
            <div>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="总销售额" value={campaign.report.total_sales || 0} prefix="$" /></Card></Col>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="总到店" value={campaign.report.total_visits || 0} /></Card></Col>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="总扫码" value={campaign.report.total_scans || 0} /></Card></Col>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="达成率" value={campaign.report.achievement_rate || 0} suffix="%" /></Card></Col>
              </Row>
              <Card className="liquid-glass" title="总结" size="small" style={{ marginBottom: 8 }}><p>{campaign.report.summary}</p></Card>
              <Card className="liquid-glass" title="改进项" size="small"><p>{campaign.report.improvements}</p></Card>
              <Button type="link" onClick={() => { reportForm.setFieldsValue(campaign.report); setReportModalOpen(true); }}>编辑报告</Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Empty description="暂无复盘报告" />
              <Button type="primary" style={{ marginTop: 16 }} onClick={() => { reportForm.resetFields(); setReportModalOpen(true); }}>填写复盘报告</Button>
            </div>
          )},
        ]} />
      </Card>

      <Modal title={editingTask ? '编辑任务' : '新增任务'} open={taskModalOpen} onOk={async () => { const v = await taskForm.validateFields(); taskMut.mutate({ taskId: editingTask?.id, data: { ...v, campaign_id: id, due_date: v.due_date?.format('YYYY-MM-DD') } }); }} onCancel={() => { setTaskModalOpen(false); setEditingTask(null); }}>
        <Form form={taskForm} layout="vertical">
          <Form.Item name="title" label="任务标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="due_date" label="截止日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label="状态"><Select options={[{ label: '待处理', value: 'pending' }, { label: '进行中', value: 'ongoing' }, { label: '已完成', value: 'done' }]} /></Form.Item>
        </Form>
      </Modal>

      {/* Delivery Modal */}
      <Modal
        title={<span style={{color:"#FFD700"}}>分配物料发货</span>}
        open={deliveryModal.open}
        onCancel={() => { setDeliveryModal({ open: false, claim: null, storeName: "" }); deliveryForm.resetFields(); }}
        onOk={handleAssignMaterial}
        okText="分配发货"
      >
        <p style={{marginBottom:16,color:"rgba(255,255,255,0.5)"}}>
          正在为门店分配物料：<strong style={{color:"#FFD700"}}>{deliveryModal.storeName}</strong>
        </p>
        <Form form={deliveryForm} layout="vertical">
          <Form.Item name="material_id" label="物料" rules={[{ required: true, message: "必填" }]}>
            <Select placeholder="选择物料" options={materials.map(m => ({ label: m.name + " (" + m.sku + ")", value: m.id }))} />
          </Form.Item>
          <Form.Item name="qty" label="数量" rules={[{ required: true, message: "必填" }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="活动复盘报告" open={reportModalOpen} width={600} onOk={async () => { const v = await reportForm.validateFields(); reportMut.mutate({ data: { ...v, campaign_id: id, report_date: new Date().toISOString().split('T')[0] }, reportId: campaign.report?.id }); }} onCancel={() => setReportModalOpen(false)}>
        <Form form={reportForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="total_sales" label="总销售额 ($)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="total_visits" label="总到店"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="total_scans" label="总扫码"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="achievement_rate" label="达成率 (%)"><InputNumber min={0} max={200} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="summary" label="总结"><TextArea rows={3} /></Form.Item>
          <Form.Item name="improvements" label="改进项"><TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
    </PageTransition>);
};

export default CampaignDetailPage;

