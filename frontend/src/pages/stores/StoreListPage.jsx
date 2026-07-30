import useLanguageStore from '../../stores/languageStore';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Button, Input, Select, Space, Tag, Empty, Card, Upload, message, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, ImportOutlined, DownloadOutlined, StarOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStores, createStore, updateStore, getEvaluations } from '../../services/api';
import { STORE_LEVELS } from '../../utils/constants';
import { cityOptionsForCountry, countryOptions } from '../../utils/trialOps';
import PageTransition from '../../components/common/PageTransition';
import localDb from '../../services/db/localDb';
import { getDisplayCategoryLabel, getStoreLevelLabel } from '../../utils/uwellClosedLoop';
import useAuthStore from '../../stores/authStore';
import { canViewCompanyScope, getAssignableReps, getScopedStoreRows, getStoreRepId } from '../../utils/uwellRoleAccess';

const levelColorMap = { S: 'purple', A: 'red', B: 'blue', C: 'default', D: 'orange' };

const exposureControls = [
  { key: 'fan_home_recommended', label: '首页推荐', recommendedLevels: ['S', 'A'] },
  { key: 'fan_map_highlighted', label: '地图高亮', recommendedLevels: ['S', 'A'] },
  { key: 'reward_pickup_recommended', label: '奖励领取', recommendedLevels: ['S', 'A'] },
  { key: 'store_events_visible', label: '活动露出', recommendedLevels: ['S', 'A', 'B'] },
  { key: 'risk_downrank', label: '风险降权', recommendedLevels: [] },
  { key: 'hidden_from_fan_app', label: '粉丝端隐藏', recommendedLevels: [] },
];

const storeStatusLabels = {
  active: '正常',
  pending_review: '待审核',
  inactive: '停用',
};

const storeStatusOptions = [
  { value: 'active', label: storeStatusLabels.active },
  { value: 'pending_review', label: storeStatusLabels.pending_review },
  { value: 'inactive', label: storeStatusLabels.inactive },
];

const parseCsv = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
};

const fanLevelFromPoints = (points) => {
  if (points >= 5000) return 'diamond';
  if (points >= 2500) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
};

const StoreListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const profile = useAuthStore((state) => state.profile);
  const savedProfileId = localStorage.getItem('store_manager_current_user');
  const activeProfile = useMemo(
    () => localDb.findById('profiles', savedProfileId) || profile || (savedProfileId?.startsWith('u-rep') ? { id: savedProfileId, role: 'rep' } : null),
    [profile, savedProfileId],
  );
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(undefined);
  const [country, setCountry] = useState(undefined);
  const [city, setCity] = useState(undefined);
  const [status, setStatus] = useState(undefined);
  const [importPanelOpen, setImportPanelOpen] = useState(false);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [localDataReadyTick, setLocalDataReadyTick] = useState(0);

  const canManageCompany = canViewCompanyScope(activeProfile);
  const reps = getAssignableReps(localDb.all('profiles') || []);

  useEffect(() => {
    const timer = window.setTimeout(() => setLocalDataReadyTick((value) => value + 1), 250);
    return () => window.clearTimeout(timer);
  }, [activeProfile?.id]);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores', { search, level, country, city, status, profileId: activeProfile?.id, role: activeProfile?.role }],
    queryFn: () => getStores({ search, level, country, city, status, assigned_to: canManageCompany ? null : activeProfile }),
  });

  const tableStores = useMemo(() => {
    void localDataReadyTick;
    return getScopedStoreRows({
      profile: activeProfile,
      stores,
      localStores: localDb.all('stores') || [],
      filters: { level, country, city, status, search },
    });
  }, [activeProfile, city, country, level, localDataReadyTick, search, status, stores]);

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations-store-list'],
    queryFn: () => getEvaluations({}),
  });

  const latestEvalByStore = useMemo(() => {
    const map = new Map();
    evaluations.forEach((item) => {
      if (!item.store_id) return;
      const current = map.get(item.store_id);
      if (!current || new Date(item.eval_date || item.created_at || 0) > new Date(current.eval_date || current.created_at || 0)) {
        map.set(item.store_id, item);
      }
    });
    return map;
  }, [evaluations]);

  const storeDisplayReviews = useMemo(() => {
    void reviewRefresh;
    return (localDb.all('store_display_uploads') || []).sort((a, b) => new Date(b.submitted_at || b.created_at || 0) - new Date(a.submitted_at || a.created_at || 0));
  }, [reviewRefresh]);

  const oldFanReviews = useMemo(() => {
    void reviewRefresh;
    return (localDb.all('old_fan_verifications') || []).sort((a, b) => new Date(b.submitted_at || b.created_at || 0) - new Date(a.submitted_at || a.created_at || 0));
  }, [reviewRefresh]);

  const pendingDisplayCount = storeDisplayReviews.filter((item) => item.status === 'pending').length;
  const pendingOldFanCount = oldFanReviews.filter((item) => item.status === 'pending').length;

  const handleAssignRep = async (store, repId) => {
    await updateStore(store.id, {
      rep_id: repId,
      assigned_rep_id: repId,
      assigned_at: new Date().toISOString(),
      assigned_by: activeProfile?.id || 'u-admin',
    });
    queryClient.invalidateQueries({ queryKey: ['stores'] });
    message.success('负责地推已更新。');
  };

  const handleExposureToggle = (store, controlKey) => {
    const currentFlags = store.exposure_controls || {};
    const nextFlags = { ...currentFlags, [controlKey]: !currentFlags[controlKey] };
    localDb.update('stores', store.id, { exposure_controls: nextFlags });
    localDb.insert('audit_logs', {
      actor: activeProfile?.name || activeProfile?.id || 'Admin',
      role: activeProfile?.role || 'admin',
      region: store.city || store.region || '-',
      action_type: 'Store exposure control',
      target: store.name,
      before_value: JSON.stringify(currentFlags),
      after_value: JSON.stringify(nextFlags),
      reason: controlKey,
      created_at: new Date().toISOString(),
    });
    setLocalDataReadyTick((value) => value + 1);
    message.success('门店曝光控制已更新。');
  };

  const handleReviewStoreDisplay = (record, nextStatus) => {
    const store = localDb.findById('stores', record.store_id);
    const currentFlags = store?.exposure_controls || {};
    const nextFlags = record.category === 'store_front_photo'
      ? { ...currentFlags, storefront_photo_approved: nextStatus === 'approved' }
      : currentFlags;
    localDb.update('store_display_uploads', record.id, {
      status: nextStatus,
      reviewed_at: new Date().toISOString(),
      review_note: nextStatus === 'approved'
        ? '已通过，可用于粉丝地图或陈列审核。'
        : '已拒绝。门店需要上传更清晰的照片。',
    });
    if (store && record.category === 'store_front_photo') {
      localDb.update('stores', store.id, { exposure_controls: nextFlags });
    }
    localDb.insert('audit_logs', {
      actor: activeProfile?.name || activeProfile?.id || 'Admin',
      role: activeProfile?.role || 'admin',
      region: store?.city || store?.region || record.city || '-',
      action_type: 'Store photo review',
      target: store?.name || record.store_name || record.store_id,
      before_value: JSON.stringify({
        status: record.status,
        storefront_photo_approved: currentFlags.storefront_photo_approved,
      }),
      after_value: JSON.stringify({
        status: nextStatus,
        storefront_photo_approved: nextFlags.storefront_photo_approved,
      }),
      reason: record.category === 'store_front_photo'
        ? 'store_front_photo fan map trust asset'
        : `${record.category || '陈列照片'} 审核`,
      created_at: new Date().toISOString(),
    });
    setReviewRefresh((value) => value + 1);
    setLocalDataReadyTick((value) => value + 1);
    message.success(nextStatus === 'approved' ? '门店照片已通过。' : '门店照片已拒绝。');
  };

  const handleReviewOldFan = (record, nextStatus) => {
    const wasPending = record.status === 'pending';
    localDb.update('old_fan_verifications', record.id, {
      status: nextStatus,
      reviewed_at: new Date().toISOString(),
      review_note: nextStatus === 'approved'
        ? '老粉认证已通过，奖励 100 积分。'
        : '老粉认证已拒绝。',
    });

    if (wasPending && nextStatus === 'approved') {
      const fan = localDb.findById('fans', record.fan_id);
      if (fan) {
        const nextPoints = Number(fan.points || 0) + 100;
        localDb.update('fans', fan.id, {
          points: nextPoints,
          total_contribution: Number(fan.total_contribution || 0) + 100,
          lifetime_growth_points: Number(fan.lifetime_growth_points || fan.total_contribution || 0) + 100,
          level: fanLevelFromPoints(nextPoints),
        });
        localDb.insert('fan_points_log', {
          fan_id: fan.id,
          points: 100,
          type: 'earn',
          source: '老粉认证',
          description: '人工审核通过老粉证明。',
          created_at: new Date().toISOString(),
        });
      }
    }

    setReviewRefresh((value) => value + 1);
    queryClient.invalidateQueries({ queryKey: ['fans'] });
    message.success(nextStatus === 'approved' ? '老粉已通过。' : '老粉已拒绝。');
  };

  const handleImport = async (file) => {
    try {
      const rows = parseCsv(await file.text());
      if (rows.length === 0) {
        message.error('未找到有效门店数据。');
        return;
      }

      let successCount = 0;
      let failCount = 0;
      for (const row of rows) {
        try {
          const store = {
            name: row.name || row['store name'] || '',
            address: row.address || '',
            city: row.city || '',
            country: row.country || '',
            lat: parseFloat(row.lat || row.latitude || 0) || 0,
            lng: parseFloat(row.lng || row.longitude || 0) || 0,
            level: ['S', 'A', 'B', 'C'].includes((row.level || '').toUpperCase()) ? row.level.toUpperCase() : '',
            chain_name: row.chain_name || row.chain || '',
            chain_store_count: parseInt(row.chain_store_count || 0, 10) || 0,
            contact: row.contact || '',
            phone: row.phone || '',
          };
          if (!store.name) {
            failCount += 1;
          } else {
            await createStore(store);
            successCount += 1;
          }
        } catch {
          failCount += 1;
        }
      }

      if (successCount > 0) {
        message.success(`导入完成：新增 ${successCount} 家门店${failCount > 0 ? `，${failCount} 条失败` : ''}。`);
        queryClient.invalidateQueries({ queryKey: ['stores'] });
      } else {
        message.error('导入失败：未找到有效门店。');
      }
      setImportPanelOpen(false);
    } catch (err) {
      message.error(`读取文件失败：${err.message}`);
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,address,city,country,lat,lng,level,chain_name,chain_store_count,contact,phone\nGood Store,123 Main St,Riyadh,Saudi Arabia,24.7136,46.6753,A,TestChain,10,John,+966500000000\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'store_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const ReviewCard = ({ item, type }) => {
    const isStoreDisplay = type === 'store';
    const statusColor = item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'gold';
    return (
      <Card size="small" className="admin-store-review-card">
        <div className="admin-store-review-item">
          <img
            src={item.image_url}
            alt={isStoreDisplay ? getDisplayCategoryLabel(item.category) : '老粉证明'}
          />
          <div className="admin-store-review-copy">
            <Space wrap size={6}>
              <strong>{isStoreDisplay ? item.store_name || item.store_id : item.fan_name || item.fan_id}</strong>
              <Tag color={statusColor}>{item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已拒绝' : '待审核'}</Tag>
              {isStoreDisplay && <Tag>{getDisplayCategoryLabel(item.category)}</Tag>}
            </Space>
            <div className="admin-store-review-meta">
              {isStoreDisplay
                ? `门店ID：${item.store_id}`
                : `粉丝ID：${item.fan_id}。证明通过后奖励 +100 积分`}
            </div>
            {item.status === 'pending' && (
              <Space className="admin-store-review-actions">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => (isStoreDisplay ? handleReviewStoreDisplay(item, 'approved') : handleReviewOldFan(item, 'approved'))}
                >
                  通过
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => (isStoreDisplay ? handleReviewStoreDisplay(item, 'rejected') : handleReviewOldFan(item, 'rejected'))}
                >
                  拒绝
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const columns = [
    {
      title: t('store_name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text, record) => <a onClick={() => navigate(`/app/stores/${record.id}`)}>{text}</a>,
    },
    { title: t('address'), dataIndex: 'address', key: 'address', width: 140, ellipsis: true },
    { title: '城市', dataIndex: 'city', key: 'city', width: 90, render: (value, record) => (value ? `${value}, ${record.country || ''}` : '-') },
    { title: t('status'), dataIndex: 'status', key: 'status', width: 120, render: (value) => <Tag color={value === 'pending_review' ? 'orange' : value === 'inactive' ? 'default' : 'green'}>{storeStatusLabels[value] || storeStatusLabels.active}</Tag> },
    { title: t('level'), dataIndex: 'level', key: 'level', width: 90, render: (value) => <Tag color={levelColorMap[value] || 'default'}>{value ? getStoreLevelLabel(value) : '-'}</Tag> },
    {
      title: '最新评级',
      key: 'rating',
      width: 150,
      render: (_, record) => {
        const latest = latestEvalByStore.get(record.id);
        if (!latest) {
          return <Button type="link" size="small" icon={<StarOutlined />} onClick={() => navigate(`/app/evaluation/create?store_id=${record.id}`)}>去评分</Button>;
        }
        const total = Number(latest.total_score || 0);
        const max = total > 60 ? 110 : 60;
        return (
          <div className="store-rating-cell">
            <div className="store-rating-cell-top">
              <Tag color={levelColorMap[latest.recommended_level] || 'default'}>{latest.recommended_level || '-'} level</Tag>
              <strong>{total}/{max}</strong>
            </div>
            <Progress percent={Math.min(100, Math.round((total / max) * 100))} showInfo={false} size="small" strokeColor="#d6a84f" />
            <button type="button" className="store-rating-link" onClick={() => navigate(`/app/evaluation/${latest.id}`)}>
              {latest.eval_date ? new Date(latest.eval_date).toLocaleDateString('en-US') : '查看详情'}
            </button>
          </div>
        );
      },
    },
    { title: t('chain'), dataIndex: 'chain_name', key: 'chain_name', width: 90, ellipsis: true },
    { title: t('chain_stores'), dataIndex: 'chain_store_count', key: 'chain_store_count', width: 80 },
    { title: t('phone'), dataIndex: 'phone', key: 'phone', width: 110 },
    ...(canManageCompany ? [{
      title: '负责地推',
      key: 'rep',
      width: 130,
      render: (_, record) => (
        <Select
          size="small"
          value={getStoreRepId(record, localDb.all('stores') || []) || undefined}
          placeholder="指定地推"
          style={{ width: 116 }}
          options={reps.map((rep) => ({ label: rep.name, value: rep.id }))}
          onChange={(value) => handleAssignRep(record, value)}
        />
      ),
    }] : []),
    {
      title: t('actions'),
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size={4} wrap>
          <Button type="link" size="small" onClick={() => navigate(`/app/stores/${record.id}`)}>{t('view')}</Button>
          {canManageCompany && <Button type="link" size="small" onClick={() => navigate(`/app/stores/create?id=${record.id}`)}>{t('edit')}</Button>}
          <Button type="link" size="small" onClick={() => navigate(`/app/evaluation/create?store_id=${record.id}`)}>评分</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageTransition>
      <Card
        className="crud-card admin-store-list-card"
        title={canManageCompany ? t('store_management_title') : '我的负责门店'}
        extra={canManageCompany ? (
          <Space>
            <Button icon={<ImportOutlined />} onClick={() => setImportPanelOpen(true)}>{t('import')}</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/stores/create')}>{t('add_store')}</Button>
          </Space>
        ) : null}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input placeholder={t('search_store_name')} prefix={<SearchOutlined />} value={search} onChange={(event) => setSearch(event.target.value)} allowClear style={{ width: 240 }} />
          <Select placeholder={t('store_level')} value={level} onChange={setLevel} allowClear style={{ width: 140 }} options={STORE_LEVELS} />
          <Select placeholder="国家" value={country} onChange={(value) => { setCountry(value); setCity(undefined); }} allowClear style={{ width: 180 }} options={countryOptions} />
          <Select placeholder="城市" value={city} onChange={setCity} allowClear disabled={!country} style={{ width: 160 }} options={cityOptionsForCountry(country)} />
          <Select
            placeholder="状态"
            value={status}
            onChange={setStatus}
            allowClear
            style={{ width: 160 }}
            options={storeStatusOptions}
          />
        </Space>

        {canManageCompany && (
          <div className="admin-store-review-grid">
            <div>
              <Card size="small" title={`门店照片审核（${pendingDisplayCount} 个待处理）`} className="admin-store-review-panel">
                {storeDisplayReviews.length
                  ? storeDisplayReviews.slice(0, 6).map((item) => <ReviewCard key={item.id} item={item} type="store" />)
                  : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无门店照片审核" />}
              </Card>
            </div>
            <div>
              <Card size="small" title={`老粉审核（${pendingOldFanCount} 个待处理）`} className="admin-store-review-panel">
                {oldFanReviews.length
                  ? oldFanReviews.slice(0, 6).map((item) => <ReviewCard key={item.id} item={item} type="oldFan" />)
                  : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无老粉审核" />}
              </Card>
            </div>
          </div>
        )}

        {canManageCompany && (
          <Card size="small" title="粉丝端曝光控制" className="admin-store-exposure-card">
            <p className="admin-store-exposure-note">
              S/A 门店优先进入粉丝首页、地图、奖励领取和活动露出；投诉、异常核销、库存缺口或服务问题可降权或隐藏。
            </p>
            <Table
              size="small"
              rowKey="id"
              dataSource={tableStores.slice(0, 6)}
              pagination={false}
              columns={[
                { title: '门店', dataIndex: 'name' },
                { title: '等级', dataIndex: 'level', render: (value) => <Tag color={levelColorMap[value] || 'default'}>{value || 'C'}</Tag> },
                {
                  title: '曝光动作',
                  render: (_, record) => (
                    <div className="admin-store-exposure-actions">
                      {exposureControls.map((control) => {
                        const active = Boolean(record.exposure_controls?.[control.key]);
                        const eligible = control.recommendedLevels.length === 0 || control.recommendedLevels.includes(record.level);
                        return (
                          <Button
                            key={control.key}
                            size="small"
                            className="admin-store-exposure-button"
                            type={active ? 'primary' : 'default'}
                            danger={['risk_downrank', 'hidden_from_fan_app'].includes(control.key)}
                            disabled={!eligible && !['risk_downrank', 'hidden_from_fan_app'].includes(control.key)}
                            onClick={() => handleExposureToggle(record, control.key)}
                          >
                            {control.label}
                          </Button>
                        );
                      })}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        )}

        <div className="admin-trial-wide-table admin-store-list-wide-table">
          <Table
            columns={columns}
            dataSource={tableStores}
            rowKey="id"
            loading={isLoading && !tableStores.length}
            locale={{ emptyText: <Empty description={t('no_stores_found')} /> }}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `${t('total')} ${total}` }}
            scroll={{ x: 1170 }}
          />
        </div>

        {importPanelOpen && (
          <Card className="crud-card" title="从 CSV 导入门店" size="small" style={{ marginTop: 16, background: '#fafafa' }}>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
                上传 CSV 文件，列包含：name, address, city, country, lat, lng, level, chain_name, chain_store_count, contact, phone。
              </p>
              <Space>
                <Upload accept=".csv,.txt" showUploadList={false} beforeUpload={(file) => { handleImport(file); return false; }}>
                  <Button type="primary" icon={<ImportOutlined />}>选择 CSV 文件</Button>
                </Upload>
                <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>下载模板</Button>
                <Button onClick={() => setImportPanelOpen(false)}>取消</Button>
              </Space>
            </Space>
          </Card>
        )}
      </Card>
    </PageTransition>
  );
};

export default StoreListPage;
