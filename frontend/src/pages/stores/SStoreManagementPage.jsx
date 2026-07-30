import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Input, Select, Space, Switch, Table, Tag, Typography, Button } from 'antd';
import {
  EyeOutlined,
  InboxOutlined,
  StarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  getReplenishmentTasks,
  getSStoreInventoryHistory,
  getSStoreMaterialInventoryHistory,
  getSStoreContributionMetrics,
  getSStores,
  getSStoreSellThroughHistory,
  getSStoreVisitDetails,
} from '../../services/api';
import localDb from '../../services/db/localDb';
import useAuthStore from '../../stores/authStore';
import { canViewCompanyScope, getAssignedRegion } from '../../utils/uwellRoleAccess';

const { Text, Title } = Typography;

const statusColors = {
  active: 'green',
  needs_follow_up: 'orange',
  paused: 'default',
  downgraded: 'red',
  under_review: 'blue',
};

const sStoreStatusLabels = {
  active: '正常合作',
  needs_follow_up: '需要跟进',
  paused: '暂停观察',
  downgraded: '已降级',
  under_review: '评估中',
};

const replenishStatusOptions = [
  { label: '全部补货状态', value: 'all' },
  { label: '只看待补货', value: 'pending' },
  { label: '只看处理中', value: 'in_progress' },
  { label: '只看已完成', value: 'completed' },
];

const sStoreHandoffQueue = [
  ['低库存 -> 地推补货', '结合待补货任务和库存历史推动地推跟进。'],
  ['缺少拜访 -> 地推检查', '进入 S 店详情查看证据、拜访记录、照片和市场反馈。'],
  ['已降级 -> 经理复盘', '保留降级历史，再决定后续是否重新评估。'],
];

const sumSellThrough = (rows, periodType, field) => rows
  .filter((item) => item.period_type === periodType)
  .reduce((sum, item) => sum + Number(item[field] || 0), 0);

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '-';
  }
};

const latestByDate = (rows, field = 'submitted_at') => rows
  .slice()
  .sort((a, b) => new Date(b[field] || b.created_at || 0) - new Date(a[field] || a.created_at || 0))[0] || null;

const getSStoreFollowUpStatus = (row) => {
  if (row.s_store_status === 'downgraded') return { label: '恢复评估', color: 'red' };
  if (row.hasLowStock || row.pendingReplenishmentCount > 0) return { label: '补货跟进', color: 'orange' };
  if (!row.lastVisit) return { label: '地推拜访检查', color: 'blue' };
  return { label: '健康跟进', color: 'green' };
};

const getSStoreFollowUpClassName = (row) => {
  if (row.s_store_status === 'downgraded') return { className: 'is-risk' };
  if (row.hasLowStock || row.pendingReplenishmentCount > 0) return { className: 'is-warning' };
  if (!row.lastVisit) return { className: 'is-warning' };
  return { className: 'is-good' };
};

const emptyContribution = {
  verifiedActivityCount: 0,
  rewardPickupCount: 0,
  storeScanCount: 0,
  campaignContributionCount: 0,
  contributedPoints: 0,
};

function buildSStoreRow({ store, sellThrough, productInventory, materialInventory, visits, replenishmentTasks, contributionMetrics }) {
  const storeSellThrough = sellThrough.filter((item) => item.store_id === store.id);
  const storeProductInventory = productInventory.filter((item) => item.store_id === store.id);
  const storeMaterialInventory = materialInventory.filter((item) => item.store_id === store.id);
  const storeVisits = visits.filter((item) => item.store_id === store.id);
  const storeTasks = replenishmentTasks.filter((item) => item.store_id === store.id);
  const contribution = contributionMetrics.find((item) => item.store_id === store.id) || emptyContribution;
  const latestWeekly = latestByDate(storeSellThrough.filter((item) => item.period_type === 'weekly'));
  const latestMonthly = latestByDate(storeSellThrough.filter((item) => item.period_type === 'monthly'));
  const latestInventory = latestByDate(storeProductInventory);
  const latestMaterial = latestByDate(storeMaterialInventory);
  const lastVisit = latestByDate(storeVisits);
  const pendingTasks = storeTasks.filter((item) => item.status !== 'completed');

  return {
    ...store,
    latestWeekly,
    latestMonthly,
    latestInventory,
    latestMaterial,
    lastVisit,
    pendingTasks,
    contribution,
    pendingReplenishmentCount: pendingTasks.length,
    hasLowStock: Boolean(latestInventory?.low_stock || latestMaterial?.low_stock),
  };
}

