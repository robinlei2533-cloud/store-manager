import useLanguageStore from '../../stores/languageStore';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Button, DatePicker, Select, Space, Tag, Empty, Card, Tabs, Row, Col, Typography } from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getVisits } from '../../services/api';
import PageTransition from "../../components/common/PageTransition";
import useAuthStore from '../../stores/authStore';
import { canViewCompanyScope } from '../../utils/uwellRoleAccess';

const { Text } = Typography;

const fieldVisitTabs = [
  {
    key: 'new-store',
    label: '新店拜访',
    steps: [
      '创建门店档案',
      '上传门头、货架、柜台、UWELL 陈列和竞品证据',
      '用标准评级表给门店打分',
      '系统生成建议等级：S / A / B / C',
      'Manager 审核，Admin 确认最终等级',
    ],
    cta: '开始新店拜访',
  },
  {
    key: 'repeat',
    label: '复访',
    steps: [
      '选择已有门店',
      '更新门店陈列照片',
      '更新库存、SKU、竞品和活动执行情况',
      '记录问题和下一步动作',
      '必要时触发等级重新评估',
    ],
    cta: '开始复访',
  },
  {
    key: 'records',
    label: '拜访记录',
    steps: [
      '按新店拜访、复访、地推、城市、门店等级、建议等级、最终等级、待审核和拜访日期筛选',
      '保留原始地推提交记录用于审核',
    ],
    cta: '查看记录',
  },
  {
    key: 'display',
    label: '陈列数据',
    steps: [
      '追踪 UWELL SKU 清单、陈列位置、货架层数、灯箱、海报、展架、竞品陈列强度和物料需求',
      '用证据判断 A/S 曝光准备度',
    ],
    cta: '查看陈列数据',
  },
];

const fieldVisitCommandSummary = [
  {
    title: '新店发现',
    metric: '新店拜访',
    desc: 'Rep 创建档案、上传证据、评估 S/A/B/C 潜力，然后提交审核。',
  },
  {
    title: '复访跟进',
    metric: '复访',
    desc: 'Rep 更新陈列、库存、活动执行、问题和下一步动作。',
  },
  {
    title: '等级审核队列',
    metric: '待审核',
    desc: 'Rep 提交证据和建议等级，Manager/Admin 确认最终等级。',
  },
  {
    title: '粉丝曝光联动',
    metric: '建议升级',
    desc: '已确认的 S/A 门店可进入粉丝首页推荐和门店地图高亮。',
  },
];

const sStoreFieldExecutionItems = [
  {
    title: '库存和陈列检查',
    desc: 'S 店复访需要记录库存状态、陈列状态和所需支持。',
  },
  {
    title: '竞品和市场情报',
    desc: '记录竞品情况、热卖品牌、热卖口味、消费者反馈和市场备注。',
  },
  {
    title: '补货证据',
    desc: '需要补货时附上拜访照片，并留下清晰下一步动作，方便后台跟进。',
  },
  {
    title: '后台可见性',
    desc: '正常保存拜访后，后台 S 店管理可看到提交的拜访详情。',
  },
];

const levelOrder = ['C', 'B', 'A', 'S'];
const levelColorMap = { S: 'gold', A: 'green', B: 'blue', C: 'default' };

const normalizeVisitType = (visit, firstVisitByStore) => {
  if (['new_store', 'new'].includes(visit.visit_type) || visit.new_store_profile?.store_name) return 'new_store';
  if (['repeat_visit', 'repeat'].includes(visit.visit_type) || visit.repeat_visit_summary?.purpose) return 'repeat_visit';
  return firstVisitByStore.get(visit.store_id) === visit.id ? 'new_store' : 'repeat_visit';
};

const normalizeReviewStatus = (visit) => {
  if (visit.final_level || visit.level_review_status === 'approved') return 'confirmed';
  if (visit.level_review_status === 'rejected') return 'rejected';
  if (['pending_review', 'submitted', 'submitted_for_review', 'manager_admin_review'].includes(visit.status)) return 'pending_review';
  if (['submitted_for_review', 'manager_admin_review'].includes(visit.suggested_level_status)) return 'pending_review';
  if (visit.suggested_level && visit.suggested_level !== visit.stores?.level) return 'pending_review';
  return 'record_only';
};

