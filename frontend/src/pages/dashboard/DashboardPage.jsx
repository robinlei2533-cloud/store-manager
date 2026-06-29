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
import { motion } from 'framer-motion';
import BlurText from '../../components/effects/BlurText';
import CountUp from '../../components/effects/CountUp';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Empty, Typography, Alert, List, Progress, Badge } from 'antd';
import {
  ShopOutlined, CameraOutlined, ClockCircleOutlined, TeamOutlined, InboxOutlined,
  WarningOutlined, RiseOutlined, ThunderboltOutlined, QrcodeOutlined, StarOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import localDb from "../../services/db/localDb";
import useAuthStore from '../../stores/authStore';
import {
  getDashboardStats, getVisitTrend, getStoreDistribution, getVisits,
  getCampaigns, getScanRecords, getMaterialStocks, getScanTrend, IS_LOCAL_MODE,
} from '../../services/api';

import { useDashboardRealtime } from './useDashboardRealtime';
const { Title, Text } = Typography;

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

const StatCard = ({ icon, label, value, color = '#FFD700', delay = 0 }) => {
  const cardRef = useRef(null);
  const { t } = useLanguageStore();
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
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
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
    if (coords.length > 0) map.fitBounds(L.latLngBounds(coords), { padding: [30,30] });
    mapRef.current = map;
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [stores, visitCounts]);
  return React.createElement('div', { style: { width:'100%', height:400, borderRadius:12, overflow:'hidden', position:'relative' } },
    React.createElement('div', { ref: containerRef, style: { width:'100%', height:'100%' } })
  );
};

