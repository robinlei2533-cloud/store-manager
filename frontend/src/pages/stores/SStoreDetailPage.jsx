import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  InboxOutlined,
  RiseOutlined,
  ShopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import PageTransition from '../../components/common/PageTransition';
import {
  completeReplenishmentTask,
  correctSStoreInventory,
  correctSStoreMaterialInventory,
  correctSStoreSellThrough,
  createReplenishmentTask,
  downgradeSStoreToA,
  getReplenishmentTasks,
  getSStoreContributionMetrics,
  getSStoreDetail,
  getSStoreInventoryHistory,
  getSStoreMaterialInventoryHistory,
  getSStoreSellThroughHistory,
  getSStoreStatusHistory,
  getSStoreVisitDetails,
  restoreSStore,
  canCorrectSStoreHistory,
} from '../../services/api';
import localDb from '../../services/db/localDb';
import useAuthStore from '../../stores/authStore';
import { canViewCompanyScope, getAssignedRegion } from '../../utils/uwellRoleAccess';
import { canDowngradeSStore, canRestoreSStore } from '../../utils/s-store-rules';

const { Text, Title } = Typography;

const statusColors = {
  active: 'green',
  needs_follow_up: 'orange',
  paused: 'default',
  downgraded: 'red',
  under_review: 'blue',
};

const replenishColors = {
  pending: 'orange',
  in_progress: 'blue',
  completed: 'green',
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('en-US');
  } catch {
    return '-';
  }
};

const formatDateTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('en-US');
  } catch {
    return '-';
  }
};

const latestByDate = (rows, field = 'submitted_at') => rows
  .slice()
  .sort((a, b) => new Date(b[field] || b.created_at || 0) - new Date(a[field] || a.created_at || 0))[0] || null;

const joinList = (value) => (Array.isArray(value) ? value.join(', ') : value || '-');

const replenishmentDefaultForm = {
  trigger_source: 'manual',
  item_type: 'open_system',
  requested_quantity: 1,
  assigned_rep_id: '',
  note: '',
  completion_photos: '',
};

const correctionDefaultForm = {
  period_type: 'weekly',
  period_start: '',
  period_end: '',
  open_system_sold_qty: 0,
  disposable_sold_qty: 0,
  open_system_current_stock: 0,
  open_system_target_stock: 0,
  disposable_current_stock: 0,
  disposable_target_stock: 0,
  material_type: '',
  current_quantity: 0,
  target_quantity: 0,
  note: '',
  correction_reason: '',
  correction_note: '',
};

const emptyContribution = {
  verifiedActivityCount: 0,
  rewardPickupCount: 0,
  storeScanCount: 0,
  campaignContributionCount: 0,
  contributedPoints: 0,
  sources: {
    campaign_claims: 0,
    mall_redemptions: 0,
    scan_records: 0,
    fan_engagement_tasks: 0,
  },
};

const SStoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useAuthStore((state) => state.profile);
  const [operationType, setOperationType] = useState(null);
  const [operationReason, setOperationReason] = useState('');
  const [operationNote, setOperationNote] = useState('');
  const [operationSubmitting, setOperationSubmitting] = useState(false);
  const [replenishmentOperationType, setReplenishmentOperationType] = useState(null);
  const [replenishmentTaskId, setReplenishmentTaskId] = useState(null);
  const [replenishmentSubmitting, setReplenishmentSubmitting] = useState(false);
  const [replenishmentForm, setReplenishmentForm] = useState(replenishmentDefaultForm);
  const [correctionType, setCorrectionType] = useState(null);
  const [correctionRecord, setCorrectionRecord] = useState(null);
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
  const [correctionForm, setCorrectionForm] = useState(correctionDefaultForm);
  const savedProfileId = localStorage.getItem('store_manager_current_user');
  const activeProfile = useMemo(
    () => localDb.findById('profiles', savedProfileId) || profile || null,
    [profile, savedProfileId],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['s-store-detail-read-model', id, activeProfile?.id, activeProfile?.role, activeProfile?.region],
    enabled: Boolean(id),
    queryFn: async () => {
      const store = await getSStoreDetail(id, { includeDowngraded: true });
      if (!store) return null;

      if (!canViewCompanyScope(activeProfile)) {
        const assignedRegion = getAssignedRegion(activeProfile);
        const inScope = !assignedRegion || store.city === assignedRegion || store.region === assignedRegion;
        if (!inScope) return null;
      }

      const [
        statusHistory,
        sellThrough,
        productInventory,
        materialInventory,
        visitDetails,
        contributionMetrics,
        replenishmentTasks,
      ] = await Promise.all([
        getSStoreStatusHistory(id),
        getSStoreSellThroughHistory(id),
        getSStoreInventoryHistory(id),
        getSStoreMaterialInventoryHistory(id),
        getSStoreVisitDetails(id),
        getSStoreContributionMetrics(id),
        getReplenishmentTasks({ store_id: id }),
      ]);

      return {
        store,
        statusHistory,
        sellThrough,
        productInventory,
        materialInventory,
        visitDetails,
        contributionMetrics,
        replenishmentTasks,
      };
    },
  });

  const readModel = useMemo(() => {
    const source = data || {
      store: null,
      statusHistory: [],
      sellThrough: [],
      productInventory: [],
      materialInventory: [],
      visitDetails: [],
      contributionMetrics: emptyContribution,
      replenishmentTasks: [],
    };
    const latestWeekly = latestByDate(source.sellThrough.filter((item) => item.period_type === 'weekly'));
    const latestMonthly = latestByDate(source.sellThrough.filter((item) => item.period_type === 'monthly'));
    const latestProductInventory = latestByDate(source.productInventory);
    const latestMaterialInventory = latestByDate(source.materialInventory);
    const latestVisit = latestByDate(source.visitDetails);
    const openReplenishment = source.replenishmentTasks.filter((item) => item.status !== 'completed');
    const contributionMetrics = source.contributionMetrics || emptyContribution;

    return {
      ...source,
      contributionMetrics,
      latestWeekly,
      latestMonthly,
      latestProductInventory,
      latestMaterialInventory,
      latestVisit,
      openReplenishment,
    };
  }, [data]);

  const store = readModel.store;
  const isDowngradedStore = store?.s_store_status === 'downgraded';
  const canDowngrade = Boolean(store) && canDowngradeSStore(activeProfile, store);
  const canRestore = Boolean(store) && canRestoreSStore(activeProfile, store);
  const canCorrectHistory = Boolean(store) && canCorrectSStoreHistory(activeProfile, store);
  const isOperationOpen = Boolean(operationType);
  const isReplenishmentOperationOpen = Boolean(replenishmentOperationType);
  const isCorrectionOpen = Boolean(correctionType);

  const updateReplenishmentForm = (field, value) => {
    setReplenishmentForm((current) => ({ ...current, [field]: value }));
  };

  const updateCorrectionForm = (field, value) => {
    setCorrectionForm((current) => ({ ...current, [field]: value }));
  };

  const openStatusOperation = (type) => {
    setOperationType(type);
    setOperationReason('');
    setOperationNote('');
  };

  const closeStatusOperation = () => {
    if (operationSubmitting) return;
    setOperationType(null);
    setOperationReason('');
    setOperationNote('');
  };

  const handleStatusOperation = async () => {
    if (!id || !operationType) return;
    if (!operationReason.trim()) {
      message.error('Reason is required.');
      return;
    }
    setOperationSubmitting(true);
    try {
      const payload = {
        reason: operationReason.trim(),
        note: operationNote.trim(),
      };
      if (operationType === 'downgrade') {
        await downgradeSStoreToA(id, payload, activeProfile);
        message.success('S Store downgraded to A.');
        await queryClient.invalidateQueries({ queryKey: ['s-store-management-read-model'] });
        navigate('/app/stores/s-stores');
        return;
      }
      await restoreSStore(id, payload, activeProfile);
      message.success('S Store restored to active S Store.');
      setOperationType(null);
      setOperationReason('');
      setOperationNote('');
      await queryClient.invalidateQueries({ queryKey: ['s-store-detail-read-model'] });
      await queryClient.invalidateQueries({ queryKey: ['s-store-management-read-model'] });
    } catch (error) {
      message.error(error?.message || 'S Store status operation failed.');
    } finally {
      setOperationSubmitting(false);
    }
  };

  const openCreateReplenishment = () => {
    setReplenishmentOperationType('create');
    setReplenishmentTaskId(null);
    setReplenishmentForm(replenishmentDefaultForm);
  };

  const openCompleteReplenishment = (record) => {
    setReplenishmentOperationType('complete');
    setReplenishmentTaskId(record.id);
    setReplenishmentForm({
      ...replenishmentDefaultForm,
      note: record.note || '',
    });
  };

  const closeReplenishmentOperation = (force = false) => {
    if (replenishmentSubmitting && !force) return;
    setReplenishmentOperationType(null);
    setReplenishmentTaskId(null);
    setReplenishmentForm(replenishmentDefaultForm);
  };

  const handleReplenishmentOperation = async () => {
    if (!id || !replenishmentOperationType) return;
    setReplenishmentSubmitting(true);
    try {
      if (replenishmentOperationType === 'create') {
        await createReplenishmentTask({
          store_id: id,
          trigger_source: replenishmentForm.trigger_source,
          item_type: replenishmentForm.item_type,
          requested_quantity: Number(replenishmentForm.requested_quantity || 0),
          assigned_rep_id: replenishmentForm.assigned_rep_id.trim(),
          note: replenishmentForm.note.trim(),
        }, activeProfile);
        message.success('Replenishment task created.');
      } else {
        const completion_photos = replenishmentForm.completion_photos
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);
        if (!completion_photos.length) {
          message.error('Completion photos are required.');
          setReplenishmentSubmitting(false);
          return;
        }
        await completeReplenishmentTask(replenishmentTaskId, {
          completion_photos,
          note: replenishmentForm.note.trim(),
        }, activeProfile);
        message.success('Replenishment task completed.');
      }
      closeReplenishmentOperation(true);
      await queryClient.invalidateQueries({ queryKey: ['s-store-detail-read-model', id] });
      await queryClient.invalidateQueries({ queryKey: ['s-store-management-read-model'] });
    } catch (error) {
      message.error(error?.message || 'S Store replenishment operation failed.');
    } finally {
      setReplenishmentSubmitting(false);
    }
  };

  const openCorrection = (type, record) => {
    setCorrectionType(type);
    setCorrectionRecord(record);
    setCorrectionForm({
      ...correctionDefaultForm,
      period_type: record.period_type || 'weekly',
      period_start: record.period_start || '',
      period_end: record.period_end || '',
      open_system_sold_qty: Number(record.open_system_sold_qty || 0),
      disposable_sold_qty: Number(record.disposable_sold_qty || 0),
      open_system_current_stock: Number(record.open_system_current_stock || 0),
      open_system_target_stock: Number(record.open_system_target_stock || 0),
      disposable_current_stock: Number(record.disposable_current_stock || 0),
      disposable_target_stock: Number(record.disposable_target_stock || 0),
      material_type: record.material_type || '',
      current_quantity: Number(record.current_quantity || 0),
      target_quantity: Number(record.target_quantity || 0),
      note: record.note || '',
    });
  };

  const closeCorrection = (force = false) => {
    if (correctionSubmitting && !force) return;
    setCorrectionType(null);
    setCorrectionRecord(null);
    setCorrectionForm(correctionDefaultForm);
  };

  const handleCorrection = async () => {
    if (!correctionType || !correctionRecord) return;
    if (!correctionForm.correction_reason.trim()) {
      message.error('Correction reason is required.');
      return;
    }
    setCorrectionSubmitting(true);
    try {
      const commonPayload = {
        correction_reason: correctionForm.correction_reason.trim(),
        correction_note: correctionForm.correction_note.trim(),
        note: correctionForm.note,
      };
      if (correctionType === 'sell-through') {
        await correctSStoreSellThrough(correctionRecord.id, {
          ...commonPayload,
          period_type: correctionForm.period_type,
          period_start: correctionForm.period_start,
          period_end: correctionForm.period_end,
          open_system_sold_qty: Number(correctionForm.open_system_sold_qty || 0),
          disposable_sold_qty: Number(correctionForm.disposable_sold_qty || 0),
        }, activeProfile);
      } else if (correctionType === 'product-inventory') {
        await correctSStoreInventory(correctionRecord.id, {
          ...commonPayload,
          open_system_current_stock: Number(correctionForm.open_system_current_stock || 0),
          open_system_target_stock: Number(correctionForm.open_system_target_stock || 0),
          disposable_current_stock: Number(correctionForm.disposable_current_stock || 0),
          disposable_target_stock: Number(correctionForm.disposable_target_stock || 0),
        }, activeProfile);
      } else {
        await correctSStoreMaterialInventory(correctionRecord.id, {
          ...commonPayload,
          material_type: correctionForm.material_type,
          current_quantity: Number(correctionForm.current_quantity || 0),
          target_quantity: Number(correctionForm.target_quantity || 0),
        }, activeProfile);
      }
      message.success('Correction saved.');
      closeCorrection(true);
      await queryClient.invalidateQueries({ queryKey: ['s-store-detail-read-model', id] });
      await queryClient.invalidateQueries({ queryKey: ['s-store-management-read-model'] });
    } catch (error) {
      message.error(error?.message || 'S Store correction failed.');
    } finally {
      setCorrectionSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  }

  if (!store) {
    return (
      <PageTransition>
        <div className="bg-radial-top" style={{ minHeight: '100vh', padding: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/stores/s-stores')} style={{ marginBottom: 16 }}>
            Back to S Store Management
          </Button>
          <Card className="crud-card" title="S Store Detail">
            <Empty description="S Store not found or outside your access scope." />
          </Card>
        </div>
      </PageTransition>
    );
  }

  const tabs = [
    {
      key: 'status',
      label: 'Status History',
      children: (
        <Table
          rowKey="id"
          dataSource={readModel.statusHistory}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No S Store status history yet" /> }}
          columns={[
            { title: 'Action time', dataIndex: 'action_at', key: 'action_at', render: formatDateTime },
            { title: 'Action', dataIndex: 'action_type', key: 'action_type', render: (value) => <Tag color="blue">{value || '-'}</Tag> },
            { title: 'Before', dataIndex: 'before_status', key: 'before_status' },
            { title: 'After', dataIndex: 'after_status', key: 'after_status', render: (value) => <Tag color={statusColors[value] || 'default'}>{value || '-'}</Tag> },
            { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
            { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
          ]}
        />
      ),
    },
    {
      key: 'sell-through',
      label: 'Sell-through',
      children: (
        <Table
          rowKey="id"
          dataSource={readModel.sellThrough}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No sell-through records yet" /> }}
          columns={[
            { title: 'Period', dataIndex: 'period_type', key: 'period_type', render: (value) => <Tag>{value || '-'}</Tag> },
            { title: 'Start', dataIndex: 'period_start', key: 'period_start', render: formatDate },
            { title: 'End', dataIndex: 'period_end', key: 'period_end', render: formatDate },
            { title: 'Open-system sold', dataIndex: 'open_system_sold_qty', key: 'open_system_sold_qty' },
            { title: 'Disposable sold', dataIndex: 'disposable_sold_qty', key: 'disposable_sold_qty' },
            { title: 'Submitted at', dataIndex: 'submitted_at', key: 'submitted_at', render: formatDateTime },
            { title: 'Locked', dataIndex: 'locked', key: 'locked', render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'locked' : 'open'}</Tag> },
            {
              title: 'Correction',
              key: 'correction',
              render: (_, record) => (
                <Button size="small" disabled={!canCorrectHistory} onClick={() => openCorrection('sell-through', record)}>
                  Correct
                </Button>
              ),
            },
          ]}
        />
      ),
    },
    {
      key: 'product-inventory',
      label: 'Product Inventory',
      children: (
        <Table
          rowKey="id"
          dataSource={readModel.productInventory}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No product inventory snapshots yet" /> }}
          columns={[
            { title: 'Submitted at', dataIndex: 'submitted_at', key: 'submitted_at', render: formatDateTime },
            { title: 'Open current', dataIndex: 'open_system_current_stock', key: 'open_system_current_stock' },
            { title: 'Open target', dataIndex: 'open_system_target_stock', key: 'open_system_target_stock' },
            { title: 'Disposable current', dataIndex: 'disposable_current_stock', key: 'disposable_current_stock' },
            { title: 'Disposable target', dataIndex: 'disposable_target_stock', key: 'disposable_target_stock' },
            { title: 'Low stock', dataIndex: 'low_stock', key: 'low_stock', render: (value) => <Tag color={value ? 'red' : 'green'}>{value ? 'yes' : 'no'}</Tag> },
            { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
            {
              title: 'Correction',
              key: 'correction',
              render: (_, record) => (
                <Button size="small" disabled={!canCorrectHistory} onClick={() => openCorrection('product-inventory', record)}>
                  Correct
                </Button>
              ),
            },
          ]}
        />
      ),
    },
    {
      key: 'material-inventory',
      label: 'Material Inventory',
      children: (
        <Table
          rowKey="id"
          dataSource={readModel.materialInventory}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No material inventory snapshots yet" /> }}
          columns={[
            { title: 'Submitted at', dataIndex: 'submitted_at', key: 'submitted_at', render: formatDateTime },
            { title: 'Material type', dataIndex: 'material_type', key: 'material_type' },
            { title: 'Current quantity', dataIndex: 'current_quantity', key: 'current_quantity' },
            { title: 'Target quantity', dataIndex: 'target_quantity', key: 'target_quantity' },
            { title: 'Low stock', dataIndex: 'low_stock', key: 'low_stock', render: (value) => <Tag color={value ? 'red' : 'green'}>{value ? 'yes' : 'no'}</Tag> },
            { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
            {
              title: 'Correction',
              key: 'correction',
              render: (_, record) => (
                <Button size="small" disabled={!canCorrectHistory} onClick={() => openCorrection('material-inventory', record)}>
                  Correct
                </Button>
              ),
            },
          ]}
        />
      ),
    },
    {
      key: 'visits',
      label: 'Field Visit Notes',
      children: (
        <Table
          rowKey="id"
          dataSource={readModel.visitDetails}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No S Store visit notes yet" /> }}
          columns={[
            { title: 'Submitted at', dataIndex: 'submitted_at', key: 'submitted_at', render: formatDateTime },
            { title: 'Inventory', dataIndex: 'inventory_status', key: 'inventory_status' },
            { title: 'Display', dataIndex: 'display_status', key: 'display_status' },
            { title: 'Competitors', dataIndex: 'competitor_situation', key: 'competitor_situation', ellipsis: true },
            { title: 'Hot brands', dataIndex: 'hot_brands', key: 'hot_brands', render: joinList },
            { title: 'Hot flavors', dataIndex: 'hot_flavors', key: 'hot_flavors', render: joinList },
            { title: 'Support needed', dataIndex: 'support_needed', key: 'support_needed', ellipsis: true },
            { title: 'Replenishment needed', dataIndex: 'replenishment_needed', key: 'replenishment_needed', render: (value) => <Tag color={value ? 'orange' : 'green'}>{value ? 'yes' : 'no'}</Tag> },
          ]}
        />
      ),
    },
    {
      key: 'contribution',
      label: 'Contribution',
      children: (
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} xl={6}>
              <Card size="small"><Statistic title="Brand Store Verifications" value={Number(readModel.contributionMetrics.verifiedActivityCount || 0)} /></Card>
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <Card size="small"><Statistic title="Reward Pickups" value={Number(readModel.contributionMetrics.rewardPickupCount || 0)} /></Card>
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <Card size="small"><Statistic title="Store-linked Scans" value={Number(readModel.contributionMetrics.storeScanCount || 0)} /></Card>
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <Card size="small"><Statistic title="Campaign Contribution" value={Number(readModel.contributionMetrics.campaignContributionCount || 0)} /></Card>
            </Col>
          </Row>
          <Table
            rowKey="source"
            pagination={false}
            dataSource={[
              { source: 'campaign_claims', label: 'Campaign claims', count: readModel.contributionMetrics.sources?.campaign_claims || 0 },
              { source: 'mall_redemptions', label: 'Reward pickups', count: readModel.contributionMetrics.sources?.mall_redemptions || 0 },
              { source: 'scan_records', label: 'Store-linked scans', count: readModel.contributionMetrics.sources?.scan_records || 0 },
              { source: 'fan_engagement_tasks', label: 'Fan engagement tasks', count: readModel.contributionMetrics.sources?.fan_engagement_tasks || 0 },
            ]}
            columns={[
              { title: 'Source', dataIndex: 'label', key: 'label' },
              { title: 'Existing records counted', dataIndex: 'count', key: 'count' },
            ]}
            locale={{ emptyText: <Empty description="No contribution source records yet" /> }}
          />
        </Space>
      ),
    },
    {
      key: 'replenishment',
      label: 'Replenishment',
      children: (
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Button type="primary" onClick={openCreateReplenishment}>
            Create replenishment task
          </Button>
          <Table
            rowKey="id"
            dataSource={readModel.replenishmentTasks}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: <Empty description="No replenishment tasks yet" /> }}
            columns={[
              { title: 'Created at', dataIndex: 'created_at', key: 'created_at', render: formatDateTime },
              { title: 'Trigger', dataIndex: 'trigger_source', key: 'trigger_source' },
              { title: 'Item type', dataIndex: 'item_type', key: 'item_type' },
              { title: 'Requested quantity', dataIndex: 'requested_quantity', key: 'requested_quantity' },
              { title: 'Assigned rep', dataIndex: 'assigned_rep_id', key: 'assigned_rep_id', render: (value) => value || '-' },
              { title: 'Status', dataIndex: 'status', key: 'status', render: (value) => <Tag color={replenishColors[value] || 'default'}>{value || '-'}</Tag> },
              { title: 'Completed at', dataIndex: 'completed_at', key: 'completed_at', render: formatDateTime },
              { title: 'Completion photos', dataIndex: 'completion_photos', key: 'completion_photos', render: (value) => Number(value?.length || 0) },
              { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
              {
                title: 'Action',
                key: 'action',
                render: (_, record) => (
                  record.status === 'completed'
                    ? <Text type="secondary">Completed</Text>
                    : <Button size="small" onClick={() => openCompleteReplenishment(record)}>Complete replenishment</Button>
                ),
              },
            ]}
          />
        </Space>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="bg-radial-top s-store-detail-page" style={{ minHeight: '100vh', padding: 24 }}>
        <Space orientation="vertical" size={18} style={{ width: '100%' }}>
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/stores/s-stores')}>
              Back to S Store Management
            </Button>
            <Button icon={<ShopOutlined />} onClick={() => navigate(`/app/stores/${id}`)}>
              View Store Profile
            </Button>
          </Space>

          <Card className="crud-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={14}>
                <Text type="secondary">UWELL Brand Store detail</Text>
                <Title level={2} style={{ marginTop: 4, marginBottom: 8 }}>S Store Detail</Title>
                <Space wrap>
                  <Tag color={statusColors[store.s_store_status] || 'green'}>{store.s_store_status || 'active'}</Tag>
                  <Tag color="gold">{store.level || 'S'} level</Tag>
                  <Text type="secondary">{store.city || '-'} {store.country ? `, ${store.country}` : ''}</Text>
                </Space>
              </Col>
              <Col xs={24} lg={10}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Store">{store.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Became S">{formatDate(store.became_s_at)}</Descriptions.Item>
                  <Descriptions.Item label="Source">{store.s_store_source || 'selected_from_a_store'}</Descriptions.Item>
                  <Descriptions.Item label="Cooperation note">{store.cooperation_note || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          <Card
            className="crud-card"
            title="Status Operations"
            extra={<Text type="secondary">Reason is required and recorded in history/audit log.</Text>}
          >
            <Space wrap>
              {isDowngradedStore && <Tag color="red">Downgraded S Store recovery</Tag>}
              <Button danger disabled={!canDowngrade} onClick={() => openStatusOperation('downgrade')}>
                Downgrade to A
              </Button>
              <Button type="primary" disabled={!canRestore} onClick={() => openStatusOperation('restore')}>
                Restore to S
              </Button>
              <Text type="secondary">
                Available actions follow the existing Admin/Manager region permission rules.
              </Text>
            </Space>
          </Card>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Weekly Open-system" value={Number(readModel.latestWeekly?.open_system_sold_qty || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Weekly Disposable" value={Number(readModel.latestWeekly?.disposable_sold_qty || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Monthly Open-system" value={Number(readModel.latestMonthly?.open_system_sold_qty || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Monthly Disposable" value={Number(readModel.latestMonthly?.disposable_sold_qty || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Brand Store Verifications" value={Number(readModel.contributionMetrics.verifiedActivityCount || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Reward Pickups" value={Number(readModel.contributionMetrics.rewardPickupCount || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Store-linked Scans" value={Number(readModel.contributionMetrics.storeScanCount || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Campaign Contribution" value={Number(readModel.contributionMetrics.campaignContributionCount || 0)} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Product Low Stock" value={readModel.latestProductInventory?.low_stock ? 'Yes' : 'No'} prefix={<WarningOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Material Low Stock" value={readModel.latestMaterialInventory?.low_stock ? 'Yes' : 'No'} prefix={<WarningOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Open Replenishment" value={readModel.openReplenishment.length} prefix={<InboxOutlined />} /></Card></Col>
            <Col xs={24} sm={12} xl={6}><Card size="small"><Statistic title="Last Visit Status" value={readModel.latestVisit?.inventory_status || '-'} prefix={<HistoryOutlined />} /></Card></Col>
          </Row>

          <Card className="crud-card">
            <Tabs items={tabs} />
          </Card>
        </Space>

        <Modal
          title={operationType === 'downgrade' ? 'Downgrade to A' : 'Restore to S'}
          open={isOperationOpen}
          okText={operationType === 'downgrade' ? 'Confirm downgrade' : 'Confirm restore'}
          okButtonProps={{ danger: operationType === 'downgrade', disabled: !operationReason.trim() }}
          confirmLoading={operationSubmitting}
          onOk={handleStatusOperation}
          onCancel={closeStatusOperation}
          destroyOnHidden
        >
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Text type="secondary">
              This action uses the existing S Store status service and writes status history plus audit log records.
            </Text>
            <label>
              <Text strong>Reason</Text>
              <Input.TextArea
                value={operationReason}
                onChange={(event) => setOperationReason(event.target.value)}
                placeholder="Enter the business reason"
                autoSize={{ minRows: 3, maxRows: 5 }}
                maxLength={300}
                showCount
              />
            </label>
            <label>
              <Text strong>Note</Text>
              <Input.TextArea
                value={operationNote}
                onChange={(event) => setOperationNote(event.target.value)}
                placeholder="Optional operating note"
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={300}
                showCount
              />
            </label>
          </Space>
        </Modal>
        <Modal
          title={replenishmentOperationType === 'create' ? 'Create replenishment task' : 'Complete replenishment'}
          open={isReplenishmentOperationOpen}
          okText={replenishmentOperationType === 'create' ? 'Create task' : 'Complete task'}
          confirmLoading={replenishmentSubmitting}
          onOk={handleReplenishmentOperation}
          onCancel={closeReplenishmentOperation}
          destroyOnHidden
        >
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            {replenishmentOperationType === 'create' ? (
              <>
                <label>
                  <Text strong>Trigger source</Text>
                  <Select
                    value={replenishmentForm.trigger_source}
                    onChange={(value) => updateReplenishmentForm('trigger_source', value)}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'manual', label: 'manual' },
                      { value: 'low_stock', label: 'low_stock' },
                      { value: 'field_visit', label: 'field_visit' },
                      { value: 'store_request', label: 'store_request' },
                    ]}
                  />
                </label>
                <label>
                  <Text strong>Item type</Text>
                  <Select
                    value={replenishmentForm.item_type}
                    onChange={(value) => updateReplenishmentForm('item_type', value)}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'open_system', label: 'open_system' },
                      { value: 'disposable', label: 'disposable' },
                      { value: 'material', label: 'material' },
                    ]}
                  />
                </label>
                <label>
                  <Text strong>Requested quantity</Text>
                  <InputNumber
                    min={1}
                    value={replenishmentForm.requested_quantity}
                    onChange={(value) => updateReplenishmentForm('requested_quantity', value || 1)}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <Text strong>Assigned rep</Text>
                  <Input
                    value={replenishmentForm.assigned_rep_id}
                    onChange={(event) => updateReplenishmentForm('assigned_rep_id', event.target.value)}
                    placeholder="assigned_rep_id"
                    maxLength={80}
                  />
                </label>
              </>
            ) : (
              <label>
                <Text strong>Completion photos</Text>
                <Input.TextArea
                  value={replenishmentForm.completion_photos}
                  onChange={(event) => updateReplenishmentForm('completion_photos', event.target.value)}
                  placeholder="Paste one completion photo reference per line"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </label>
            )}
            <label>
              <Text strong>Note</Text>
              <Input.TextArea
                value={replenishmentForm.note}
                onChange={(event) => updateReplenishmentForm('note', event.target.value)}
                placeholder="Optional operating note"
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={300}
                showCount
              />
            </label>
          </Space>
        </Modal>
        <Modal
          title="Correct record"
          open={isCorrectionOpen}
          okText="Save correction"
          confirmLoading={correctionSubmitting}
          okButtonProps={{ disabled: !correctionForm.correction_reason.trim() }}
          onOk={handleCorrection}
          onCancel={closeCorrection}
          destroyOnHidden
        >
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Text type="secondary">
              Correction keeps the submitted history locked and records correction metadata plus Audit Log.
            </Text>
            {correctionType === 'sell-through' && (
              <>
                <label>
                  <Text strong>Period type</Text>
                  <Select
                    value={correctionForm.period_type}
                    onChange={(value) => updateCorrectionForm('period_type', value)}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'weekly', label: 'weekly' },
                      { value: 'monthly', label: 'monthly' },
                    ]}
                  />
                </label>
                <label>
                  <Text strong>Period start</Text>
                  <Input
                    value={correctionForm.period_start}
                    onChange={(event) => updateCorrectionForm('period_start', event.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </label>
                <label>
                  <Text strong>Period end</Text>
                  <Input
                    value={correctionForm.period_end}
                    onChange={(event) => updateCorrectionForm('period_end', event.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </label>
                <label>
                  <Text strong>Open-system sold</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.open_system_sold_qty}
                    onChange={(value) => updateCorrectionForm('open_system_sold_qty', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <Text strong>Disposable sold</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.disposable_sold_qty}
                    onChange={(value) => updateCorrectionForm('disposable_sold_qty', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
              </>
            )}
            {correctionType === 'product-inventory' && (
              <>
                <label>
                  <Text strong>Open current</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.open_system_current_stock}
                    onChange={(value) => updateCorrectionForm('open_system_current_stock', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <Text strong>Open target</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.open_system_target_stock}
                    onChange={(value) => updateCorrectionForm('open_system_target_stock', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <Text strong>Disposable current</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.disposable_current_stock}
                    onChange={(value) => updateCorrectionForm('disposable_current_stock', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <Text strong>Disposable target</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.disposable_target_stock}
                    onChange={(value) => updateCorrectionForm('disposable_target_stock', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
              </>
            )}
            {correctionType === 'material-inventory' && (
              <>
                <label>
                  <Text strong>Material type</Text>
                  <Input
                    value={correctionForm.material_type}
                    onChange={(event) => updateCorrectionForm('material_type', event.target.value)}
                  />
                </label>
                <label>
                  <Text strong>Current quantity</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.current_quantity}
                    onChange={(value) => updateCorrectionForm('current_quantity', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <Text strong>Target quantity</Text>
                  <InputNumber
                    min={0}
                    value={correctionForm.target_quantity}
                    onChange={(value) => updateCorrectionForm('target_quantity', value || 0)}
                    style={{ width: '100%' }}
                  />
                </label>
              </>
            )}
            <label>
              <Text strong>Correction reason</Text>
              <Input.TextArea
                value={correctionForm.correction_reason}
                onChange={(event) => updateCorrectionForm('correction_reason', event.target.value)}
                placeholder="Correction reason is required"
                autoSize={{ minRows: 3, maxRows: 5 }}
                maxLength={300}
                showCount
              />
            </label>
            <label>
              <Text strong>Correction note</Text>
              <Input.TextArea
                value={correctionForm.correction_note}
                onChange={(event) => updateCorrectionForm('correction_note', event.target.value)}
                placeholder="Optional correction note"
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={300}
                showCount
              />
            </label>
          </Space>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default SStoreDetailPage;