const getVisitStoreName = (visit) => visit.stores?.name || visit.new_store_profile?.store_name || visit.store_name || visit.store_id || '-';
const getVisitCity = (visit) => visit.stores?.city || visit.new_store_profile?.city || visit.city || '-';
const getVisitRegion = (visit) => visit.stores?.region || visit.stores?.city || visit.new_store_profile?.city || visit.region || '-';
const getSuggestedLevel = (visit) => visit.suggested_level || visit.suggested_store_level || visit.rating_result?.suggested_level || visit.evaluation?.suggested_level || '-';
const getFinalLevel = (visit) => visit.final_level || visit.stores?.level || '-';
const getNextAction = (visit) => visit.next_action || visit.repeat_visit_summary?.next_action || visit.display_data?.material_needs || visit.notes || '-';
const getSStoreVisitDetail = (visit) => visit.s_store_visit_detail || visit.s_store_visit_details?.[0] || visit.sStoreVisitDetail || null;
const getSStoreFollowUp = (visit, finalLevel) => {
  const detail = getSStoreVisitDetail(visit);
  const isSStore = Boolean(detail || visit.stores?.is_s_store || finalLevel === 'S');
  if (!isSStore) return { value: 'not_s_store', label: '非 S 店' };
  if (detail) return { value: 'submitted', label: 'S 店拜访已提交' };
  return { value: 's_store_missing_detail', label: 'S 店跟进缺少详情' };
};
const getReplenishmentVisibility = (visit) => {
  const detail = getSStoreVisitDetail(visit);
  if (detail?.replenishment_needed === true) return { value: 'needed', label: '需要补货' };
  if (detail?.replenishment_needed === false) return { value: 'not_needed', label: '无需补货标记' };
  return { value: 'unknown', label: '无 S 店详情' };
};

const buildVisitRows = (visits) => {
  const sortedByStoreDate = [...visits].sort((a, b) => new Date(a.visit_date || a.created_at || 0) - new Date(b.visit_date || b.created_at || 0));
  const firstVisitByStore = new Map();
  sortedByStoreDate.forEach((visit) => {
    if (visit.store_id && !firstVisitByStore.has(visit.store_id)) firstVisitByStore.set(visit.store_id, visit.id);
  });

  return visits.map((visit) => {
    const visitType = normalizeVisitType(visit, firstVisitByStore);
    const reviewStatus = normalizeReviewStatus(visit);
    const suggestedLevel = getSuggestedLevel(visit);
    const finalLevel = getFinalLevel(visit);
    const sStoreFollowUp = getSStoreFollowUp(visit, finalLevel);
    const replenishmentVisibility = getReplenishmentVisibility(visit);
    return {
      ...visit,
      visitType,
      visitTypeLabel: visitType === 'new_store' ? '新店拜访' : '复访',
      regionLabel: getVisitRegion(visit),
      cityLabel: getVisitCity(visit),
      currentLevel: visit.stores?.level || '-',
      suggestedLevel,
      finalLevel,
      reviewStatus,
      reviewStatusLabel: {
        pending_review: '待审核',
        confirmed: '最终已确认',
        rejected: '已拒绝',
        record_only: '仅记录',
      }[reviewStatus],
      nextAction: getNextAction(visit),
      sStoreFollowUp: sStoreFollowUp.value,
      sStoreFollowUpLabel: sStoreFollowUp.label,
      replenishmentVisibility: replenishmentVisibility.value,
      replenishmentVisibilityLabel: replenishmentVisibility.label,
      needsUpgradeReview: levelOrder.indexOf(suggestedLevel) > levelOrder.indexOf(finalLevel),
    };
  });
};

const VisitListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const profile = useAuthStore((state) => state.profile);
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState(undefined);
  const [visitType, setVisitType] = useState(undefined);
  const [region, setRegion] = useState(undefined);
  const [storeLevel, setStoreLevel] = useState(undefined);
  const [suggestedLevel, setSuggestedLevel] = useState(undefined);
  const [finalLevel, setFinalLevel] = useState(undefined);
  const [reviewStatus, setReviewStatus] = useState(undefined);
  const [sStoreFollowUp, setSStoreFollowUp] = useState(undefined);
  const [replenishmentVisibility, setReplenishmentVisibility] = useState(undefined);

  const { RangePicker } = DatePicker;

  const filters = {};
  if (!canViewCompanyScope(profile) && profile?.id) filters.rep_id = profile.id;
  if (status) filters.status = status;
  if (dateRange && dateRange[0] && dateRange[1]) {
    filters.date_from = dateRange[0].format('YYYY-MM-DD');
    filters.date_to = dateRange[1].format('YYYY-MM-DD');
  }

  const { data: visits = [], isLoading } = useQuery({ queryKey: ['visits', filters], queryFn: () => getVisits(filters) });

  const visitRows = useMemo(() => buildVisitRows(visits), [visits]);
  const regionOptions = useMemo(
    () => [...new Set(visitRows.map((item) => item.regionLabel).filter((item) => item && item !== '-'))].map((item) => ({ label: item, value: item })),
    [visitRows],
  );
  const filteredRows = useMemo(() => visitRows.filter((item) => {
    if (visitType && item.visitType !== visitType) return false;
    if (region && item.regionLabel !== region) return false;
    if (storeLevel && item.currentLevel !== storeLevel) return false;
    if (suggestedLevel && item.suggestedLevel !== suggestedLevel) return false;
    if (finalLevel && item.finalLevel !== finalLevel) return false;
    if (reviewStatus && item.reviewStatus !== reviewStatus) return false;
    if (sStoreFollowUp === 'all_s_store' && item.sStoreFollowUp === 'not_s_store') return false;
    if (sStoreFollowUp && sStoreFollowUp !== 'all_s_store' && item.sStoreFollowUp !== sStoreFollowUp) return false;
    if (replenishmentVisibility && item.replenishmentVisibility !== replenishmentVisibility) return false;
    return true;
  }), [visitRows, visitType, region, storeLevel, suggestedLevel, finalLevel, reviewStatus, sStoreFollowUp, replenishmentVisibility]);

  const summary = useMemo(() => ({
    total: filteredRows.length,
    newStore: filteredRows.filter((item) => item.visitType === 'new_store').length,
    repeat: filteredRows.filter((item) => item.visitType === 'repeat_visit').length,
    pendingReview: filteredRows.filter((item) => item.reviewStatus === 'pending_review').length,
    suggestedUpgrade: filteredRows.filter((item) => item.needsUpgradeReview).length,
    sStoreFollowUp: filteredRows.filter((item) => item.sStoreFollowUp !== 'not_s_store').length,
    replenishmentNeeded: filteredRows.filter((item) => item.replenishmentVisibility === 'needed').length,
  }), [filteredRows]);

  const statusMap = {
    draft: { color: 'default', text: t('status_draft') },
    completed: { color: 'success', text: t('status_completed') },
    cancelled: { color: 'error', text: t('status_cancelled') },
  };

  const columns = [
    {
      title: '拜访类型',
      dataIndex: 'visitTypeLabel',
      key: 'visitType',
      width: 150,
      render: (label, record) => <Tag color={record.visitType === 'new_store' ? 'lime' : 'geekblue'}>{label}</Tag>,
    },
    { title: t('actions'), key: 'action', width: 76, render: (_, r) => <Button className="admin-visits-detail-button" type="link" size="small" icon={<EyeOutlined />} aria-label="View visit detail" title="View visit detail" onClick={() => navigate(`/app/visits/${r.id}`)}>{t('view')}</Button> },
    { title: t('store'), key: 'store', width: 220, render: (_, record) => (
      <div>
        <div style={{ fontWeight: 600 }}>{getVisitStoreName(record)}</div>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.cityLabel} / {record.regionLabel}</Text>
      </div>
    ) },
    { title: t('date'), dataIndex: 'visit_date', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
    { title: t('rep'), dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: '当前等级', dataIndex: 'currentLevel', key: 'currentLevel', width: 120, render: (level) => <Tag color={levelColorMap[level] || 'default'}>{level}</Tag> },
    { title: '建议等级', dataIndex: 'suggestedLevel', key: 'suggestedLevel', width: 130, render: (level) => <Tag color={levelColorMap[level] || 'default'}>{level}</Tag> },
    { title: '最终等级', dataIndex: 'finalLevel', key: 'finalLevel', width: 110, render: (level) => <Tag color={levelColorMap[level] || 'default'}>{level}</Tag> },
    {
      title: '审核',
      dataIndex: 'reviewStatusLabel',
      key: 'review',
      width: 140,
      render: (label, record) => <Tag color={record.reviewStatus === 'pending_review' ? 'orange' : record.reviewStatus === 'confirmed' ? 'green' : 'default'}>{label}</Tag>,
    },
    {
      title: 'S 店跟进',
      dataIndex: 'sStoreFollowUpLabel',
      key: 'sStoreFollowUp',
      width: 190,
      render: (label, record) => <Tag color={record.sStoreFollowUp === 'submitted' ? 'lime' : record.sStoreFollowUp === 's_store_missing_detail' ? 'orange' : 'default'}>{label}</Tag>,
    },
    {
      title: '补货可见性',
      dataIndex: 'replenishmentVisibilityLabel',
      key: 'replenishmentVisibility',
      width: 190,
      render: (label, record) => <Tag color={record.replenishmentVisibility === 'needed' ? 'volcano' : record.replenishmentVisibility === 'not_needed' ? 'green' : 'default'}>{label}</Tag>,
    },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag> },
    { title: '下一步动作', dataIndex: 'nextAction', key: 'nextAction', ellipsis: true },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top admin-visits-page" style={{minHeight:"100vh",padding:24}}>
    <Card className="field-visit-command-strip admin-visits-ops-strip liquid-glass" style={{ marginBottom: 16 }}>
      <div className="field-visit-command-header">
        <div>
          <Text strong>地推拜访指挥台</Text>
          <p>新店拜访、复访、评级证据和曝光决策保持连接。</p>
        </div>
        <Tag color="gold">Manager/Admin 确认最终等级</Tag>
      </div>
      <div className="field-visit-command-grid admin-visits-ops-grid">
        {fieldVisitCommandSummary.map((item) => (
          <div className="field-visit-command-card" key={item.title}>
            <span>{item.metric}</span>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </Card>
    <Card className="field-s-store-execution-lane admin-visits-ops-strip liquid-glass" style={{ marginBottom: 16 }}>
      <div className="field-visit-command-header">
        <div>
          <Text strong>S 店跟进执行</Text>
          <p>地推把门店真实情况连接到 S 店健康度、补货和后台决策。</p>
        </div>
        <Tag color="lime">活跃 S 店使用复访</Tag>
      </div>
      <div className="field-visit-command-grid admin-visits-ops-grid">
        {sStoreFieldExecutionItems.map((item) => (
          <div className="field-visit-command-card" key={item.title}>
            <span>S Store</span>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </Card>
    <Card className="crud-card admin-visits-workbench-card liquid-glass" title="地推拜访工作台" style={{ marginBottom: 16 }}>
      <Tabs
        items={fieldVisitTabs.map((item) => ({
          key: item.key,
          label: item.label,
          children: (
            <Row gutter={[12, 12]}>
              <Col xs={24} lg={16}>
                <div style={{ display: 'grid', gap: 8 }}>
                  {item.steps.map((step, index) => (
                    <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <Tag color={index === item.steps.length - 1 ? 'gold' : 'blue'}>{index + 1}</Tag>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </Col>
              <Col xs={24} lg={8}>
                <Card size="small" title="审核规则">
                  <p style={{ marginTop: 0 }}>地推提交评分和建议等级，Manager 审核，Admin 带原因确认最终等级并写入审计日志。</p>
                  <Button type="primary" onClick={() => navigate('/app/visits/create')}>{item.cta}</Button>
                </Card>
              </Col>
            </Row>
          ),
        }))}
      />
    </Card>
    <Card className="crud-card admin-visits-management-card liquid-glass" title={t('visit_management_title')} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/visits/create')}>{t('new_visit')}</Button>}>
      <Row className="admin-visits-summary-grid" gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          ['总拜访数', summary.total, '#1677ff'],
          ['新店拜访', summary.newStore, '#ccff00'],
          ['复访', summary.repeat, '#722ed1'],
          ['待审核', summary.pendingReview, '#fa8c16'],
          ['建议升级', summary.suggestedUpgrade, '#FFD700'],
          ['S 店跟进', summary.sStoreFollowUp, '#8ac926'],
          ['需要补货', summary.replenishmentNeeded, '#ff4d4f'],
        ].map(([label, value, color]) => (
          <Col xs={12} sm={8} lg={4} key={label}>
            <Card size="small" className="dash-insight-card admin-visits-summary-card">
              <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
              <div style={{ color, fontSize: 24, fontWeight: 800 }}>{value}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <Space className="admin-visits-filter-grid" wrap style={{ marginBottom: 16 }}>
        <RangePicker value={dateRange} onChange={setDateRange} />
        <Select placeholder="拜访类型" value={visitType} onChange={setVisitType} allowClear style={{ width: 170 }} options={[
          { label: '新店拜访', value: 'new_store' },
          { label: '复访', value: 'repeat_visit' },
        ]} />
        <Select placeholder="区域" value={region} onChange={setRegion} allowClear style={{ width: 150 }} options={regionOptions} />
        <Select placeholder={t('status')} value={status} onChange={setStatus} allowClear style={{ width: 140 }} options={[
          { label: t('status_draft'), value: 'draft' }, { label: t('status_completed'), value: 'completed' }, { label: t('status_cancelled'), value: 'cancelled' },
        ]} />
        <Select placeholder="门店等级" value={storeLevel} onChange={setStoreLevel} allowClear style={{ width: 130 }} options={levelOrder.map((level) => ({ label: level, value: level }))} />
        <Select placeholder="建议等级" value={suggestedLevel} onChange={setSuggestedLevel} allowClear style={{ width: 150 }} options={levelOrder.map((level) => ({ label: level, value: level }))} />
        <Select placeholder="最终等级" value={finalLevel} onChange={setFinalLevel} allowClear style={{ width: 130 }} options={levelOrder.map((level) => ({ label: level, value: level }))} />
        <Select placeholder="审核状态" value={reviewStatus} onChange={setReviewStatus} allowClear style={{ width: 160 }} options={[
          { label: '待审核', value: 'pending_review' },
          { label: '最终已确认', value: 'confirmed' },
          { label: '已拒绝', value: 'rejected' },
          { label: '仅记录', value: 'record_only' },
        ]} />
        <Select placeholder="S 店跟进筛选" value={sStoreFollowUp} onChange={setSStoreFollowUp} allowClear style={{ width: 210 }} options={[
          { label: '全部 S 店拜访', value: 'all_s_store' },
          { label: '已提交 S 店拜访', value: 'submitted' },
          { label: 'S 店缺少详情', value: 's_store_missing_detail' },
          { label: '非 S 店', value: 'not_s_store' },
        ]} />
        <Select placeholder="补货可见性" value={replenishmentVisibility} onChange={setReplenishmentVisibility} allowClear style={{ width: 210 }} options={[
          { label: '需要补货', value: 'needed' },
          { label: '无补货标记', value: 'not_needed' },
          { label: '无 S 店详情', value: 'unknown' },
        ]} />
      </Space>
      <Table className="admin-visits-table" columns={columns} dataSource={filteredRows} rowKey="id" loading={isLoading} locale={{ emptyText: <Empty description={t('no_visits_found')} /> }} pagination={{ pageSize: 15, showTotal: (total) => `${t('total')} ${total}` }} scroll={{ x: 1550 }} />
    </Card>
    </div>
    </PageTransition>);
};

export default VisitListPage;