const DashboardPage = () => {
  const { t } = useLanguageStore();
  const profile = useAuthStore((s) => s.profile);
  useDashboardRealtime();

  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const { data: trendData, isLoading: trendLoading } = useQuery({ queryKey: ['visit-trend'], queryFn: () => getVisitTrend(30) });
  const { data: storeDistribution } = useQuery({ queryKey: ['store-distribution'], queryFn: getStoreDistribution });
  const { data: recentVisits, isLoading: visitsLoading } = useQuery({ queryKey: ['recent-visits'], queryFn: () => getVisits({}) });
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({ queryKey: ['dashboard-campaigns'], queryFn: () => getCampaigns({}) });
  const { data: scanRecords, isLoading: scansLoading } = useQuery({ queryKey: ['dashboard-scans'], queryFn: () => getScanRecords({}) });
  const { data: materialStocks, isLoading: stockLoading } = useQuery({ queryKey: ['dashboard-stocks'], queryFn: getMaterialStocks });
  const [pendingClaims, setPendingClaims] = useState([]);
  useEffect(() => {
    try {
      const all = localDb.all('campaign_claims') || [];
      setPendingClaims(all.filter(cl => cl.status === 'pending'));
    } catch(e) {}
  }, []);

  const { data: scanTrend, isLoading: scanTrendLoading } = useQuery({ queryKey: ["scan-trend"], queryFn: () => getScanTrend(30) });

  const repStatsArray = React.useMemo(() => {
    if (!recentVisits) return [];
    const map = {};
    recentVisits.forEach(v => {
      if (v.rep_id) {
        if (!map[v.rep_id]) map[v.rep_id] = { rep_id: v.rep_id, name: v.profiles?.name || v.rep_id, count: 0 };
        map[v.rep_id].count++;
      }
    });
    return Object.values(map).sort((a,b) => b.count - a.count).slice(0, 10);
  }, [recentVisits]);

  const topStoresArray = React.useMemo(() => {
    if (!recentVisits) return [];
    const map = {};
    recentVisits.forEach(v => {
      if (v.store_id) {
        if (!map[v.store_id]) map[v.store_id] = { store_id: v.store_id, name: v.stores?.name || v.store_id, count: 0 };
        map[v.store_id].count++;
      }
    });
    return Object.values(map).sort((a,b) => b.count - a.count).slice(0, 10);
  }, [recentVisits]);

  const levelPieData = storeDistribution?.reduce((acc, store) => {
    const level = store.level || 'Unrated';
    const existing = acc.find((i) => i.name === level);
    if (existing) existing.value += 1;
    else acc.push({ name: level, value: 1 });
    return acc;
  }, []) || [];

  const lowStockItems = materialStocks?.filter((s) => s.qty <= s.safety_stock) || [];

  const visitCountMap = React.useMemo(() => {
    if (!recentVisits) return {};
    const m = {};
    recentVisits.forEach(v => { if (v.store_id) m[v.store_id] = (m[v.store_id] || 0) + 1; });
    return m;
  }, [recentVisits]);

  const recentVisitColumns = [
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store', ellipsis: true },
    { title: 'Rep', dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: 'Date', dataIndex: 'visit_date', key: 'date', render: (d) => (d ? new Date(d).toLocaleDateString('en-US') : '-'), width: 110 },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 100,
      render: (s) => {
        const map = { draft: { color: 'default', text: 'Draft' }, completed: { color: 'success', text: 'Done' }, cancelled: { color: 'error', text: 'Cancelled' } };
        const item = map[s] || { color: 'default', text: s };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={4} className="dash-section">
        <span className="text-gold-gradient"><RiseOutlined /> {t('nav_dashboard2')}</span>
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>{t('welcome_back')}, {profile?.name || t('profile')}</Text>
      </Title>

      {IS_LOCAL_MODE && (
        <Alert type="info" message={t('local_demo')} description={t('local_demo_desc')} showIcon style={{ marginBottom: 16 }} />
      )}

            <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<ShopOutlined />} label={t('dash_store')} value={stats?.storeCount || 0} color="#FFD700" delay={0} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<CameraOutlined />} label={t('dash_visits')} value={stats?.totalVisits || 0} color="#FFD700" delay={1} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<TeamOutlined />} label={t('dash_fans')} value={stats?.totalFans || 0} color="#F5A623" delay={2} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<ThunderboltOutlined />} label={t('dash_campaigns')} value={stats?.activeCampaigns || 0} color="#FFD700" delay={3} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<QrcodeOutlined />} label={t('dash_scans')} value={stats?.todayScans || 0} color="#FFD700" delay={4} /></Col>
        <Col xs={12} sm={8} lg={3}><StatCard icon={<WarningOutlined />} label={t('dash_low_stock')} value={stats?.lowStockCount || 0} color={stats?.lowStockCount > 0 ? '#ff4d4f' : '#52c41a'} delay={5} /></Col>
      </Row>

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
            ) : <Empty description={t('dash_no_visit_data')} className="dash-empty" />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><StarOutlined /> <span className="text-gold-gradient">{t('dash_store_level_distribution')}</span></>}>
            {levelPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={levelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {levelPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.name] || COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty description={t('dash_no_store_data')} style={{ padding: '60px 0' }} />}
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
            ) : <Empty description={t('dash_no_scan_data')} style={{ padding: '60px 0' }} />}
          </Card>
        </Col>
      </Row>

      {/* Pending Material Dispatch */}
      {pendingClaims.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title={`📦 Material Dispatch Needed (${pendingClaims.length})`} size="small">
              <List size="small" dataSource={pendingClaims} renderItem={(cl) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status="processing" />}
                    title={<span className="dash-card-title-light">{cl.campaign_name || "Campaign"}</span>}
                    description={`Store: ${cl.store_id || "N/A"} · Claimed: ${new Date(cl.claimed_at).toLocaleDateString()}`}
                  />
                  <Tag color="volcano">Needs Dispatch</Tag>
                </List.Item>
              )} />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><ThunderboltOutlined /> <span className="text-gold-gradient">Campaign Overview</span></>}>
            {campaignsLoading ? <div className="dash-loading-sm"><Spin /></div> :
             campaigns?.length > 0 ? (
              <List size="small" dataSource={campaigns.slice(0, 5)} renderItem={(c) => (
                <List.Item>
                  <List.Item.Meta title={<span><Tag color={c.status === 'ongoing' ? 'processing' : c.status === 'completed' ? 'default' : 'blue'}>{c.status === 'ongoing' ? 'Ongoing' : c.status === 'completed' ? 'Completed' : c.status === 'planned' ? 'Planned' : 'Cancelled'}</Tag>{c.name}</span>} description={`${c.type} · ${c.start_date} ~ ${c.end_date} · ${c.store_count || (c.target_stores?.length || 0)} stores`} />
                </List.Item>
              )} />
            ) : <Empty description="No campaigns" className="dash-empty-sm" />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><WarningOutlined /> <span className="text-gold-gradient">Low Stock Alerts</span></>}>
            {stockLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> :
             lowStockItems.length > 0 ? (
              <List size="small" dataSource={lowStockItems} renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={<span><Badge status={item.qty === 0 ? 'error' : 'warning'} />{item.materials?.name}</span>} description={<span>Current: <Text type="danger" strong>{item.qty}</Text> / Safety: {item.safety_stock} {item.materials?.unit}<Progress percent={Math.round((item.qty / (item.safety_stock * 2)) * 100)} size="small" status={item.qty === 0 ? 'exception' : 'active'} style={{ maxWidth: 200, marginTop: 4 }} /></span>} />
                </List.Item>
              )} />
            ) : <Empty description="All stock levels are healthy" style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={<><CameraOutlined /> <span className="text-gold-gradient">Recent Visits</span></>}>
            <Table columns={recentVisitColumns} dataSource={recentVisits?.slice(0, 8) || []} rowKey="id" loading={visitsLoading} pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: 'No visit records' }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><QrcodeOutlined /> <span className="text-gold-gradient">Recent Scans</span></>}>
            {scansLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> :
             scanRecords?.length > 0 ? (
              <List size="small" dataSource={scanRecords.slice(0, 8)} renderItem={(r) => (
                <List.Item>
                  <List.Item.Meta avatar={<QrcodeOutlined style={{ fontSize: 20, color: '#722ed1' }} />} title={`${r.products?.name || 'Unknown'} · +${r.points_earned} pts`} description={`${r.stores?.name || ''} · ${new Date(r.created_at).toLocaleString('en-US')}`} />
                </List.Item>
              )} />
            ) : <Empty description="No scan records" style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
      </Row>

      {/* Store Visit Heatmap */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title={<span className="dash-card-title-gold">Store Visit Heatmap</span>} extra={
            <Button size="small" icon={<DownloadOutlined />} onClick={() => {
              const data = (storeDistribution || []).map(s => ({ name: s.name, level: s.level || "Unrated", visits: visitCountMap[s.id] || 0 }));
              exportToCSV(data, "stores-heatmap.csv", [{title:"Store", dataIndex:"name"}, {title:"Level", dataIndex:"level"}, {title:"Visits", dataIndex:"visits"}]);
            }}>Export</Button>
          }>
            {storeDistribution?.length > 0 ? (
              <StoreHeatmap stores={storeDistribution} visitCounts={visitCountMap} onStoreClick={(s) => { window.open("/#/app/stores/" + s.id, "_blank"); }} />
            ) : (
              <div className="dash-no-data">No store data</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><TeamOutlined /> <span className="text-gold-gradient">Rep Performance (Visit Count)</span></>} extra={<Button size="small" icon={<DownloadOutlined />} onClick={() => exportToCSV(repStatsArray, "rep-performance.csv", [{title:"Rank", key:"rank", render:(_,__,i)=>i+1}, {title:"Rep", dataIndex:"name"}, {title:"Visits", dataIndex:"count"}])}>Export</Button>}>
            {repStatsArray.length > 0 ? (
              <Table columns={[
                { title: 'Rank', key: 'rank', width: 60, render: (_, __, i) => i + 1 },
                { title: 'Rep', dataIndex: 'name', key: 'name' },
                { title: 'Visits', dataIndex: 'count', key: 'count', sorter: (a,b) => a.count - b.count, defaultSortOrder: 'descend' },
              ]} dataSource={repStatsArray} rowKey="rep_id" pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: "No data" }} />
            ) : <Empty description="No rep activity" style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><StarOutlined /> <span className="text-gold-gradient">Top Visited Stores</span></>} extra={<Button size="small" icon={<DownloadOutlined />} onClick={() => exportToCSV(topStoresArray, "top-stores.csv", [{title:"Rank", key:"rank", render:(_,__,i)=>i+1}, {title:"Store", dataIndex:"name"}, {title:"Visits", dataIndex:"count"}])}>Export</Button>}>
            {topStoresArray.length > 0 ? (
              <Table columns={[
                { title: 'Rank', key: 'rank', width: 60, render: (_, __, i) => i + 1 },
                { title: 'Store', dataIndex: 'name', key: 'name' },
                { title: 'Visits', dataIndex: 'count', key: 'count', sorter: (a,b) => a.count - b.count, defaultSortOrder: 'descend' },
              ]} dataSource={topStoresArray} rowKey="store_id" pagination={false} size="small" scroll={{ x: true }} locale={{ emptyText: "No data" }} />
            ) : <Empty description="No store visits" style={{ padding: '40px 0' }} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;



