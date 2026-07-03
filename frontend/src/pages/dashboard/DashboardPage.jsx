/*
 * UWELL CRM — 运营仪表盘增强建议
 *
 * 以下改进点可在后续迭代中添加到运营仪表盘，以提升数据洞察能力：
 *
 * 1. 今日新增粉丝数 (New Fans Today)
 *    - 在 StatCard 区域新增一张卡片，展示当日新增粉丝数
 *    - 数据源：getDashboardStats 返回 newFansToday 字段
 *    - 可与昨日对比显示增长趋势
 *
 * 2. 扫码转化率 (Scan Conversion Rate)
 *    - 计算: (今日扫码数 / 今日访问数) × 100%
 *    - 以百分比进度环或 StatCard 展示
 *    - 可附加 7 天平均转化率作为对比基线
 *
 * 3. 门店等级分布图 (Store Level Distribution)
 *    - 当前已有饼图展示门店等级分布 (levelPieData)
 *    - 建议增强：点击扇形可下钻查看该等级门店列表
 *    - 建议补充：显示各等级占比百分比标签
 *
 * 4. 7 天签到趋势 (7-Day Visit Trend)
 *    - 当前已有 30 天趋势图 (getVisitTrend)
 *    - 建议新增 7 天精简视图卡片，便于移动端快速查看
 *    - 数据源复用 visit-trend query，仅截取近 7 条
 *
 * 5. 物料库存预警列表 (Material Stock Alert List)
 *    - 当前 lowStockItems 已在物料卡片中展示
 *    - 建议增强：增加红色高亮动画、排序（按缺货严重程度）
 *    - 建议补充：一键下单补货按钮 / 导出预警清单
 *
 * 6. 扫码趋势与访问趋势关联分析 (Scan vs Visit Correlation)
 *    - 将 scanTrend 和 visitTrend 叠加到同一张复合图
 *    - 双 Y 轴，左轴访问数，右轴扫码数
 *
 * 7. 顶部统计卡片响应式布局优化
 *    - 当前 xs=12 在极小屏上每行 2 张卡片，可考虑 xs=24 单列模式
 *    - 卡片内字体大小在小屏上应自适应缩小
 *
 * 8. 热力图门店筛选与时间段过滤
 *    - 当前 heatmap 展示所有门店，建议增加按等级/区域筛选
 *    - 增加日期范围选择器，过滤指定时间段的访问数据
 */
import useLanguageStore from '../../stores/languageStore';
import React, { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
gsap.registerPlugin(useGSAP);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Table, Tag, Spin, Empty, Typography, Alert, List, Progress, Badge } from 'antd';
import {
  ShopOutlined, CameraOutlined, TeamOutlined,
  WarningOutlined, RiseOutlined, ThunderboltOutlined, QrcodeOutlined, StarOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

import { Button, message, DatePicker, Segmented } from 'antd';
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, EyeOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import localDb from "../../services/db/localDb";
import useAuthStore from '../../stores/authStore';
import {
  getDashboardStats, getVisitTrend, getStoreDistribution, getVisits,
  getCampaigns, getScanRecords, getMaterialStocks, getScanTrend, IS_LOCAL_MODE,
} from '../../services/api';
import { canViewCompanyScope, filterByAssignedStores, getAssignedStoreIds } from '../../utils/uwellRoleAccess';

import { useDashboardRealtime } from './useDashboardRealtime';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ============ 新增：数据对比计算工具 ============
const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getYesterdayCount = (records, dateField = 'visit_date') => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  return records.filter((r) => r[dateField] === yStr || r.created_at?.startsWith(yStr)).length;
};

const getLast7DaysCount = (records, dateField = 'visit_date') => {
  let count = 0;
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    count += records.filter((r) => r[dateField] === dStr || r.created_at?.startsWith(dStr)).length;
  }
  return count;
};

const getTodayCount = (records, dateField = 'visit_date') => {
  const todayStr = new Date().toISOString().split('T')[0];
  return records.filter((r) => r[dateField] === todayStr || r.created_at?.startsWith(todayStr)).length;
};

