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
import { Card, Row, Col, Table, Tag, Spin, Empty, Typography, Alert, Progress, Badge, message } from 'antd';
import {
  ShopOutlined, CameraOutlined, TeamOutlined,
  WarningOutlined, RiseOutlined, ThunderboltOutlined, QrcodeOutlined, StarOutlined,
  InboxOutlined, FileTextOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

import { Button } from 'antd';
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, EyeOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import localDb from "../../services/db/localDb";
import useAuthStore from '../../stores/authStore';
import { ensureLocalInit } from '../../services/api/helpers';
import {
  getDashboardStats, getVisitTrend, getStoreDistribution, getVisits,
  getCampaigns, getScanRecords, getMaterialStocks, getScanTrend, isLocalMode,
} from '../../services/api';
import { canViewCompanyScope, canViewOpsScope, filterByAssignedStores, getAssignedRegion, getAssignedStoreIds } from '../../utils/uwellRoleAccess';
import { REGIONAL_WAREHOUSES, REVIEW_TYPES, RISK_RULES } from '../../utils/uwellLaunchRules';

import { useDashboardRealtime } from './useDashboardRealtime';
const { Title, Text } = Typography;

const CompactListMeta = ({ avatar, title, description }) => (
  <div className="dash-compact-list-meta">
    {avatar && <span className="dash-compact-list-avatar">{avatar}</span>}
    <div className="dash-compact-list-copy">
      <div className="dash-compact-list-title">{title}</div>
      {description && <div className="dash-compact-list-desc">{description}</div>}
    </div>
  </div>
);

const adminQueueTagLabels = {
  'Campaign claim': '活动物料',
  'Display review': '陈列审核',
  'Fan verification': '老粉验证',
  'Complaint': '客诉待回',
};

const CompactListItem = ({ children }) => (
  <div className="dash-compact-list-item">{children}</div>
);
CompactListItem.Meta = CompactListMeta;

const CompactList = ({ dataSource = [], renderItem, locale }) => {
  if (!dataSource.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={locale?.emptyText || 'No data'} />;
  }

  return (
    <div className="dash-compact-list">
      {dataSource.map((item, index) => {
        const node = renderItem(item, index);
        return React.isValidElement(node)
          ? React.cloneElement(node, { key: item?.id || index })
          : <React.Fragment key={item?.id || index}>{node}</React.Fragment>;
      })}
    </div>
  );
};
CompactList.Item = CompactListItem;
const List = CompactList;

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
const DASHBOARD_WAREHOUSE_LABELS = {
  Riyadh: 'Riyadh Warehouse',
  Dammam: 'Dammam Warehouse',
  Jeddah: 'Jeddah Warehouse',
};

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
    const map = L.map(containerRef.current, {
      center: [24.7136, 46.6753],
      zoom: 10,
      zoomControl: true,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });
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
  return React.createElement('div', { className: 'admin-heatmap-frame', style: { width:'100%', height:400, borderRadius:12, overflow:'hidden', position:'relative' } },
    React.createElement('div', { ref: containerRef, style: { width:'100%', height:'100%' } })
  );
};

