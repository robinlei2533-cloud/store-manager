import useLanguageStore from '../../stores/languageStore';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tabs, Table, Tag, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Space, Spin, Empty, Row, Col, Statistic, message, Popconfirm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import localDb from '../../services/db/localDb';
import { getCampaignById, createCampaignTask, updateCampaignTask, deleteCampaignTask, createCampaignReport, updateCampaignReport } from '../../services/api';
import PageTransition from "../../components/common/PageTransition";

const { TextArea } = Input;
const statusConfig = { planned: 'Planned', ongoing: 'Ongoing', completed: 'Completed', cancelled: 'Cancelled' };
const taskStatusConfig = { pending: 'Pending', ongoing: 'In Progress', done: 'Done' };

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguageStore();
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
    if (obs.length === 0) return { status: "none", label: "Not Assigned", color: "default" };
    if (obs.some(o => o.status === "delivered")) return { status: "delivered", label: "Delivered", color: "success" };
    if (obs.some(o => o.status === "approved")) return { status: "shipping", label: "In Transit", color: "processing" };
    return { status: "pending", label: "Pending Approval", color: "orange" };
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
      reason: "Campaign: " + (campaign?.name || "") + " - Material delivery",
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
    message.success("Material assigned for delivery!");
  };

  const materials = localDb.all("materials") || [];

  const { data: campaign, isLoading } = useQuery({ queryKey: ['campaign', id], queryFn: () => getCampaignById(id), enabled: !!id });

  const campaignClaims = (localDb.all('campaign_claims') || []).filter(c => c.campaign_id === id);
  const storeList = localDb.all('stores') || [];
  useEffect(() => { setClaims(campaignClaims); setAllStores(storeList); }, []);
  const taskMut = useMutation({ mutationFn: ({ data, taskId }) => taskId ? updateCampaignTask(taskId, data) : createCampaignTask(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); message.success('Task saved'); setTaskModalOpen(false); taskForm.resetFields(); setEditingTask(null); } });
  const deleteTaskMut = useMutation({ mutationFn: deleteCampaignTask, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); message.success('Task deleted'); } });
  const reportMut = useMutation({ mutationFn: ({ data, reportId }) => reportId ? updateCampaignReport(reportId, data) : createCampaignReport(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); message.success('Report saved'); setReportModalOpen(false); } });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!campaign) return <Empty />;

  const taskColumns = [
    { title: 'Task', dataIndex: 'title', key: 'title' },
    { title: 'Due Date', dataIndex: 'due_date', key: 'due', render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'done' ? 'success' : s === 'ongoing' ? 'processing' : 'default'}>{taskStatusConfig[s] || s}</Tag> },
    { title: 'Actions', key: 'action', render: (_, r) => (
      <Space>
        {r.status !== 'done' && <Button type="link" size="small" onClick={() => { taskMut.mutate({ taskId: r.id, data: { status: 'done' } }); }}>Mark Done</Button>}
        <Button type="link" size="small" onClick={() => { setEditingTask(r); taskForm.setFieldsValue({ ...r, due_date: r.due_date ? dayjs(r.due_date) : null }); setTaskModalOpen(true); }}>Edit</Button>
        <Popconfirm title="Delete?" onConfirm={() => deleteTaskMut.mutate(r.id)}><Button type="link" danger size="small">Delete</Button></Popconfirm>
      </Space>
    )},
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
      <Button type="link" onClick={() => navigate('/app/campaigns')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Campaigns</Button>
      <Card className="liquid-glass" title={campaign.name} extra={<Tag color={campaign.status === 'ongoing' ? 'processing' : campaign.status === 'completed' ? 'default' : 'blue'}>{statusConfig[campaign.status]}</Tag>}>
        <Descriptions column={3} bordered>
          <Descriptions.Item label="Type">{campaign.type}</Descriptions.Item>
          <Descriptions.Item label="Start">{campaign.start_date}</Descriptions.Item>
          <Descriptions.Item label="End">{campaign.end_date}</Descriptions.Item>
          <Descriptions.Item label="Budget">${campaign.budget || 0}</Descriptions.Item>
          <Descriptions.Item label="Actual Cost">${campaign.actual_cost || 0}</Descriptions.Item>
          <Descriptions.Item label="Stores">{campaign.target_stores?.length || 0}</Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>{campaign.description}</Descriptions.Item>
        </Descriptions>
        <Tabs style={{ marginTop: 16 }} items={[
          { key: 'overview', label: 'Overview', children: (
            <div>
              <h4>Target Stores</h4>
              <Row gutter={[8, 8]}>
                {campaign.target_store_details?.map(s => (
                  <Col key={s.id}><Tag color={s.level === 'A' ? 'green' : s.level === 'B' ? 'blue' : 'default'}>{s.name} (Level {s.level || '-'})</Tag></Col>
                ))}
              </Row>
            </div>
          )},
          { key: 'tasks', label: `Tasks (${campaign.tasks?.length || 0})`, children: (
            <div>
              <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setEditingTask(null); taskForm.resetFields(); setTaskModalOpen(true); }}>Add Task</Button>
              <Table columns={taskColumns} dataSource={campaign.tasks || []} rowKey="id" pagination={false} size="small" locale={{ emptyText: 'No tasks' }} />
            </div>
          )},
          { key: 'claims', label: 'Claims (' + claims.length + ')', children: (
            <Table dataSource={claims} rowKey='id' size='small' pagination={false}
              columns={[
                { title: 'Store', key: 'store', render: (_, r) => {
                  const st = allStores.find(s => s.id === r.store_id);
                  return st?.name || r.store_id;
                }},
                { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'completed' ? 'success' : s === 'in_progress' ? 'processing' : 'default'}>{s}</Tag> },
                { title: 'Delivery', key: 'delivery', render: (_, r) => {
                  const ds = getDeliveryStatus(r.id);
                  return <Tag color={ds.color}>{ds.label}</Tag>;
                }},
                { title: 'Used', dataIndex: 'materials_used', key: 'mat', render: (v) => v || 0 },
                { title: 'Effect', dataIndex: 'effect', key: 'effect' },
                { title: 'Claimed', dataIndex: 'claimed_at', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
                { title: 'Action', key: 'action', render: (_, r) => {
                  const ds = getDeliveryStatus(r.id);
                  if (ds.status === "none") {
                    const st = allStores.find(s => s.id === r.store_id);
                    return <Button size="small" type="primary" onClick={() => setDeliveryModal({ open: true, claim: r, storeName: st?.name || r.store_id })}>Assign Materials</Button>;
                  }
                  return null;
                }},
              ]}
            />
          )},
          { key: 'report', label: 'Review Report', children: campaign.report ? (
            <div>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Total Sales" value={campaign.report.total_sales || 0} prefix="$" /></Card></Col>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Total Visits" value={campaign.report.total_visits || 0} /></Card></Col>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Total Scans" value={campaign.report.total_scans || 0} /></Card></Col>
                <Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Achievement" value={campaign.report.achievement_rate || 0} suffix="%" /></Card></Col>
              </Row>
              <Card className="liquid-glass" title="Summary" size="small" style={{ marginBottom: 8 }}><p>{campaign.report.summary}</p></Card>
              <Card className="liquid-glass" title="Improvements" size="small"><p>{campaign.report.improvements}</p></Card>
              <Button type="link" onClick={() => { reportForm.setFieldsValue(campaign.report); setReportModalOpen(true); }}>Edit Report</Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Empty description="No report yet" />
              <Button type="primary" style={{ marginTop: 16 }} onClick={() => { reportForm.resetFields(); setReportModalOpen(true); }}>Write Review Report</Button>
            </div>
          )},
        ]} />
      </Card>

      <Modal title={editingTask ? 'Edit Task' : 'Add Task'} open={taskModalOpen} onOk={async () => { const v = await taskForm.validateFields(); taskMut.mutate({ taskId: editingTask?.id, data: { ...v, campaign_id: id, due_date: v.due_date?.format('YYYY-MM-DD') } }); }} onCancel={() => { setTaskModalOpen(false); setEditingTask(null); }}>
        <Form form={taskForm} layout="vertical">
          <Form.Item name="title" label="Task Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="due_date" label="Due Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{ label: 'Pending', value: 'pending' }, { label: 'In Progress', value: 'ongoing' }, { label: 'Done', value: 'done' }]} /></Form.Item>
        </Form>
      </Modal>

      {/* Delivery Modal */}
      <Modal
        title={<span style={{color:"#FFD700"}}>📦  Assign Materials</span>}
        open={deliveryModal.open}
        onCancel={() => { setDeliveryModal({ open: false, claim: null, storeName: "" }); deliveryForm.resetFields(); }}
        onOk={handleAssignMaterial}
        okText="Assign for Delivery"
      >
        <p style={{marginBottom:16,color:"rgba(255,255,255,0.5)"}}>
          Assigning materials for: <strong style={{color:"#FFD700"}}>{deliveryModal.storeName}</strong>
        </p>
        <Form form={deliveryForm} layout="vertical">
          <Form.Item name="material_id" label="Material" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select material" options={materials.map(m => ({ label: m.name + " (" + m.sku + ")", value: m.id }))} />
          </Form.Item>
          <Form.Item name="qty" label="Quantity" rules={[{ required: true, message: "Required" }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Review Report" open={reportModalOpen} width={600} onOk={async () => { const v = await reportForm.validateFields(); reportMut.mutate({ data: { ...v, campaign_id: id, report_date: new Date().toISOString().split('T')[0] }, reportId: campaign.report?.id }); }} onCancel={() => setReportModalOpen(false)}>
        <Form form={reportForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="total_sales" label="Total Sales ($)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="total_visits" label="Total Visits"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="total_scans" label="Total Scans"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="achievement_rate" label="Achievement Rate (%)"><InputNumber min={0} max={200} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="summary" label="Summary"><TextArea rows={3} /></Form.Item>
          <Form.Item name="improvements" label="Improvements"><TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
    </PageTransition>);
};

export default CampaignDetailPage;

