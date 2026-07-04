import useLanguageStore from '../../stores/languageStore';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Button, Input, Select, Space, Tag, Empty, Card, Upload, message, Progress, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, ImportOutlined, DownloadOutlined, StarOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStores, createStore, updateStore, getEvaluations } from '../../services/api';
import { STORE_LEVELS } from '../../utils/constants';
import { cityOptionsForCountry, countryOptions } from '../../utils/trialOps';
import PageTransition from "../../components/common/PageTransition";
import localDb from '../../services/db/localDb';
import { getDisplayCategoryLabel, getStoreLevelLabel } from '../../utils/uwellClosedLoop';
import useAuthStore from '../../stores/authStore';
import { canViewCompanyScope, filterByAssignedStores, getAssignableReps, getStoreRepId } from '../../utils/uwellRoleAccess';

const levelColorMap = { S: 'purple', A: 'red', B: 'blue', C: 'default', D: 'orange' };

const StoreListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const profile = useAuthStore((state) => state.profile);
  const savedProfileId = localStorage.getItem('store_manager_current_user');
  const activeProfile = localDb.findById('profiles', savedProfileId) || profile || (savedProfileId?.startsWith('u-rep') ? { id: savedProfileId, role: 'rep' } : null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(undefined);
  const [country, setCountry] = useState(undefined);
  const [city, setCity] = useState(undefined);
  const [status, setStatus] = useState(undefined);
  const [importModalOpen, setImportModalOpen] = useState(false);
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

  const visibleStores = useMemo(() => {
    let data = stores.length ? stores : (localDb.all('stores') || []);
    if (!canManageCompany) data = filterByAssignedStores(activeProfile, data, localDb.all('stores') || []);
    if (level) data = data.filter((store) => store.level === level);
    if (country) data = data.filter((store) => store.country === country);
    if (city) data = data.filter((store) => store.city === city);
    if (status) data = data.filter((store) => store.status === status);
    if (search) data = data.filter((store) => store.name?.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [activeProfile, canManageCompany, city, country, level, localDataReadyTick, search, status, stores]);

  const tableStores = canManageCompany
    ? visibleStores
    : (localDb.all('stores') || [])
      .filter((store) => store.rep_id === (activeProfile?.id || savedProfileId) || store.assigned_rep_id === (activeProfile?.id || savedProfileId))
      .filter((store) => !level || store.level === level)
      .filter((store) => !search || store.name?.toLowerCase().includes(search.toLowerCase()));
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

  const storeDisplayReviews = useMemo(
    () => (localDb.all('store_display_uploads') || []).sort((a, b) => new Date(b.submitted_at || b.created_at || 0) - new Date(a.submitted_at || a.created_at || 0)),
    [reviewRefresh],
  );
  const oldFanReviews = useMemo(
    () => (localDb.all('old_fan_verifications') || []).sort((a, b) => new Date(b.submitted_at || b.created_at || 0) - new Date(a.submitted_at || a.created_at || 0)),
    [reviewRefresh],
  );

  const handleAssignRep = async (store, repId) => {
    await updateStore(store.id, {
      rep_id: repId,
      assigned_rep_id: repId,
      assigned_at: new Date().toISOString(),
      assigned_by: activeProfile?.id || 'u-admin',
    });
    queryClient.invalidateQueries({ queryKey: ['stores'] });
    message.success('门店负责人已更新');
  };

  const handleReviewStoreDisplay = (record, status) => {
    localDb.update('store_display_uploads', record.id, {
      status,
      reviewed_at: new Date().toISOString(),
      review_note: status === 'approved' ? '审核通过，可在粉丝门店推荐展示' : '审核拒绝',
    });
    setReviewRefresh((value) => value + 1);
    message.success(status === 'approved' ? '门店展示已通过' : '门店展示已拒绝');
  };

  const fanLevelFromPoints = (points) => {
    if (points >= 5000) return 'diamond';
    if (points >= 2500) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  };

  const handleReviewOldFan = (record, status) => {
    const wasPending = record.status === 'pending';
    localDb.update('old_fan_verifications', record.id, {
      status,
      reviewed_at: new Date().toISOString(),
      review_note: status === 'approved' ? '老粉验证通过，奖励 100 积分' : '审核拒绝',
    });

    if (wasPending && status === 'approved') {
      const fan = localDb.findById('fans', record.fan_id);
      if (fan) {
        const nextPoints = Number(fan.points || 0) + 100;
        localDb.update('fans', fan.id, {
          points: nextPoints,
          total_contribution: Number(fan.total_contribution || 0) + 100,
          level: fanLevelFromPoints(nextPoints),
        });
        localDb.insert('fan_points_log', {
          fan_id: fan.id,
          points: 100,
          type: 'earn',
          source: '老粉验证',
          description: '老粉验证人工审核通过',
          created_at: new Date().toISOString(),
        });
      }
    }

    setReviewRefresh((value) => value + 1);
    queryClient.invalidateQueries({ queryKey: ['fans'] });
    message.success(status === 'approved' ? '老粉验证已通过' : '老粉验证已拒绝');
  };

  const ReviewCard = ({ item, type }) => {
    const isStoreDisplay = type === 'store';
    const statusColor = item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'gold';
    return (
      <Card size="small" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <img src={item.image_url} alt={isStoreDisplay ? getDisplayCategoryLabel(item.category) : '老粉验证'} style={{ width: 86, height: 86, objectFit: 'cover', borderRadius: 8, background: '#f5f5f5' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Space wrap size={6}>
              <strong>{isStoreDisplay ? item.store_name : item.fan_name}</strong>
              <Tag color={statusColor}>{item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已拒绝' : '待审核'}</Tag>
              {isStoreDisplay && <Tag>{getDisplayCategoryLabel(item.category)}</Tag>}
            </Space>
            <div style={{ color: '#666', fontSize: 12, marginTop: 6 }}>
              {isStoreDisplay ? `门店：${item.store_id}` : `粉丝：${item.fan_id} · 通过后 +100 积分`}
            </div>
            {item.status === 'pending' && (
              <Space style={{ marginTop: 10 }}>
                <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => (isStoreDisplay ? handleReviewStoreDisplay(item, 'approved') : handleReviewOldFan(item, 'approved'))}>通过</Button>
                <Button size="small" danger icon={<CloseOutlined />} onClick={() => (isStoreDisplay ? handleReviewStoreDisplay(item, 'rejected') : handleReviewOldFan(item, 'rejected'))}>拒绝</Button>
              </Space>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Parse CSV file
  const parseCsv = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    // First line is header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      results.push(row);
    }
    return results;
  };

  const handleImport = async (file) => {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        message.error('No valid data found in file');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const row of rows) {
        try {
          const store = {
            name: row.name || row['store name'] || row['门店名称'] || '',
            address: row.address || row['地址'] || '',
            lat: parseFloat(row.lat || row.latitude || 0) || 0,
            lng: parseFloat(row.lng || row.longitude || 0) || 0,
            level: ['A', 'B', 'C'].includes((row.level || row['等级'] || '').toUpperCase()) ? row.level.toUpperCase() : '',
            chain_name: row.chain_name || row['chain'] || row['连锁'] || '',
            chain_store_count: parseInt(row.chain_store_count || row['连锁门店数'] || 0) || 0,
            contact: row.contact || row['联系人'] || '',
            phone: row.phone || row['电话'] || '',
          };
          if (store.name) {
            await createStore(store);
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        message.success(`Import complete: ${successCount} stores added${failCount > 0 ? `, ${failCount} failed` : ''}`);
        queryClient.invalidateQueries({ queryKey: ['stores'] });
      } else {
        message.error('Import failed: no valid stores found');
      }
      setImportModalOpen(false);
    } catch (err) {
      message.error('Failed to read file: ' + err.message);
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,address,lat,lng,level,chain_name,chain_store_count,contact,phone\nGood Store,123 Main St,39.9,116.4,A,TestChain,10,John,13800000000\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: t('store_name'), dataIndex: 'name', key: 'name', width: 150,
      render: (text, record) => <a onClick={() => navigate(`/app/stores/${record.id}`)}>{text}</a>,
    },
    { title: t('address'), dataIndex: 'address', key: 'address', width: 140, ellipsis: true },
    { title: 'City', dataIndex: 'city', key: 'city', width: 90, render: (value, record) => value ? `${value}, ${record.country || ''}` : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', width: 90, render: (value) => <Tag color={value === 'pending_review' ? 'orange' : value === 'inactive' ? 'default' : 'green'}>{value || 'active'}</Tag> },
    { title: t('level'), dataIndex: 'level', key: 'level', width: 70, render: (level) => <Tag color={levelColorMap[level] || 'default'}>{level ? getStoreLevelLabel(level) : '-'}</Tag> },
    {
      title: '最新评级',
      key: 'rating',
      width: 110,
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
              <Tag color={levelColorMap[latest.recommended_level] || 'default'}>{latest.recommended_level || '-'} 级</Tag>
              <strong>{total}/{max}</strong>
            </div>
            <Progress percent={Math.min(100, Math.round((total / max) * 100))} showInfo={false} size="small" strokeColor="#d6a84f" />
            <button type="button" className="store-rating-link" onClick={() => navigate(`/app/evaluation/${latest.id}`)}>
              {latest.eval_date ? new Date(latest.eval_date).toLocaleDateString() : '查看详情'}
            </button>
          </div>
        );
      },
    },
    { title: t('chain'), dataIndex: 'chain_name', key: 'chain_name', width: 80, ellipsis: true },
    { title: t('chain_stores'), dataIndex: 'chain_store_count', key: 'chain_store_count', width: 60 },
    { title: t('phone'), dataIndex: 'phone', key: 'phone', width: 80 },
    ...(canManageCompany ? [{
      title: '负责地推',
      key: 'rep',
      width: 100,
      render: (_, record) => (
        <Select
          size="small"
          value={getStoreRepId(record, localDb.all('stores') || []) || undefined}
          placeholder="指定地推"
          style={{ width: 92 }}
          options={reps.map((rep) => ({ label: rep.name, value: rep.id }))}
          onChange={(value) => handleAssignRep(record, value)}
        />
      ),
    }] : []),
    {
      title: t('actions'), key: 'action', width: 100,
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
      <Card className="crud-card" title={canManageCompany ? t('store_management_title') : '我的负责门店'} extra={canManageCompany ? (
      <Space>
        <Button icon={<ImportOutlined />} onClick={() => setImportModalOpen(true)}>{t('import')}</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/stores/create')}>{t('add_store')}</Button>
      </Space>
    ) : null}>
        <Space wrap style={{ marginBottom: 16 }}>
         <Input placeholder={t('search_store_name')} prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 240 }} />
         <Select placeholder={t('store_level')} value={level} onChange={setLevel} allowClear style={{ width: 140 }} options={STORE_LEVELS} />
          <Select placeholder="Country" value={country} onChange={(value) => { setCountry(value); setCity(undefined); }} allowClear style={{ width: 180 }} options={countryOptions} />
          <Select placeholder="City" value={city} onChange={setCity} allowClear disabled={!country} style={{ width: 160 }} options={cityOptionsForCountry(country)} />
          <Select
            placeholder="Status"
            value={status}
            onChange={setStatus}
            allowClear
            style={{ width: 160 }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'pending_review', label: 'Pending review' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Space>
      {canManageCompany && <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card size="small" title={`门店展示审核（${storeDisplayReviews.filter((item) => item.status === 'pending').length} 待审）`}>
            {storeDisplayReviews.length ? storeDisplayReviews.slice(0, 6).map((item) => <ReviewCard key={item.id} item={item} type="store" />) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无门店展示待审内容" />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title={`老粉验证审核（${oldFanReviews.filter((item) => item.status === 'pending').length} 待审）`}>
            {oldFanReviews.length ? oldFanReviews.slice(0, 6).map((item) => <ReviewCard key={item.id} item={item} type="oldFan" />) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无老粉验证待审内容" />}
          </Card>
        </Col>
      </Row>}
      <Table columns={columns} dataSource={tableStores} rowKey="id" loading={isLoading && !tableStores.length} locale={{ emptyText: <Empty description={t('no_stores_found')} /> }} pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `${t('total')} ${total}` }} scroll={{ x: 1070 }} />

      {/* Import Modal */}
      {importModalOpen && (
        <Card className="crud-card" title="Import Stores from CSV" size="small" style={{ marginTop: 16, background: '#fafafa' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
              Upload a CSV file with columns: name, address, lat, lng, level, chain_name, chain_store_count, contact, phone
            </p>
            <Space>
              <Upload accept=".csv,.txt" showUploadList={false} beforeUpload={(file) => { handleImport(file); return false; }}>
                <Button type="primary" icon={<ImportOutlined />}>Choose CSV File</Button>
              </Upload>
              <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Download Template</Button>
              <Button onClick={() => setImportModalOpen(false)}>Cancel</Button>
            </Space>
          </Space>
        </Card>
      )}
    </Card>
    </PageTransition>);
};

export default StoreListPage;