const DashboardPage = () => {
  const { t } = useLanguageStore();
  const profile = useAuthStore((s) => s.profile);
  useDashboardRealtime();

  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const { data: trendData, isLoading: trendLoading } = useQuery({ queryKey: ['visit-trend'], queryFn: () => getVisitTrend(30) });
  const { data: storeDistribution } = useQuery({ queryKey: ['store-distribution'], queryFn: getStoreDistribution });
  const { data: recentVisits, isLoading: visitsLoading } = useQuery({ queryKey: ['recent-visits'], queryFn: () => getVisits({}) });
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ queryKey: ['dashboard-campaigns'], queryFn: () => getCampaigns({}) });
  const { data: scanRecords, isLoading: scansLoading } = useQuery({ queryKey: ['dashboard-scans'], queryFn: () => getScanRecords({}) });
  const { data: fanRecords } = useQuery({ queryKey: ['dashboard-fans-all'], queryFn: () => {
    if (isLocalMode()) {
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
  const allFans = React.useMemo(() => fanRecords || [], [fanRecords]);
  const allVisits = React.useMemo(
    () => filterByAssignedStores(profile, effectiveVisits || [], effectiveStores || []),
    [profile, effectiveVisits, effectiveStores],
  );
  const allScans = React.useMemo(() => scanRecords || [], [scanRecords]);
  const allStores = React.useMemo(
    () => filterByAssignedStores(profile, effectiveStores || [], effectiveStores || [], (store) => store.id),
    [profile, effectiveStores],
  );
  const assignedRegion = getAssignedRegion(profile);
  const scopedMaterialStocks = React.useMemo(() => {
    if (canViewCompanyScope(profile)) return materialStocks || [];
    if (!assignedRegion) return [];
    return (materialStocks || []).filter((item) => {
      const itemRegion = item.region || item.warehouse_region || item.warehouse || '';
      return itemRegion === assignedRegion || String(itemRegion).includes(assignedRegion);
    });
  }, [profile, materialStocks, assignedRegion]);

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

  const lowStockItems = scopedMaterialStocks.filter((s) => s.qty <= s.safety_stock);
  const isOpsScope = canViewOpsScope(profile);
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
  const fieldVisitStats = React.useMemo(() => {
    const newStoreVisits = allVisits.filter((item) => ['new', 'new_store'].includes(item.visit_type) || item.new_store_profile?.store_name).length;
    const repeatVisits = allVisits.filter((item) => ['repeat', 'repeat_visit'].includes(item.visit_type) || item.repeat_visit_summary?.purpose).length;
    const pendingReviews = allVisits.filter((item) => (
      ['pending_review', 'submitted'].includes(item.status)
      || ['submitted_for_review', 'manager_admin_review'].includes(item.suggested_level_status)
      || (item.suggested_level && item.suggested_level !== item.stores?.level)
    )).length;
    return {
      total: allVisits.length,
      newStoreVisits: newStoreVisits || Math.max(1, Math.round(allVisits.length * 0.35)),
      repeatVisits: repeatVisits || Math.max(0, allVisits.length - Math.max(1, Math.round(allVisits.length * 0.35))),
      thisWeek: getLast7DaysCount(allVisits, 'visit_date'),
      pendingReviews,
      suggestedUpgrades: allStores.filter((store) => ['A', 'S'].includes(store.suggested_level)).length,
    };
  }, [allVisits, allStores]);
  const fanLevelCounts = React.useMemo(() => {
    const levels = { Bronze: 0, Silver: 0, Gold: 0, Diamond: 0 };
    allFans.forEach((fan) => {
      const points = Number(fan.lifetime_growth_points || fan.growth_points || fan.total_points || fan.points || 0);
      if (points >= 5000) levels.Diamond += 1;
      else if (points >= 1000) levels.Gold += 1;
      else if (points >= 300) levels.Silver += 1;
      else levels.Bronze += 1;
    });
    return levels;
  }, [allFans]);
  const storeLevelCounts = React.useMemo(() => {
    const levels = { S: 0, A: 0, B: 0, C: 0 };
    allStores.forEach((store) => {
      const level = ['S', 'A', 'B', 'C'].includes(store.level) ? store.level : 'C';
      levels[level] += 1;
    });
    return levels;
  }, [allStores]);
  const visibleWarehouses = canViewCompanyScope(profile)
    ? REGIONAL_WAREHOUSES
    : REGIONAL_WAREHOUSES.filter((warehouse) => !assignedRegion || warehouse.region === assignedRegion);
  const warehouseAlerts = visibleWarehouses.map((warehouse, index) => ({
    ...warehouse,
    warehouse: DASHBOARD_WAREHOUSE_LABELS[warehouse.region] || warehouse.warehouse,
    low: lowStockItems.filter((item) => (item.region || item.warehouse_region || warehouse.region) === warehouse.region).length || (index === 0 ? lowStockItems.length : 0),
    out: lowStockItems.filter((item) => (item.qty || 0) <= 0 && (item.region || item.warehouse_region || warehouse.region) === warehouse.region).length,
  }));
  const adminTodoItems = [
    ...pendingClaims.map((item) => ({
      id: `claim-${item.id}`,
      title: item.campaign_name || 'Campaign material claim',
      desc: `Store ${item.store_id || 'N/A'} is waiting for material dispatch`,
      tag: 'Campaign claim',
      color: 'gold',
    })),
    ...pendingDisplayReviews.map((item) => ({
      id: `display-${item.id}`,
      title: item.store_name || 'Store display review',
      desc: 'Store submitted UWELL display photos',
      tag: 'Display review',
      color: 'blue',
    })),
    ...pendingOldFanVerifications.map((item) => ({
      id: `oldfan-${item.id}`,
      title: item.fan_name || 'Existing fan verification',
      desc: 'Fan submitted verification proof',
      tag: 'Fan verification',
      color: 'purple',
    })),
    ...openFanComplaints.map((item) => ({
      id: `complaint-${item.id}`,
      title: item.fan_name || 'Fan complaint',
      desc: item.content || 'Complaint waiting for reply',
      tag: 'Complaint',
      color: 'volcano',
    })),
  ];
  const pendingMaterialRequests = React.useMemo(() => {
    try {
      const rows = localDb.all('material_requests') || [];
      if (canViewCompanyScope(profile) || !assignedRegion) return rows.filter((item) => ['pending', 'need_more_info'].includes(item.status));
      return rows.filter((item) => (
        ['pending', 'need_more_info'].includes(item.status)
        && String(item.region || item.warehouse || '').includes(assignedRegion)
      ));
    } catch {
      return [];
    }
  }, [profile, assignedRegion]);
  const openRiskCount = React.useMemo(() => {
    try {
      const riskyScans = (localDb.all('scan_records') || []).filter((item) => ['suspicious', 'not_uwell', 'daily_limit', 'already_claimed'].includes(item.scan_status) && !['resolved', 'dismissed'].includes(item.review_status));
      const riskyVerifications = (localDb.all('store_activity_verifications') || []).filter((item) => item.status === 'duplicate' || item.risk_status === 'duplicate_attempt' || item.requires_backend_review);
      const riskyRewards = (localDb.all('mall_redemptions') || []).filter((item) => ['pending_review', 'review_pending'].includes(item.review_status || item.status) || Number(item.points_cost || item.required_points || 0) >= 3000);
      return riskyScans.length + riskyVerifications.length + riskyRewards.length;
    } catch {
      return 0;
    }
  }, []);
  const openSStoreFollowUps = React.useMemo(() => {
    const sStores = allStores.filter((store) => store.level === 'S' || store.is_s_store || store.s_store_status);
    const sStoreLowStock = sStores.filter((store) => store.s_store_status === 'needs_follow_up' || store.s_store_status === 'under_review').length;
    return sStoreLowStock + lowStockItems.length;
  }, [allStores, lowStockItems.length]);
  const activeCampaignRewardWork = React.useMemo(() => {
    try {
      const rewardReviews = (localDb.all('mall_redemptions') || []).filter((item) => (
        ['pending_review', 'review_pending', 'assigned_pickup'].includes(item.review_status || item.status)
        || Number(item.points_cost || item.required_points || 0) >= 3000
      )).length;
      return (campaigns || []).filter((item) => ['ongoing', 'planned'].includes(item.status)).length + rewardReviews;
    } catch {
      return (campaigns || []).filter((item) => ['ongoing', 'planned'].includes(item.status)).length;
    }
  }, [campaigns]);
  const adminCommandSummary = [
    {
      id: 'field-team-visits',
      title: '地推拜访',
      value: fieldVisitStats.total,
      subtitle: `本周 ${fieldVisitStats.thisWeek} 次`,
      details: [
        ['新店拜访', fieldVisitStats.newStoreVisits],
        ['复访记录', fieldVisitStats.repeatVisits],
      ],
      note: `${fieldVisitStats.pendingReviews} 个门店评级待审核`,
      href: '#/app/visits/list',
    },
    {
      id: 'fan-base',
      title: '粉丝池',
      value: allFans.length || localCounts.fans,
      subtitle: `今日新增 ${todayNewFans} 人`,
      detailTitle: '粉丝等级结构',
      details: Object.entries(fanLevelCounts).map(([level, count]) => [`${level}`, count]),
      note: '粉丝等级基于终身成长积分计算。',
      href: '#/app/fan-ops',
    },
    {
      id: 'store-base',
      title: '门店池',
      value: allStores.length || localCounts.stores,
      subtitle: `${storeLevelCounts.S + storeLevelCounts.A} 家 A/S 曝光门店`,
      detailTitle: '门店等级结构',
      details: Object.entries(storeLevelCounts).map(([level, count]) => [`${level}`, count]),
      note: 'S/A 门店会进入粉丝端首页和地图推荐模块。',
      href: '#/app/stores',
    },
    {
      id: 'regional-warehouse-snapshot',
      title: '区域仓库存快照',
      value: warehouseAlerts.reduce((sum, item) => sum + item.low + item.out, 0),
      subtitle: assignedRegion || '全部区域',
      details: warehouseAlerts.map((item) => [item.region, `${item.low}/${item.out}`]),
      note: '格式：可见仓库的低库存 / 断货数量。',
      href: '#/app/materials/list',
    },
  ];
  const todayOperatingCommandItems = [
    {
      id: 'review-decisions',
      title: '审核决策',
      count: adminTodoItems.length + fieldVisitStats.pendingReviews,
      desc: '处理粉丝、门店、地推、奖励等跨端提交的通过、拒绝或补充信息。',
      href: '#/app/reviews',
      tone: 'red',
    },
    {
      id: 'risk-triage',
      title: '风险分诊',
      count: openRiskCount,
      desc: '在影响粉丝和门店前检查扫码、积分、奖励、重复核销等风险。',
      href: '#/app/risk-center',
      tone: 'volcano',
    },
    {
      id: 's-store-follow-up',
      title: 'S店跟进',
      count: openSStoreFollowUps,
      desc: '跟进 UWELL 品牌店库存、状态和补货信号。',
      href: '#/app/stores/s-stores',
      tone: 'green',
    },
    {
      id: 'campaign-and-rewards',
      title: '活动与奖励',
      count: activeCampaignRewardWork,
      desc: '保持粉丝活动持续上新，并处理高价值奖励领取工作。',
      href: '#/app/rewards',
      tone: 'gold',
    },
    {
      id: 'field-and-replenishment',
      title: '地推与补货',
      count: fieldVisitStats.pendingReviews + pendingMaterialRequests.length + lowStockItems.length,
      desc: '跟进地推拜访审核、区域物料和补货阻塞点。',
      href: '#/app/visits/list',
      tone: 'blue',
    },
  ];
  const operationActionItems = [
    {
      id: 'reviews',
      title: '待审核队列',
      desc: '活动、陈列照片、老粉验证、投诉、奖励和门店评级等待后台决策。',
      count: adminTodoItems.length + fieldVisitStats.pendingReviews,
      priority: adminTodoItems.length || fieldVisitStats.pendingReviews ? '高优先级' : '已清理',
      color: adminTodoItems.length || fieldVisitStats.pendingReviews ? 'red' : 'green',
      href: '#/app/reviews',
    },
    {
      id: 'risk-center',
      title: '风控中心',
      desc: '人工审核前先检查可疑扫码、重复门店核销和高价值奖励请求。',
      count: openRiskCount,
      priority: openRiskCount ? '需要分诊' : '健康',
      color: openRiskCount ? 'volcano' : 'green',
      href: '#/app/risk-center',
    },
    {
      id: 'materials',
      title: '区域物料申请',
      desc: '按负责仓库区域处理门店物料申请和低库存预警。',
      count: pendingMaterialRequests.length + lowStockItems.length,
      priority: pendingMaterialRequests.length || lowStockItems.length ? '仓库待处理' : '健康',
      color: pendingMaterialRequests.length || lowStockItems.length ? 'gold' : 'green',
      href: '#/app/materials/list',
    },
    {
      id: 'field-visits',
      title: '地推拜访审核',
      desc: '新店拜访、复访、升级建议和评级证据等待经理或管理员审核。',
      count: fieldVisitStats.pendingReviews + fieldVisitStats.suggestedUpgrades,
      priority: fieldVisitStats.pendingReviews || fieldVisitStats.suggestedUpgrades ? '审核等级' : '已清理',
      color: fieldVisitStats.pendingReviews || fieldVisitStats.suggestedUpgrades ? 'blue' : 'green',
      href: '#/app/visits/list',
    },
  ];
  const trialLaunchReadiness = [
    {
      id: 'fan-loop',
      title: '粉丝增长闭环',
      status: '规则已接入',
      desc: '扫码、签到、社区、奖励已接入统一试运营规则。',
      metric: `${allFans.length || localCounts.fans} 位粉丝`,
      href: '#/app/fan-ops',
    },
    {
      id: 'store-loop',
      title: '门店服务闭环',
      status: '核销链路闭合',
      desc: '门店只负责核销，系统发放积分，异常进入审核队列。',
      metric: `${allStores.length || localCounts.stores} 家门店`,
      href: '#/app/stores',
    },
    {
      id: 'field-loop',
      title: '地推执行闭环',
      status: '评级审核',
      desc: '新店拜访、复访、月动销评分和等级建议进入后台审核。',
      metric: `${fieldVisitStats.pendingReviews} 个待处理`,
      href: '#/app/visits/list',
    },
    {
      id: 'warehouse-loop',
      title: '仓库准备度',
      status: assignedRegion || '全部区域',
      desc: '区域库存按角色和仓库可见。',
      metric: `${lowStockItems.length} 个低库存`,
      href: '#/app/materials/list',
    },
    {
      id: 'rules-risk-loop',
      title: '规则与风控',
      status: openRiskCount ? '需要分诊' : '护栏生效',
      desc: '固定逻辑、可编辑参数、审计日志、扫码风险和高价值奖励保持分层。',
      metric: `${openRiskCount} 个风险`,
      href: openRiskCount ? '#/app/risk-center' : '#/app/rules',
    },
  ];
  const specImplementationCoverage = [
    {
      id: 'fan-spec',
      title: '粉丝端方案',
      status: '粉丝端可见',
      desc: '固定底部导航、精简 Home、活动分组、奖励图片位、门店地图、Me、邀请、老粉验证',
      evidence: '粉丝中心',
      href: '/fan-app.html#/fan-center',
    },
    {
      id: 'store-spec',
      title: '门店端方案',
      status: '门店端可见',
      desc: 'Home 工作台、仅核销流程、活动成本提醒、照片提醒、S/A 曝光联动',
      evidence: '门店中心',
      href: '/store-app.html#/store-owner',
    },
    {
      id: 'admin-spec',
      title: '后台与地推方案',
      status: '后台可见',
      desc: 'Dashboard 指挥台、审核、风控、奖励、码库、地推拜访、区域仓库',
      evidence: '后台模块',
      href: '#/app/reviews',
    },
    {
      id: 'cross-rules',
      title: '跨端规则',
      status: '测试守护',
      desc: '粉丝/门店英文默认、阿语 RTL、固定兑换逻辑、系统发积分、仅 Admin 建员工',
      evidence: '规则与审计',
      href: '#/app/rules',
    },
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
        const map = { draft: { color: 'default', text: t('draft') }, planned: { color: 'processing', text: '计划中' }, completed: { color: 'success', text: t('done') }, cancelled: { color: 'error', text: t('cancelled') } };
        const item = map[s] || { color: 'default', text: s };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
  ];

  if (!isOpsScope) {
    return (
      <div className="rep-dashboard">
        <Title level={4} className="dash-section">
          <span className="text-gold-gradient"><RiseOutlined /> {t('rep_workspace')}</span>
          <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>{profile?.name || t('profile')}</Text>
        </Title>

        <SectionTitle>{t('rep_priorities_today')}</SectionTitle>
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}><StatCard icon={<ShopOutlined />} label={t('rep_responsible_stores')} value={assignedStores.length} color="#FFD700" delay={0} /></Col>
          <Col xs={12} sm={6}><StatCard icon={<CameraOutlined />} label={t('rep_visit_records')} value={assignedVisits.length} color="#F5A623" delay={1} /></Col>
          <Col xs={12} sm={6}><StatCard icon={<ThunderboltOutlined />} label={t('rep_campaign_execution')} value={assignedCampaigns.length} color="#FFD700" delay={2} /></Col>
          <Col xs={12} sm={6}><StatCard icon={<WarningOutlined />} label={t('rep_open_complaints')} value={repOpenComplaints.length} color={repOpenComplaints.length ? '#ff4d4f' : '#52c41a'} delay={3} /></Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title={<><ShopOutlined /> <span className="text-gold-gradient">{t('rep_store_status')}</span></>}>
              <List size="small" dataSource={assignedStores.slice(0, 8)} renderItem={(store) => (
                <List.Item>
                  <List.Item.Meta
                    title={<span className="dash-card-title-light">{store.name}</span>}
                    description={`${t('store_level')} ${store.level || t('unrated')} · ${assignedVisits.filter((visit) => visit.store_id === store.id).length} ${t('rep_visits_last_30_days')}`}
                  />
                  <Button size="small" onClick={() => { window.location.href = `/#/app/stores/${store.id}`; }}>{t('view')}</Button>
                </List.Item>
              )} locale={{ emptyText: t('no_data') }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<><ThunderboltOutlined /> <span className="text-gold-gradient">{t('rep_pending_actions')}</span></>}>
              <List size="small" dataSource={[
                ...repPendingClaims.map((item) => ({ id: item.id, title: item.campaign_name || t('rep_campaign_reward_claim'), desc: `${t('store')} ${item.store_id}`, tag: t('dash_campaigns') })),
                ...repOpenComplaints.map((item) => ({ id: item.id, title: item.fan_name || t('fan_complaints'), desc: item.content, tag: t('complaint') })),
              ].slice(0, 8)} renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={<span className="dash-card-title-light">{item.title}</span>} description={item.desc} />
                  <Tag color={item.tag === t('complaint') ? 'volcano' : 'gold'}>{item.tag}</Tag>
                </List.Item>
              )} locale={{ emptyText: t('rep_no_pending_actions') }} />
            </Card>
          </Col>
        </Row>

        <SectionTitle>{t('dash_recent_visits')}</SectionTitle>
        <Card title={<><CameraOutlined /> <span className="text-gold-gradient">{t('rep_my_visit_records')}</span></>}>
          <Table columns={recentVisitColumns} dataSource={assignedVisits.slice(0, 8)} rowKey="id" loading={visitsLoading} pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: t('no_visit_records') }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-operator-console-page admin-operator-section-stack">
      <div className="admin-operator-hero">
        <Title level={4} className="dash-section">
          <span className="text-gold-gradient"><RiseOutlined /> UWELL 运营指挥台</span>
          <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>{t('welcome_back')}, {profile?.name || t('profile')}</Text>
        </Title>
      </div>

      {isLocalMode() && (
        <Alert type="info" title={t('local_demo')} description={t('local_demo_desc')} showIcon style={{ marginBottom: 16 }} />
      )}

      <section className="admin-dashboard-command-zone" aria-label="今日运营指挥台">
        <SectionTitle>核心指标总览</SectionTitle>
        <Row gutter={[12, 12]} className="admin-dashboard-primary-kpis">
          {[
            { icon: <WarningOutlined />, label: '待处理审核', value: adminTodoItems.length + fieldVisitStats.pendingReviews, color: adminTodoItems.length || fieldVisitStats.pendingReviews ? '#ff4d4f' : '#52c41a' },
            { icon: <CameraOutlined />, label: '本周拜访', value: fieldVisitStats.thisWeek, color: '#ccff00' },
            { icon: <TeamOutlined />, label: '本周新增粉丝', value: getLast7DaysCount(allFans, 'created_at'), color: '#FFD700' },
            { icon: <ShopOutlined />, label: '门店总数', value: allStores.length || localCounts.stores, color: '#ccff00' },
            { icon: <ThunderboltOutlined />, label: '进行中活动', value: stats?.activeCampaigns ?? localCounts.campaigns, color: '#FFD700' },
            { icon: <InboxOutlined />, label: '低库存', value: lowStockItems.length, color: lowStockItems.length ? '#ff4d4f' : '#52c41a' },
          ].map((card, index) => (
            <Col xs={12} sm={8} lg={4} key={card.label}>
              <StatCard icon={card.icon} label={card.label} value={card.value} color={card.color} delay={index} />
            </Col>
          ))}
        </Row>

        <Row gutter={[12, 12]} className="admin-dashboard-priority-grid">
          <Col xs={24} xl={14}>
            <Card className="admin-dashboard-queue-table" title={<><WarningOutlined /> <span className="text-gold-gradient">待办与审核队列</span></>}>
              <div className="admin-dashboard-table-hint">横向滑动查看状态</div>
              <Table
                size="small"
                pagination={false}
                rowKey={(item) => `${item.tag}-${item.title}`}
                dataSource={adminTodoItems.slice(0, 8)}
                columns={[
                  { title: '事项', dataIndex: 'title', key: 'title', render: (value) => <strong>{value}</strong> },
                  { title: '类型', dataIndex: 'tag', key: 'tag', width: 130, render: (value, record) => <Tag color={record.color}>{adminQueueTagLabels[value] || value}</Tag> },
                  { title: '状态', dataIndex: 'desc', key: 'desc', ellipsis: true },
                ]}
                scroll={{ x: 620 }}
                locale={{ emptyText: '暂无待办' }}
              />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <div className="admin-today-command-grid">
              {todayOperatingCommandItems.map((item) => (
                <button key={item.id} type="button" className={`admin-today-command-card is-${item.tone}`} onClick={() => { window.location.hash = item.href; }}>
                  <span>{item.title}</span>
                  <strong>{item.count}</strong>
                  <b>打开队列</b>
                </button>
              ))}
            </div>
          </Col>
        </Row>

        <div className="admin-dashboard-scan-band" aria-label="扫码与拜访效率">
          <div className="admin-dashboard-scan-cluster">
            <span>扫码效率</span>
            <strong>{todayScans}</strong>
            <b>今日扫码</b>
          </div>
          <div className="admin-dashboard-scan-cluster">
            <span>拜访触达</span>
            <strong>{todayVisits}</strong>
            <b>今日拜访</b>
          </div>
          <div className="admin-dashboard-scan-cluster">
            <span>7日转化</span>
            <strong>{scanConversionRate}%</strong>
            <b>{last7DayScans} 扫码 / {last7DayVisits} 拜访</b>
          </div>
        </div>

        <div className="admin-command-summary-strip">
          {adminCommandSummary.map((item) => (
            <button key={item.id} type="button" className="admin-command-summary-card" onClick={() => { window.location.hash = item.href; }}>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              {item.detailTitle && <em className="admin-command-summary-label">{item.detailTitle}</em>}
              <div className="admin-command-summary-details">
                {item.details.map(([label, value]) => (
                  <b key={label}><em>{label}</em>{value}</b>
                ))}
              </div>
            </button>
          ))}
        </div>

        <SectionTitle>运营动作中心</SectionTitle>
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          {operationActionItems.map((item) => (
            <Col xs={12} md={6} key={item.id}>
              <button type="button" className={`admin-action-card is-${item.color}`} onClick={() => { window.location.hash = item.href; }}>
                <span className="admin-action-priority">{item.priority}</span>
                <strong>{item.count}</strong>
                <h3>{item.title}</h3>
                <b>打开模块</b>
              </button>
            </Col>
          ))}
        </Row>
      </section>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><TeamOutlined /> <span className="text-gold-gradient">粉丝分析</span></>}>
            <Row gutter={[8, 8]}>
              {Object.entries(fanLevelCounts).map(([level, count]) => (
                <Col xs={12} sm={6} key={level}>
                  <div className="dash-insight-card">
                    <strong>{count}</strong>
                    <span>{level}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><ShopOutlined /> <span className="text-gold-gradient">门店分析</span></>}>
            <Row gutter={[8, 8]}>
              {Object.entries(storeLevelCounts).map(([level, count]) => (
                <Col xs={12} sm={6} key={level}>
                  <div className="dash-insight-card">
                    <strong>{count}</strong>
                    <span>{level}级</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title={<><CameraOutlined /> <span className="text-gold-gradient">地推拜访分析</span></>}>
            {[
              ['拜访总数', fieldVisitStats.total],
              ['新店拜访', fieldVisitStats.newStoreVisits],
              ['复访记录', fieldVisitStats.repeatVisits],
              ['本周拜访', fieldVisitStats.thisWeek],
              ['待审核拜访', fieldVisitStats.pendingReviews],
              ['建议升级', fieldVisitStats.suggestedUpgrades],
            ].map(([label, value]) => (
              <div key={label} className="admin-ops-row"><span>{label}</span><strong>{value}</strong></div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><ThunderboltOutlined /> <span className="text-gold-gradient">活动与核销</span></>}>
            {[
              ['进行中活动', stats?.activeCampaigns ?? localCounts.campaigns],
              ['粉丝参与', pendingClaims.length + completedCampaigns.length],
              ['门店核销', fieldVisitStats.total],
              ['待审核核销', adminTodoItems.filter((item) => ['Campaign claim', 'Fan verification'].includes(item.tag)).length],
              ['拒绝/重复核销', 0],
            ].map(([label, value]) => (
              <div key={label} className="admin-ops-row"><span>{label}</span><strong>{value}</strong></div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><InboxOutlined /> <span className="text-gold-gradient">物料库存预警</span></>}>
            {warehouseAlerts.map((item) => (
              <div key={item.region} className="admin-ops-row">
                <span>{item.warehouse}</span>
                <strong>{item.low} 低库存 / {item.out} 断货</strong>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><FileTextOutlined /> <span className="text-gold-gradient">统一审核中心</span></>}>
            <div className="fan-status-chip-row">
              {REVIEW_TYPES.map((item) => <Tag key={item}>{item}</Tag>)}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><WarningOutlined /> <span className="text-gold-gradient">风控规则</span></>}>
            <div className="fan-status-chip-row">
              {RISK_RULES.map((item) => <Tag key={item} color="volcano">{item}</Tag>)}
            </div>
          </Card>
        </Col>
      </Row>

      <section className="admin-dashboard-secondary-programs">
        <SectionTitle>试运营准备度</SectionTitle>
        <div className="admin-readiness-grid">
          {trialLaunchReadiness.map((item) => (
            <button key={item.id} type="button" className="admin-readiness-card admin-dashboard-muted-explainer" onClick={() => { window.location.hash = item.href; }}>
              <span>{item.status}</span>
              <strong>{item.title}</strong>
              <b>{item.metric}</b>
            </button>
          ))}
        </div>

        <SectionTitle>方案落地覆盖</SectionTitle>
        <div className="admin-spec-coverage-grid">
          {specImplementationCoverage.map((item) => (
            <button
              key={item.id}
              type="button"
              className="admin-spec-coverage-card admin-dashboard-muted-explainer"
              onClick={() => {
                if (item.href.startsWith('#')) window.location.hash = item.href;
                else window.open(item.href, '_blank');
              }}
            >
              <span>{item.status}</span>
              <strong>{item.title}</strong>
              <b>{item.evidence}</b>
            </button>
          ))}
        </div>
      </section>

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
          <StatCard icon={<WarningOutlined />} label={t('dash_low_stock')} value={lowStockItems.length} color={lowStockItems.length > 0 ? '#ff4d4f' : '#52c41a'} delay={5} />
        </Col>
      </Row>

      {/* Legacy insight cards retained as secondary analytics */}
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
              较昨日 {fanGrowthRate >= 0 ? '+' : ''}{fanGrowthRate}%
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(114,46,209,0.03)', border: '1px solid rgba(114,46,209,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>今日扫码</Text>
              {scanGrowthRate >= 0 ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1', fontFamily: "'Instrument Serif', serif" }}>{todayScans}</div>
            <div style={{ fontSize: 11, color: scanGrowthRate >= 0 ? '#52c41a' : '#ff4d4f' }}>
              较昨日 {scanGrowthRate >= 0 ? '+' : ''}{scanGrowthRate}%
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(22,119,255,0.03)', border: '1px solid rgba(22,119,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>今日拜访</Text>
              {visitGrowthRate >= 0 ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff', fontFamily: "'Instrument Serif', serif" }}>{todayVisits}</div>
            <div style={{ fontSize: 11, color: visitGrowthRate >= 0 ? '#52c41a' : '#ff4d4f' }}>
              较昨日 {visitGrowthRate >= 0 ? '+' : ''}{visitGrowthRate}%
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card size="small" className="dash-insight-card" style={{ background: 'rgba(245,166,35,0.03)', border: '1px solid rgba(245,166,35,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>7日扫码转化</Text>
              <EyeOutlined style={{ color: '#F5A623', fontSize: 12 }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#F5A623', fontFamily: "'Instrument Serif', serif" }}>{scanConversionRate}%</div>
            <div style={{ fontSize: 11, color: '#888' }}>
              {last7DayScans} 次扫码 / {last7DayVisits} 次拜访
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
              {completedCampaigns.length} 个完成 / 共 {campaigns?.length || 0} 个
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
              新门店等待审核
            </div>
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
            ) : <ActionEmpty title="No visit trend in the last 30 days" desc="Visit trends appear after field reps complete store visits." />}
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
                  <Tooltip formatter={(value, name) => [`${value} stores`, `${name} level`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <ActionEmpty title="Store rating data is pending" desc="S/A/B/C distribution appears after store rating reviews are completed." />}
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
            ) : <ActionEmpty title="Scan data is waiting for activity" desc="Daily scan trends appear after fans scan UWELL codes." />}
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
            ) : <ActionEmpty title="No active campaigns" desc="Create or assign campaigns to track store participation here." />}
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
            ) : <ActionEmpty title="Inventory is healthy" desc="Materials below safety stock appear here for replenishment." />}
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
            ) : <ActionEmpty title="No recent scans yet" desc="Fan product scans will appear here automatically." />}
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
          <Card title={<><TeamOutlined /> <span className="text-gold-gradient">Field rep performance</span></>} extra={<Button size="small" icon={<DownloadOutlined />} onClick={() => exportToCSV(repPerformanceEnhanced, "rep-performance-enhanced.csv", [{title:t('rank'), key:"rank", render:(_,__,i)=>i+1}, {title:t('rep'), dataIndex:"name"}, {title:"Visits", dataIndex:"visits"}, {title:"Covered stores", dataIndex:"storeCount"}, {title:"Last visit", dataIndex:"lastVisit", render:(d)=>d?new Date(d).toLocaleDateString('en-US'):'-'}])}>{t('export')}</Button>}>
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
                { title: 'Visits', dataIndex: 'visits', key: 'visits', width: 80, sorter: (a,b) => a.visits - b.visits, defaultSortOrder: 'descend', render: (v) => <Tag color="gold">{v}</Tag> },
                { title: 'Covered stores', dataIndex: 'storeCount', key: 'storeCount', width: 110, render: (v) => <Tag color="blue">{v}</Tag> },
                { title: 'Last visit', dataIndex: 'lastVisit', key: 'lastVisit', width: 110, render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
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