const exportToCSV = (data, filename, cols) => {
  if (!data || !data.length) { message?.warning?.('No data'); return; }
  const BOM = '\uFEFF';
  const header = cols.map(x => x.title).join(',');
  const rows = data.map(row =>
    cols.map(col => {
      let val;
      if (col.dataIndex && Array.isArray(col.dataIndex)) {
        val = col.dataIndex.reduce((o, k) => o?.[k], row);
      } else if (col.dataIndex) {
        val = row[col.dataIndex];
      } else {
        val = row[col.key];
      }
      return '"' + String(val ?? '') + '"';
    }).join(',')
  ).join('\n');
  const blob = new Blob([BOM + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 200);
};
const COLORS = ['#FFD700', '#FFD700', '#F5A623', '#D4A800', '#8B7500'];
const LEVEL_COLORS = { S: '#FFD700', A: '#FFD700', B: '#B8860B', C: '#8B7500', platinum: '#FFD700', gold: '#FFD700', silver: '#B8860B', bronze: '#8B7500' };

const SectionTitle = ({ children }) => (
  <div className="admin-section-title">
    <span>{children}</span>
  </div>
);

const ActionEmpty = ({ title, desc }) => (
  <div className="admin-action-empty">
    <div>
      <strong>{title}</strong>
      <span>{desc}</span>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color = '#FFD700', delay = 0 }) => {
  const cardRef = useRef(null);
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.6,
      delay: delay * 0.1,
      ease: 'power3.out',
      clearProps: 'all',
    });
  }, { scope: cardRef });
  
  useEffect(() => {
    if (!value) return;
    const start = performance.now();
    const duration = 1200;
    const numValue = parseInt(value) || 0;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(numValue * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div ref={cardRef} className="dash-stat-card liquid-glass">
      <div className="dash-stat-icon" style={{ color }}>{icon}</div>
      <div className="dash-stat-value text-gold-gradient">
        {typeof value === 'number' ? animatedValue.toLocaleString() : value}
      </div>
      <div className="dash-stat-label">{label}</div>
    </div>
  );
};

const StoreHeatmap = ({ stores, visitCounts, onStoreClick }) => {
  const mapRef = React.useRef(null);
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    if (!stores?.length || !containerRef.current) return;
    if (mapRef.current) {
      try {
        mapRef.current.off();
        mapRef.current.remove();
      } catch {
        // Leaflet can throw during rapid route teardown while tiles are still loading.
      }
      mapRef.current = null;
    }
    if (!containerRef.current.isConnected) return;
    const map = L.map(containerRef.current, { center: [24.7136, 46.6753], zoom: 10, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM', maxZoom: 18 }).addTo(map);
    const coords = [];
    stores.forEach(s => {
      const lat = parseFloat(s.lat), lng = parseFloat(s.lng);
      if (!lat || !lng || (lat === 0 && lng === 0)) return;
      coords.push([lat, lng]);
      const visits = (visitCounts?.[s.id]) || 0;
      const r = Math.max(8, Math.min(20, 6 + visits * 2));
      const color = '#FFD700';
      const m = L.circleMarker([lat, lng], { radius: r, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.7 });
      m.bindPopup('<b>' + s.name + '</b><br/>Level: ' + (s.level || 'N/A') + '<br/>Visits: ' + visits);
      m.on('click', () => onStoreClick?.(s));
      m.addTo(map);
    });
    if (coords.length > 0 && containerRef.current?.isConnected) map.fitBounds(L.latLngBounds(coords), { padding: [30,30] });
    mapRef.current = map;
    return () => {
      if (!mapRef.current) return;
      try {
        mapRef.current.off();
        mapRef.current.remove();
      } catch {
        // Ignore teardown races from Leaflet internals.
      }
      mapRef.current = null;
    };
  }, [stores, visitCounts, onStoreClick]);
  return React.createElement('div', { style: { width:'100%', height:400, borderRadius:12, overflow:'hidden', position:'relative' } },
    React.createElement('div', { ref: containerRef, style: { width:'100%', height:'100%' } })
  );
};

const DashboardPage = () => {
  const { t } = useLanguageStore();
  const profile = useAuthStore((s) => s.profile);
  useDashboardRealtime();
  const [trendPeriod, setTrendPeriod] = useState('30');
  const [heatmapLevelFilter, setHeatmapLevelFilter] = useState('all');

  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const { data: trendData, isLoading: trendLoading } = useQuery({ queryKey: ['visit-trend'], queryFn: () => getVisitTrend(30) });
  const { data: trend7Data } = useQuery({ queryKey: ['visit-trend-7'], queryFn: () => getVisitTrend(7) });
  const { data: trend90Data } = useQuery({ queryKey: ['visit-trend-90'], queryFn: () => getVisitTrend(90) });
  const { data: storeDistribution } = useQuery({ queryKey: ['store-distribution'], queryFn: getStoreDistribution });
  const { data: recentVisits, isLoading: visitsLoading } = useQuery({ queryKey: ['recent-visits'], queryFn: () => getVisits({}) });
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ queryKey: ['dashboard-campaigns'], queryFn: () => getCampaigns({}) });
  const { data: scanRecords, isLoading: scansLoading } = useQuery({ queryKey: ['dashboard-scans'], queryFn: () => getScanRecords({}) });
  const { data: fanRecords } = useQuery({ queryKey: ['dashboard-fans-all'], queryFn: () => {
    if (IS_LOCAL_MODE) {
      ensureLocalInit();
      return localDb.all('fans');
    }
    return [];
  } });
  const { data: materialStocks, isLoading: stockLoading } = useQuery({ queryKey: ['dashboard-stocks'], queryFn: getMaterialStocks });
  const [pendingClaims, setPendingClaims] = useState([]);
  useEffect(() => {
    try {
      const all = localDb.all('campaign_claims') || [];
      setPendingClaims(all.filter(cl => cl.status === 'pending'));
    } catch (_e) {
      setPendingClaims([]);
    }
  }, []);

  const { data: scanTrend, isLoading: scanTrendLoading } = useQuery({ queryKey: ["scan-trend"], queryFn: () => getScanTrend(30) });
  const { data: scanTrend7 } = useQuery({ queryKey: ["scan-trend-7"], queryFn: () => getScanTrend(7) });
  const localCounts = React.useMemo(() => {
    try {
      return {
        stores: localDb.all('stores').length,
        visits: localDb.all('visits').length,
        fans: localDb.all('fans').length,
        campaigns: localDb.all('campaigns').filter((item) => item.status === 'ongoing').length,
        scans: localDb.all('scan_records').length,
        lowStock: localDb.all('material_stocks').filter((item) => item.qty <= item.safety_stock).length,
      };
    } catch {
      return { stores: 0, visits: 0, fans: 0, campaigns: 0, scans: 0, lowStock: 0 };
    }
  }, []);
  const effectiveStores = React.useMemo(() => {
    if (storeDistribution?.length) return storeDistribution;
    try {
      return localDb.all('stores').map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, level: s.level }));
    } catch {
      return [];
    }
  }, [storeDistribution]);
  const effectiveVisits = React.useMemo(() => {
    if (recentVisits?.length) return recentVisits;
    try {
      return localDb.all('visits');
    } catch {
      return [];
    }
  }, [recentVisits]);

  const repStatsArray = React.useMemo(() => {
    if (!effectiveVisits) return [];
    const map = {};
    effectiveVisits.forEach(v => {
      if (v.rep_id) {
        if (!map[v.rep_id]) map[v.rep_id] = { rep_id: v.rep_id, name: v.profiles?.name || v.rep_id, count: 0 };
        map[v.rep_id].count++;
      }
    });
    return Object.values(map).sort((a,b) => b.count - a.count).slice(0, 10);
  }, [effectiveVisits]);

  const topStoresArray = React.useMemo(() => {
    if (!effectiveVisits) return [];
    const map = {};
    effectiveVisits.forEach(v => {
      if (v.store_id) {
        if (!map[v.store_id]) map[v.store_id] = { store_id: v.store_id, name: v.stores?.name || v.store_id, count: 0 };
        map[v.store_id].count++;
      }
    });
    return Object.values(map).sort((a,b) => b.count - a.count).slice(0, 10);
  }, [effectiveVisits]);

  const levelPieData = effectiveStores?.reduce((acc, store) => {
    const level = store.level || 'Unrated';
    const existing = acc.find((i) => i.name === level);
    if (existing) existing.value += 1;
    else acc.push({ name: level, value: 1 });
    return acc;
  }, []) || [];

  // ============ 新增：数据洞察计算 ============
  const allFans = fanRecords || [];
  const allVisits = effectiveVisits || [];
  const allScans = scanRecords || [];
  const allStores = effectiveStores || [];

  const todayNewFans = getTodayCount(allFans, 'created_at');
  const yesterdayNewFans = getYesterdayCount(allFans, 'created_at');
  const fanGrowthRate = calculateGrowth(todayNewFans, yesterdayNewFans);

  const todayScans = getTodayCount(allScans, 'created_at');
  const yesterdayScans = getYesterdayCount(allScans, 'created_at');
  const scanGrowthRate = calculateGrowth(todayScans, yesterdayScans);

  const todayVisits = getTodayCount(allVisits, 'visit_date');
  const yesterdayVisits = getYesterdayCount(allVisits, 'visit_date');
  const visitGrowthRate = calculateGrowth(todayVisits, yesterdayVisits);

  const last7DayScans = getLast7DaysCount(allScans, 'created_at');
  const last7DayVisits = getLast7DaysCount(allVisits, 'visit_date');
  const scanConversionRate = last7DayVisits > 0 ? Math.round((last7DayScans / last7DayVisits) * 100) : 0;

  const levelPercentages = React.useMemo(() => {
    const total = allStores.length;
    if (!total) return {};
    const counts = {};
    allStores.forEach(s => {
      const lvl = s.level || 'Unrated';
      counts[lvl] = (counts[lvl] || 0) + 1;
    });
    const result = {};
    Object.entries(counts).forEach(([lvl, count]) => {
      result[lvl] = { count, pct: Math.round((count / total) * 100) };
    });
    return result;
  }, [allStores]);

  const activeCampaigns = (campaigns || []).filter(c => c.status === 'ongoing');
  const completedCampaigns = (campaigns || []).filter(c => c.status === 'completed');
  const campaignExecutionRate = campaigns?.length > 0 ? Math.round((completedCampaigns.length / campaigns.length) * 100) : 0;

  const repPerformanceEnhanced = React.useMemo(() => {
    if (!allVisits.length) return [];
    const map = {};
    allVisits.forEach(v => {
      if (v.rep_id) {
        if (!map[v.rep_id]) {
          map[v.rep_id] = { rep_id: v.rep_id, name: v.profiles?.name || v.rep_id, visits: 0, stores: new Set(), lastVisit: null };
        }
        map[v.rep_id].visits++;
        if (v.store_id) map[v.rep_id].stores.add(v.store_id);
        const vd = v.visit_date || v.created_at;
        if (vd && (!map[v.rep_id].lastVisit || vd > map[v.rep_id].lastVisit)) {
          map[v.rep_id].lastVisit = vd;
        }
      }
    });
    return Object.values(map).map(r => ({
      ...r,
      storeCount: r.stores.size,
      stores: undefined,
    })).sort((a, b) => b.visits - a.visits).slice(0, 10);
  }, [allVisits]);

  const lowStockItems = materialStocks?.filter((s) => s.qty <= s.safety_stock) || [];
  const isCompanyScope = canViewCompanyScope(profile);
  const assignedStoreIds = React.useMemo(
    () => getAssignedStoreIds(profile, effectiveStores || []),
    [profile, effectiveStores],
  );
  const assignedStores = React.useMemo(
    () => filterByAssignedStores(profile, effectiveStores || [], effectiveStores || [], (store) => store.id),
    [profile, effectiveStores],
  );
  const assignedVisits = React.useMemo(
    () => filterByAssignedStores(profile, effectiveVisits || [], effectiveStores || []),
    [profile, effectiveVisits, effectiveStores],
  );
  const assignedCampaigns = React.useMemo(
    () => (campaigns || []).filter((campaign) => campaign.target_stores?.some((storeId) => assignedStoreIds.includes(storeId))),
    [campaigns, assignedStoreIds],
  );
  const assignedComplaints = React.useMemo(() => {
    try {
      return (localDb.all('fan_complaints') || []).filter((item) => assignedStoreIds.includes(item.store_id));
    } catch {
      return [];
    }
  }, [assignedStoreIds]);
  const repOpenComplaints = assignedComplaints.filter((item) => item.status === 'open');
  const repPendingClaims = pendingClaims.filter((claim) => assignedStoreIds.includes(claim.store_id));
  const pendingDisplayReviews = React.useMemo(() => {
    try {
      return (localDb.all('store_display_uploads') || []).filter((item) => item.status === 'pending');
    } catch {
      return [];
    }
  }, []);
  const pendingOldFanVerifications = React.useMemo(() => {
    try {
      return (localDb.all('old_fan_verifications') || []).filter((item) => item.status === 'pending');
    } catch {
      return [];
    }
  }, []);
  const openFanComplaints = React.useMemo(() => {
    try {
      return (localDb.all('fan_complaints') || []).filter((item) => item.status === 'open');
    } catch {
      return [];
    }
  }, []);
  const adminTodoItems = [
    ...pendingClaims.map((item) => ({
      id: `claim-${item.id}`,
      title: item.campaign_name || '活动物料领取通知',
      desc: `门店 ${item.store_id || 'N/A'} 等待物料派发`,
      tag: '活动领取',
      color: 'gold',
    })),
    ...pendingDisplayReviews.map((item) => ({
      id: `display-${item.id}`,
      title: item.store_name || '门店展示审核',
      desc: '门店提交了 UWELL 产品展示图片',
      tag: '展示审核',
      color: 'blue',
    })),
    ...pendingOldFanVerifications.map((item) => ({
      id: `oldfan-${item.id}`,
      title: item.fan_name || '老粉认证',
      desc: '粉丝提交了老粉认证材料',
      tag: '粉丝认证',
      color: 'purple',
    })),
    ...openFanComplaints.map((item) => ({
      id: `complaint-${item.id}`,
      title: item.fan_name || '粉丝客诉',
      desc: item.content || '待回复客诉',
      tag: '客诉',
      color: 'volcano',
    })),
  ];

  const visitCountMap = React.useMemo(() => {
    if (!effectiveVisits) return {};
    const m = {};
    effectiveVisits.forEach(v => { if (v.store_id) m[v.store_id] = (m[v.store_id] || 0) + 1; });
    return m;
  }, [effectiveVisits]);

  const recentVisitColumns = [
    { title: t('store'), dataIndex: ['stores', 'name'], key: 'store', ellipsis: true },
    { title: t('rep'), dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: t('date'), dataIndex: 'visit_date', key: 'date', render: (d) => (d ? new Date(d).toLocaleDateString('en-US') : '-'), width: 110 },
    {
      title: t('status'), dataIndex: 'status', key: 'status', width: 100,
      render: (s) => {
        const map = { draft: { color: 'default', text: t('draft') }, completed: { color: 'success', text: t('done') }, cancelled: { color: 'error', text: t('cancelled') } };
        const item = map[s] || { color: 'default', text: s };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
  ];

  if (!isCompanyScope) {
    return (
      <div className="rep-dashboard">
        <Title level={4} className="dash-section">
          <span className="text-gold-gradient"><RiseOutlined /> 地推工作台</span>
          <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>{profile?.name || t('profile')}</Text>
        </Title>

        <SectionTitle>我的今日重点</SectionTitle>
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}><StatCard icon={<ShopOutlined />} label="负责门店" value={assignedStores.length} color="#FFD700" delay={0} /></Col>
          <Col xs={12} sm={6}><StatCard icon={<CameraOutlined />} label="拜访记录" value={assignedVisits.length} color="#F5A623" delay={1} /></Col>
          <Col xs={12} sm={6}><StatCard icon={<ThunderboltOutlined />} label="活动执行" value={assignedCampaigns.length} color="#FFD700" delay={2} /></Col>
          <Col xs={12} sm={6}><StatCard icon={<WarningOutlined />} label="待回复客诉" value={repOpenComplaints.length} color={repOpenComplaints.length ? '#ff4d4f' : '#52c41a'} delay={3} /></Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title={<><ShopOutlined /> <span className="text-gold-gradient">负责门店状态</span></>}>
              <List size="small" dataSource={assignedStores.slice(0, 8)} renderItem={(store) => (
                <List.Item>
                  <List.Item.Meta
                    title={<span className="dash-card-title-light">{store.name}</span>}
                    description={`等级 ${store.level || '未评级'} · 近 30 天拜访 ${assignedVisits.filter((visit) => visit.store_id === store.id).length} 次`}
                  />
                  <Button size="small" onClick={() => { window.location.href = `/#/app/stores/${store.id}`; }}>查看</Button>
                </List.Item>
              )} locale={{ emptyText: t('no_data') }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<><ThunderboltOutlined /> <span className="text-gold-gradient">待处理事项</span></>}>
              <List size="small" dataSource={[
                ...repPendingClaims.map((item) => ({ id: item.id, title: item.campaign_name || '活动领取通知', desc: `门店 ${item.store_id}`, tag: '活动' })),
                ...repOpenComplaints.map((item) => ({ id: item.id, title: item.fan_name || '粉丝客诉', desc: item.content, tag: '客诉' })),
              ].slice(0, 8)} renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={<span className="dash-card-title-light">{item.title}</span>} description={item.desc} />
                  <Tag color={item.tag === '客诉' ? 'volcano' : 'gold'}>{item.tag}</Tag>
                </List.Item>
              )} locale={{ emptyText: '暂无待办' }} />
            </Card>
          </Col>
        </Row>

        <SectionTitle>最近拜访</SectionTitle>
        <Card title={<><CameraOutlined /> <span className="text-gold-gradient">我的拜访记录</span></>}>
          <Table columns={recentVisitColumns} dataSource={assignedVisits.slice(0, 8)} rowKey="id" loading={visitsLoading} pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: t('no_visit_records') }} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Title level={4} className="dash-section">
        <span className="text-gold-gradient"><RiseOutlined /> 管理员经营中心</span>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>{t('welcome_back')}, {profile?.name || t('profile')}</Text>
      </Title>

      {IS_LOCAL_MODE && (
        <Alert type="info" message={t('local_demo')} description={t('local_demo_desc')} showIcon style={{ marginBottom: 16 }} />
      )}

      <SectionTitle>{t('dashboard_section_overview')}</SectionTitle>
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <StatCard icon={<ShopOutlined />} label={t('dash_store')} value={stats?.storeCount || localCounts.stores} color="#FFD700" delay={0} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard icon={<CameraOutlined />} label={t('dash_visits')} value={stats?.totalVisits ?? stats?.visitCount ?? localCounts.visits} color="#FFD700" delay={1} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard icon={<TeamOutlined />} label={t('dash_fans')} value={stats?.totalFans ?? stats?.fanCount ?? localCounts.fans} color="#F5A623" delay={2} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard icon={<ThunderboltOutlined />} label={t('dash_campaigns')} value={stats?.activeCampaigns ?? stats?.ongoingCampaignCount ?? localCounts.campaigns} color="#FFD700" delay={3} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard icon={<QrcodeOutlined />} label={t('dash_scans')} value={stats?.todayScans ?? stats?.scanCount ?? localCounts.scans} color="#FFD700" delay={4} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard icon={<WarningOutlined />} label={t('dash_low_stock')} value={stats?.lowStockCount || localCounts.lowStock} color={(stats?.lowStockCount || localCounts.lowStock) > 0 ? '#ff4d4f' : '#52c41a'} delay={5} />
        </Col>
      </Row>

      {/* ============ 新增：核心数据洞察卡片 ============ */}
      <SectionTitle>核心数据洞察</SectionTitle>
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>今日新增粉丝</Text>
              {fanGrowthRate >= 0 ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FFD700', fontFamily: "'Instrument Serif', serif" }}>{todayNewFans}</div>
            <div style={{ fontSize: 11, color: fanGrowthRate >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {fanGrowthRate >= 0 ? '+' : ''}{fanGrowthRate}% 较昨日
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(114,46,209,0.03)', border: '1px solid rgba(114,46,209,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>今日扫码数</Text>
              {scanGrowthRate >= 0 ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1', fontFamily: "'Instrument Serif', serif" }}>{todayScans}</div>
            <div style={{ fontSize: 11, color: scanGrowthRate >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {scanGrowthRate >= 0 ? '+' : ''}{scanGrowthRate}% 较昨日
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(22,119,255,0.03)', border: '1px solid rgba(22,119,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>今日拜访数</Text>
              {visitGrowthRate >= 0 ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff', fontFamily: "'Instrument Serif', serif" }}>{todayVisits}</div>
            <div style={{ fontSize: 11, color: visitGrowthRate >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {visitGrowthRate >= 0 ? '+' : ''}{visitGrowthRate}% 较昨日
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(245,166,35,0.03)', border: '1px solid rgba(245,166,35,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>7天扫码转化率</Text>
              <EyeOutlined style={{ color: '#F5A623', fontSize: 12 }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#F5A623', fontFamily: "'Instrument Serif', serif" }}>{scanConversionRate}%</div>
            <div style={{ fontSize: 11, color: '#888' }}>
              {last7DayScans} 扫码 / {last7DayVisits} 拜访
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(255,77,79,0.03)', border: '1px solid rgba(255,77,79,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>活动执行率</Text>
              <ThunderboltOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f', fontFamily: "'Instrument Serif', serif" }}>{campaignExecutionRate}%</div>
            <div style={{ fontSize: 11, color: '#888' }}>
              {completedCampaigns.length} 完成 / {campaigns?.length || 0} 总活动
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(82,196,26,0.03)', border: '1px solid rgba(82,196,26,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>待审核门店</Text>
              <ShopOutlined style={{ color: '#52c41a', fontSize: 12 }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', fontFamily: "'Instrument Serif', serif" }}>
              {allStores.filter(s => s.status === 'pending_review').length}
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>
              新注册待审核
            </div>
          </Card>
        </Col>
      </Row>

      <SectionTitle>管理待办中心</SectionTitle>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Row gutter={[12, 12]}>
            <Col xs={12}><StatCard icon={<ThunderboltOutlined />} label="活动领取待派发" value={pendingClaims.length} color="#FFD700" delay={0} /></Col>
            <Col xs={12}><StatCard icon={<ShopOutlined />} label="门店展示待审" value={pendingDisplayReviews.length} color="#1677ff" delay={1} /></Col>
            <Col xs={12}><StatCard icon={<TeamOutlined />} label="老粉认证待审" value={pendingOldFanVerifications.length} color="#722ed1" delay={2} /></Col>
            <Col xs={12}><StatCard icon={<WarningOutlined />} label="粉丝客诉待回" value={openFanComplaints.length} color={openFanComplaints.length ? '#ff4d4f' : '#52c41a'} delay={3} /></Col>
          </Row>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<><WarningOutlined /> <span className="text-gold-gradient">全局待办列表</span></>}>
            <List size="small" dataSource={adminTodoItems.slice(0, 8)} renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Badge status={item.color === 'volcano' ? 'error' : 'processing'} />}
                  title={<span className="dash-card-title-light">{item.title}</span>}
                  description={item.desc}
                />
                <Tag color={item.color}>{item.tag}</Tag>
              </List.Item>
            )} locale={{ emptyText: '暂无待办' }} />
          </Card>
        </Col>
      </Row>

      <SectionTitle>{t('dashboard_section_trends')}</SectionTitle>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title={<><CameraOutlined /> <span className="text-gold-gradient">{t('dash_visit_trend_30')}</span></>}>
            {trendLoading ? <div className="dash-loading"><Spin /></div> :
             trendData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="visit_date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1677ff" strokeWidth={2} dot={{ r: 3 }} name={t('dash_visits')} />
                </LineChart>
              </ResponsiveContainer>
            ) : <ActionEmpty title="近 30 天暂无拜访趋势" desc="当地推完成巡店后，这里会自动形成趋势线，方便判断门店覆盖是否稳定。" />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><StarOutlined /> <span className="text-gold-gradient">{t('dash_store_level_distribution')}</span></>}
            extra={
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(levelPercentages).map(([lvl, data]) => (
                  <Tag key={lvl} color={LEVEL_COLORS[lvl] || 'default'} style={{ fontSize: 11 }}>
                    {lvl}: {data.pct}%
                  </Tag>
                ))}
              </div>
            }
          >
            {levelPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={levelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}>
                    {levelPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.name] || COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} 家`, `${name} 等级`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <ActionEmpty title="门店评级数据待完善" desc="完成门店评级后，S/A/B/C 分布会在这里展示，帮助判断渠道质量。" />}
          </Card>
        </Col>
      </Row>

      {/* Scan Trend */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title={<><QrcodeOutlined /> {t('dash_scan_trend_30')}</>}>
            {scanTrendLoading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div> :
             scanTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scanTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#722ed1" strokeWidth={2} dot={{ r: 3 }} name={t('dash_scans')} />
                </LineChart>
              </ResponsiveContainer>
            ) : <ActionEmpty title="扫码数据正在等待沉淀" desc="粉丝扫码后会在这里显示每日趋势，用来观察活动转化和产品热度。" />}
          </Card>
        </Col>
      </Row>

      {/* Pending Material Dispatch */}
      {pendingClaims.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title={`${t('material_dispatch_needed')} (${pendingClaims.length})`} size="small">
              <List size="small" dataSource={pendingClaims} renderItem={(cl) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status="processing" />}
                    title={<span className="dash-card-title-light">{cl.campaign_name || t('nav_campaigns')}</span>}
                    description={`${t('store')}: ${cl.store_id || "N/A"} · ${new Date(cl.claimed_at).toLocaleDateString()}`}
                  />
                  <Tag color="volcano">{t('needs_dispatch')}</Tag>
                </List.Item>
              )} />
            </Card>
          </Col>
        </Row>
      )}

      <SectionTitle>{t('dashboard_section_alerts')}</SectionTitle>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><ThunderboltOutlined /> <span className="text-gold-gradient">{t('campaign_overview')}</span></>}>
            {campaignsLoading ? <div className="dash-loading-sm"><Spin /></div> :
             campaigns?.length > 0 ? (
              <List size="small" dataSource={campaigns.slice(0, 5)} renderItem={(c) => (
                <List.Item>
                  <List.Item.Meta title={<span><Tag color={c.status === 'ongoing' ? 'processing' : c.status === 'completed' ? 'default' : 'blue'}>{c.status === 'ongoing' ? 'Ongoing' : c.status === 'completed' ? 'Completed' : c.status === 'planned' ? 'Planned' : 'Cancelled'}</Tag>{c.name}</span>} description={`${c.type} · ${c.start_date} ~ ${c.end_date} · ${c.store_count || (c.target_stores?.length || 0)} stores`} />
                </List.Item>
              )} />
            ) : <ActionEmpty title="当前没有进行中的活动" desc="创建或分配活动后，管理员可以在这里快速查看门店参与情况。" />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><WarningOutlined /> <span className="text-gold-gradient">{t('low_stock_alerts')}</span></>}>
            {stockLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> :
             lowStockItems.length > 0 ? (
              <List size="small" dataSource={lowStockItems} renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={<span><Badge status={item.qty === 0 ? 'error' : 'warning'} />{item.materials?.name}</span>} description={<span>Current: <Text type="danger" strong>{item.qty}</Text> / Safety: {item.safety_stock} {item.materials?.unit}<Progress percent={Math.round((item.qty / (item.safety_stock * 2)) * 100)} size="small" status={item.qty === 0 ? 'exception' : 'active'} style={{ maxWidth: 200, marginTop: 4 }} /></span>} />
                </List.Item>
              )} />
            ) : <ActionEmpty title="库存状态正常" desc="低于安全库存的物料会自动出现在这里，方便及时补货。" />}
          </Card>
        </Col>
      </Row>

      <SectionTitle>{t('dashboard_section_records')}</SectionTitle>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={<><CameraOutlined /> <span className="text-gold-gradient">{t('recent_visits')}</span></>}>
            <Table columns={recentVisitColumns} dataSource={effectiveVisits?.slice(0, 8) || []} rowKey="id" loading={visitsLoading} pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: t('no_visit_records') }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><QrcodeOutlined /> <span className="text-gold-gradient">{t('recent_scans')}</span></>}>
            {scansLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> :
             scanRecords?.length > 0 ? (
              <List size="small" dataSource={scanRecords.slice(0, 8)} renderItem={(r) => (
                <List.Item>
                  <List.Item.Meta avatar={<QrcodeOutlined style={{ fontSize: 20, color: '#722ed1' }} />} title={`${r.products?.name || 'Unknown'} · +${r.points_earned} pts`} description={`${r.stores?.name || ''} · ${new Date(r.created_at).toLocaleString('en-US')}`} />
                </List.Item>
              )} />
            ) : <ActionEmpty title="还没有最新扫码记录" desc="粉丝扫码认证产品后，最新记录会自动出现在这里。" />}
          </Card>
        </Col>
      </Row>

      {/* Store Visit Heatmap */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title={<span className="dash-card-title-gold">{t('store_visit_heatmap')}</span>} extra={
            <Button size="small" icon={<DownloadOutlined />} onClick={() => {
              const data = (effectiveStores || []).map(s => ({ name: s.name, level: s.level || "Unrated", visits: visitCountMap[s.id] || 0 }));
              exportToCSV(data, "stores-heatmap.csv", [{title:t('store'), dataIndex:"name"}, {title:t('fan_level'), dataIndex:"level"}, {title:t('visit_count'), dataIndex:"visits"}]);
            }}>{t('export')}</Button>
          }>
            {effectiveStores?.length > 0 ? (
              <StoreHeatmap stores={effectiveStores} visitCounts={visitCountMap} onStoreClick={(s) => { window.open("/#/app/stores/" + s.id, "_blank"); }} />
            ) : (
              <div className="dash-no-data">{t('no_store_heatmap_data')}</div>
            )}
          </Card>
        </Col>
      </Row>

      <SectionTitle>{t('dashboard_section_insights')}</SectionTitle>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><TeamOutlined /> <span className="text-gold-gradient">地推表现排行榜</span></>} extra={<Button size="small" icon={<DownloadOutlined />} onClick={() => exportToCSV(repPerformanceEnhanced, "rep-performance-enhanced.csv", [{title:t('rank'), key:"rank", render:(_,__,i)=>i+1}, {title:t('rep'), dataIndex:"name"}, {title:"拜访数", dataIndex:"visits"}, {title:"覆盖门店", dataIndex:"storeCount"}, {title:"最近拜访", dataIndex:"lastVisit", render:(d)=>d?new Date(d).toLocaleDateString('en-US'):'-'}])}>{t('export')}</Button>}>
            {repPerformanceEnhanced.length > 0 ? (
              <Table columns={[
                { title: t('rank'), key: 'rank', width: 50, render: (_, __, i) => (
                  <span style={{ fontWeight: 700, color: i < 3 ? '#FFD700' : '#888', fontSize: 16 }}>{i + 1}</span>
                )},
                { title: t('rep'), dataIndex: 'name', key: 'name', render: (name, record) => (
                  <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{record.rep_id}</div>
                  </div>
                )},
                { title: '拜访数', dataIndex: 'visits', key: 'visits', width: 80, sorter: (a,b) => a.visits - b.visits, defaultSortOrder: 'descend', render: (v) => <Tag color="gold">{v}</Tag> },
                { title: '覆盖门店', dataIndex: 'storeCount', key: 'storeCount', width: 90, render: (v) => <Tag color="blue">{v} 家</Tag> },
                { title: '最近拜访', dataIndex: 'lastVisit', key: 'lastVisit', width: 110, render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
              ]} dataSource={repPerformanceEnhanced} rowKey="rep_id" pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: t('no_data') }} />
            ) : <Empty description={t('no_rep_activity')} style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><StarOutlined /> <span className="text-gold-gradient">{t('top_visited_stores')}</span></>} extra={<Button size="small" icon={<DownloadOutlined />} onClick={() => exportToCSV(topStoresArray, "top-stores.csv", [{title:t('rank'), key:"rank", render:(_,__,i)=>i+1}, {title:t('store'), dataIndex:"name"}, {title:t('visit_count'), dataIndex:"count"}])}>{t('export')}</Button>}>
            {topStoresArray.length > 0 ? (
              <Table columns={[
                { title: t('rank'), key: 'rank', width: 60, render: (_, __, i) => i + 1 },
                { title: t('store'), dataIndex: 'name', key: 'name' },
                { title: t('visit_count'), dataIndex: 'count', key: 'count', sorter: (a,b) => a.count - b.count, defaultSortOrder: 'descend' },
              ]} dataSource={topStoresArray} rowKey="store_id" pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: t('no_data') }} />
            ) : <Empty description={t('no_store_visits')} style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;