const SStoreManagementPage = () => {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const savedProfileId = localStorage.getItem('store_manager_current_user');
  const activeProfile = useMemo(
    () => localDb.findById('profiles', savedProfileId) || profile || null,
    [profile, savedProfileId],
  );
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(undefined);
  const [city, setCity] = useState(undefined);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [includeDowngraded, setIncludeDowngraded] = useState(false);
  const [replenishmentStatus, setReplenishmentStatus] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['s-store-management-read-model'],
    queryFn: async () => {
      const stores = await getSStores({ includeDowngraded: true });
      const [sellThroughGroups, productInventoryGroups, materialInventoryGroups, visitGroups, contributionGroups, replenishmentTasks] = await Promise.all([
        Promise.all(stores.map((store) => getSStoreSellThroughHistory(store.id))),
        Promise.all(stores.map((store) => getSStoreInventoryHistory(store.id))),
        Promise.all(stores.map((store) => getSStoreMaterialInventoryHistory(store.id))),
        Promise.all(stores.map((store) => getSStoreVisitDetails(store.id))),
        Promise.all(stores.map((store) => getSStoreContributionMetrics(store.id))),
        getReplenishmentTasks({}),
      ]);
      return {
        stores,
        sellThrough: sellThroughGroups.flat(),
        productInventory: productInventoryGroups.flat(),
        materialInventory: materialInventoryGroups.flat(),
        visits: visitGroups.flat(),
        contributionMetrics: contributionGroups,
        replenishmentTasks,
      };
    },
  });

  const readModel = useMemo(() => {
    const source = data || {
      stores: [],
      sellThrough: [],
      productInventory: [],
      materialInventory: [],
      visits: [],
      contributionMetrics: [],
      replenishmentTasks: [],
    };
    const rows = source.stores.map((store) => buildSStoreRow({
      store,
      sellThrough: source.sellThrough,
      productInventory: source.productInventory,
      materialInventory: source.materialInventory,
      visits: source.visits,
      contributionMetrics: source.contributionMetrics,
      replenishmentTasks: source.replenishmentTasks,
    }));
    return { ...source, rows };
  }, [data]);

  const visibleRows = useMemo(() => {
    let rows = readModel.rows;
    if (!canViewCompanyScope(activeProfile)) {
      const assignedRegion = getAssignedRegion(activeProfile);
      rows = rows.filter((store) => !assignedRegion || store.city === assignedRegion || store.region === assignedRegion);
    }
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      rows = rows.filter((store) => [store.name, store.city, store.s_store_status].join(' ').toLowerCase().includes(needle));
    }
    if (status) rows = rows.filter((store) => store.s_store_status === status);
    if (!includeDowngraded) rows = rows.filter((store) => store.s_store_status !== 'downgraded');
    if (city) rows = rows.filter((store) => store.city === city);
    if (lowStockOnly) rows = rows.filter((store) => store.hasLowStock);
    if (replenishmentStatus !== 'all') {
      rows = rows.filter((store) => (
        replenishmentStatus === 'pending'
          ? store.pendingTasks.some((task) => task.status === 'pending')
          : store.pendingTasks.some((task) => task.status === replenishmentStatus)
            || readModel.replenishmentTasks.some((task) => task.store_id === store.id && task.status === replenishmentStatus)
      ));
    }
    return rows;
  }, [activeProfile, city, includeDowngraded, lowStockOnly, readModel.replenishmentTasks, readModel.rows, replenishmentStatus, search, status]);

  const recoveryRows = useMemo(
    () => readModel.rows.filter((store) => store.s_store_status === 'downgraded'),
    [readModel.rows],
  );
  const overview = useMemo(() => ({
    active: visibleRows.filter((store) => store.s_store_status === 'active').length,
    downgraded: recoveryRows.length,
    lowStock: visibleRows.filter((store) => store.hasLowStock).length,
    pendingReplenishment: visibleRows.reduce((sum, store) => sum + store.pendingReplenishmentCount, 0),
    weeklyOpen: sumSellThrough(readModel.sellThrough.filter((item) => visibleRows.some((store) => store.id === item.store_id)), 'weekly', 'open_system_sold_qty'),
    weeklyDisposable: sumSellThrough(readModel.sellThrough.filter((item) => visibleRows.some((store) => store.id === item.store_id)), 'weekly', 'disposable_sold_qty'),
    monthlyOpen: sumSellThrough(readModel.sellThrough.filter((item) => visibleRows.some((store) => store.id === item.store_id)), 'monthly', 'open_system_sold_qty'),
    monthlyDisposable: sumSellThrough(readModel.sellThrough.filter((item) => visibleRows.some((store) => store.id === item.store_id)), 'monthly', 'disposable_sold_qty'),
    verifiedActivityCount: visibleRows.reduce((sum, store) => sum + Number(store.contribution?.verifiedActivityCount || 0), 0),
    rewardPickupCount: visibleRows.reduce((sum, store) => sum + Number(store.contribution?.rewardPickupCount || 0), 0),
    storeScanCount: visibleRows.reduce((sum, store) => sum + Number(store.contribution?.storeScanCount || 0), 0),
  }), [readModel.sellThrough, recoveryRows.length, visibleRows]);

  const cityOptions = useMemo(
    () => [...new Set(readModel.rows.map((store) => store.city).filter(Boolean))]
      .map((value) => ({ label: value, value })),
    [readModel.rows],
  );
  const statusOptions = useMemo(
    () => [...new Set(readModel.rows.map((store) => store.s_store_status).filter(Boolean))]
      .map((value) => ({ label: sStoreStatusLabels[value] || value, value })),
    [readModel.rows],
  );

  const criticalMetrics = [
    { label: '正常S店', value: overview.active, icon: <StarOutlined />, tone: 'is-good' },
    { label: '低库存S店', value: overview.lowStock, icon: <WarningOutlined />, tone: overview.lowStock ? 'is-risk' : 'is-good' },
    { label: '待补货任务', value: overview.pendingReplenishment, icon: <InboxOutlined />, tone: overview.pendingReplenishment ? 'is-warning' : 'is-good' },
    { label: '已降级S店', value: overview.downgraded, icon: <WarningOutlined />, tone: overview.downgraded ? 'is-risk' : 'is-good' },
  ];

  const secondaryMetrics = [
    ['周开放式动销', overview.weeklyOpen],
    ['周一次性动销', overview.weeklyDisposable],
    ['月开放式动销', overview.monthlyOpen],
    ['月一次性动销', overview.monthlyDisposable],
    ['品牌店活动核销', overview.verifiedActivityCount],
    ['奖励领取', overview.rewardPickupCount],
    ['门店关联扫码', overview.storeScanCount],
    ['可见品牌店', visibleRows.length],
  ];

  const columns = [
    {
      title: '门店',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 240,
      render: (value, record) => (
        <Space orientation="vertical" size={0} className="s-store-primary-cell">
          <Text strong>{value}</Text>
          <Text type="secondary">{record.s_store_source || 'selected_from_a_store'}</Text>
        </Space>
      ),
    },
    { title: '城市', dataIndex: 'city', key: 'city', width: 120 },
    {
      title: 'S状态',
      dataIndex: 's_store_status',
      key: 's_store_status',
      width: 130,
      render: (value) => (
        <div className={`s-store-status-cell ${value === 'downgraded' ? 'is-risk' : value === 'needs_follow_up' ? 'is-warning' : 'is-good'}`}>
          <Tag color={statusColors[value] || 'default'}>{sStoreStatusLabels[value] || '正常合作'}</Tag>
        </div>
      ),
    },
    { title: '成为S店时间', dataIndex: 'became_s_at', key: 'became_s_at', width: 130, render: formatDate },
    {
      title: '周动销',
      key: 'weekly',
      width: 190,
      render: (_, record) => (
        <Text className="s-store-compact-value-cell">{Number(record.latestWeekly?.open_system_sold_qty || 0)} 开放式 / {Number(record.latestWeekly?.disposable_sold_qty || 0)} 一次性</Text>
      ),
    },
    {
      title: '月动销',
      key: 'monthly',
      width: 200,
      render: (_, record) => (
        <Text className="s-store-compact-value-cell">{Number(record.latestMonthly?.open_system_sold_qty || 0)} 开放式 / {Number(record.latestMonthly?.disposable_sold_qty || 0)} 一次性</Text>
      ),
    },
    {
      title: '产品库存',
      key: 'productStock',
      width: 180,
      render: (_, record) => (
        <div className={`s-store-stock-cell ${record.hasLowStock ? 'is-risk' : 'is-good'}`}>
          <Text>{Number(record.latestInventory?.open_system_current_stock || 0)} / {Number(record.latestInventory?.open_system_target_stock || 0)} 开放式</Text>
          <Text type={record.latestInventory?.low_stock ? 'danger' : 'secondary'}>
            {Number(record.latestInventory?.disposable_current_stock || 0)} / {Number(record.latestInventory?.disposable_target_stock || 0)} 一次性
          </Text>
        </div>
      ),
    },
    {
      title: '物料库存',
      key: 'materialStock',
      width: 150,
      render: (_, record) => (
        record.latestMaterial
          ? (
              <div className={`s-store-stock-cell ${record.latestMaterial.low_stock ? 'is-risk' : 'is-good'}`}>
                <Tag color={record.latestMaterial.low_stock ? 'red' : 'green'}>{record.latestMaterial.material_type || 'material'} {record.latestMaterial.current_quantity}/{record.latestMaterial.target_quantity}</Tag>
              </div>
            )
          : <Text type="secondary">-</Text>
      ),
    },
    {
      title: '补货状态',
      key: 'replenishment',
      width: 150,
      render: (_, record) => (
        <div className={`s-store-status-cell ${record.pendingReplenishmentCount ? 'is-warning' : 'is-good'}`}>
          {record.pendingReplenishmentCount
            ? <Tag color="orange">{record.pendingReplenishmentCount} 个待处理</Tag>
            : <Tag color="green">正常</Tag>}
        </div>
      ),
    },
    {
      title: '跟进状态',
      key: 'followUpStatus',
      width: 170,
      render: (_, record) => {
        const followUpStatus = { ...getSStoreFollowUpStatus(record), ...getSStoreFollowUpClassName(record) };
        return (
          <div className={`s-store-status-cell ${followUpStatus.className}`}>
            <Tag color={followUpStatus.color}>{followUpStatus.label}</Tag>
          </div>
        );
      },
    },
    {
      title: '闭环贡献',
      key: 'contribution',
      width: 190,
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text>{Number(record.contribution?.verifiedActivityCount || 0)} 次核销 / {Number(record.contribution?.rewardPickupCount || 0)} 次领取</Text>
          <Text type="secondary">{Number(record.contribution?.storeScanCount || 0)} 次门店扫码</Text>
        </Space>
      ),
    },
    {
      title: '最近拜访',
      key: 'lastVisit',
      width: 190,
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text>{record.lastVisit?.inventory_status || '-'}</Text>
          <Text type="secondary">{record.lastVisit?.support_needed || record.lastVisit?.market_notes || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/app/stores/s-stores/${record.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="s-store-management-page admin-operator-console-page">
      <Space orientation="vertical" size={18} className="s-store-page-stack" style={{ width: '100%' }}>
        <section className="s-store-command-band">
          <div className="s-store-command-head">
            <Text type="secondary">UWELL品牌店运营</Text>
            <Title level={2} style={{ marginTop: 4, marginBottom: 0 }}>S店管理</Title>
            <span className="s-store-table-note">补货、拜访、降级或恢复评估前，先进入 S 店详情查看证据。</span>
          </div>

          <div className="s-store-critical-metrics">
            {criticalMetrics.map((metric) => (
              <div className={`s-store-metric-tile ${metric.tone}`} key={metric.label}>
                <span>{metric.icon}</span>
                <strong>{metric.value}</strong>
                <em>{metric.label}</em>
              </div>
            ))}
          </div>

          <div className="s-store-followup-strip s-store-handoff-queue">
            <span className="s-store-followup-title">S店跟进交接</span>
            {sStoreHandoffQueue.map(([title, desc]) => (
              <div className="admin-ops-mini-card" key={title}>
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            ))}
          </div>

          <div className="s-store-secondary-metrics">
            {secondaryMetrics.map(([label, value]) => (
              <span key={label}><strong>{value}</strong>{label}</span>
            ))}
          </div>
        </section>

        <Card className="admin-operator-filter-card admin-operator-table-card">
          <Space wrap className="s-store-filter-toolbar" style={{ marginBottom: 16 }}>
            <Input.Search
              placeholder="搜索S店"
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 240 }}
            />
            <Select placeholder="S状态" allowClear value={status} onChange={setStatus} options={statusOptions} style={{ width: 180 }} />
            <Select placeholder="城市" allowClear value={city} onChange={setCity} options={cityOptions} style={{ width: 160 }} />
            <Select
              placeholder="补货状态"
              value={replenishmentStatus}
              onChange={setReplenishmentStatus}
              options={replenishStatusOptions}
              style={{ width: 210 }}
            />
            <Space>
              <Switch checked={lowStockOnly} onChange={setLowStockOnly} />
              <Text>只看低库存</Text>
            </Space>
            <Space>
              <Switch checked={includeDowngraded} onChange={setIncludeDowngraded} />
              <Text>包含已降级</Text>
            </Space>
          </Space>

          <div className="s-store-table-scroll-region">
            <div className="admin-trial-wide-table">
              <Table
                rowKey="id"
                loading={isLoading}
                dataSource={visibleRows}
                columns={columns}
                scroll={{ x: 2360 }}
                tableLayout="fixed"
                locale={{ emptyText: <Empty description="未找到S店记录" /> }}
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            </div>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default SStoreManagementPage;
