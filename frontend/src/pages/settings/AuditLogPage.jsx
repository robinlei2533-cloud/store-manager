import React, { useMemo, useState } from 'react';
import { Table, Card, Tag, Empty, Alert, Spin, Space, Select, Input, DatePicker, Button } from 'antd';
import { FileTextOutlined, UserOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { isLocalMode } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import PageTransition from '../../components/common/PageTransition';
import localDb from '../../services/db/localDb';
import { canViewCompanyScope, getAssignedRegion } from '../../utils/uwellRoleAccess';

const { RangePicker } = DatePicker;

const OPERATION_COLORS = {
  INSERT: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  '员工账号创建': 'purple',
  '门店等级变更': 'gold',
  '物料申请审批': 'cyan',
  '扫码风险处理': 'volcano',
};

const isLocalPreviewHost = () => {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

const normalizeAuditLog = (log) => ({
  ...log,
  actor: log.actor || log.user_name || log.user_id || '-',
  role: log.role || log.actor_role || '-',
  region: log.region || log.city || log.warehouse_region || '-',
  action_type: log.action_type || log.operation || 'UPDATE',
  target: log.target || log.target_object || log.record_id || log.table_name || '-',
  before_value: log.before_value || log.before || '',
  after_value: log.after_value || log.after || '',
  reason: log.reason || log.note || (log.changed_fields ? JSON.stringify(log.changed_fields) : ''),
});

const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const exportAuditLogs = (logs) => {
  const cols = [
    ['时间', 'created_at'],
    ['操作人', 'actor'],
    ['角色', 'role'],
    ['区域', 'region'],
    ['操作类型', 'action_type'],
    ['对象', 'target'],
    ['变更前', 'before_value'],
    ['变更后', 'after_value'],
    ['原因 / 备注', 'reason'],
  ];
  const header = cols.map(([label]) => escapeCsvValue(label)).join(',');
  const rows = logs.map((log) => cols.map(([, key]) => escapeCsvValue(log[key])).join(','));
  const blob = new Blob([`\uFEFF${header}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `uwell-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 200);
};

const AuditLogPage = () => {
  const profile = useAuthStore((s) => s.profile);
  const useLocalAuditLogs = isLocalMode() || isLocalPreviewHost();
  const [actionType, setActionType] = useState(undefined);
  const [actorRole, setActorRole] = useState(undefined);
  const [region, setRegion] = useState(undefined);
  const [targetSearch, setTargetSearch] = useState('');
  const [dateRange, setDateRange] = useState(null);

  const allowedRoles = ['admin', 'manager'];
  const hasAccess = profile && allowedRoles.includes(profile.role);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      if (useLocalAuditLogs) {
        const localLogs = localDb.all('audit_logs') || [];
        if (localLogs.length) return localLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [
          { id: 'demo-audit-1', actor: 'UWELL Admin', role: 'admin', region: 'Riyadh', action_type: '员工账号创建', target: 'rep1@uwell.com', before_value: 'none', after_value: 'rep / active / Riyadh', reason: '试运营地推账号', created_at: new Date().toISOString() },
          { id: 'demo-audit-2', actor: 'Riyadh Manager', role: 'manager', region: 'Riyadh', action_type: '门店等级变更', target: 'Riyadh Vape Hub', before_value: 'A', after_value: 'S', reason: '陈列和活动表现已通过', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: 'demo-audit-3', actor: 'UWELL Admin', role: 'admin', region: 'Riyadh', action_type: 'Store exposure control', target: 'Riyadh Vape Hub', before_value: '{}', after_value: '{"fan_home_recommended":true}', reason: 'S-level trial exposure', created_at: new Date(Date.now() - 7200000).toISOString() },
          { id: 'demo-audit-4', actor: 'Dammam Manager', role: 'manager', region: 'Dammam', action_type: '物料申请审批', target: 'Dammam Warehouse', before_value: 'pending', after_value: 'approved', reason: '区域物料支持', created_at: new Date(Date.now() - 10800000).toISOString() },
        ];
      }
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: hasAccess,
  });

  const normalizedLogs = useMemo(() => logs.map(normalizeAuditLog), [logs]);
  const scopedLogs = useMemo(() => {
    if (canViewCompanyScope(profile)) return normalizedLogs;
    const assignedRegion = getAssignedRegion(profile);
    return normalizedLogs.filter((log) => log.region === assignedRegion || String(log.region || '').includes(assignedRegion || '__none__'));
  }, [profile, normalizedLogs]);
  const actionTypeOptions = useMemo(
    () => [...new Set(scopedLogs.map((log) => log.action_type).filter(Boolean))].map((value) => ({ label: value, value })),
    [scopedLogs],
  );
  const roleOptions = useMemo(
    () => [...new Set(scopedLogs.map((log) => log.role).filter(Boolean))].map((value) => ({ label: value, value })),
    [scopedLogs],
  );
  const regionOptions = useMemo(
    () => [...new Set(scopedLogs.map((log) => log.region).filter((value) => value && value !== '-'))].map((value) => ({ label: value, value })),
    [scopedLogs],
  );
  const filteredLogs = useMemo(() => scopedLogs.filter((log) => {
    if (actionType && log.action_type !== actionType) return false;
    if (actorRole && log.role !== actorRole) return false;
    if (region && log.region !== region) return false;
    if (targetSearch) {
      const needle = targetSearch.trim().toLowerCase();
      const haystack = [log.target, log.actor, log.reason, log.action_type].join(' ').toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (dateRange?.[0] && dateRange?.[1]) {
      const createdAt = new Date(log.created_at).getTime();
      if (createdAt < dateRange[0].startOf('day').valueOf() || createdAt > dateRange[1].endOf('day').valueOf()) return false;
    }
    return true;
  }), [scopedLogs, actionType, actorRole, region, targetSearch, dateRange]);

  if (!hasAccess) {
    return (
      <PageTransition>
        <Card title={<><DatabaseOutlined /> 审计日志</>}>
          <Alert
            type="warning"
            title="访问受限"
            description="只有 admin 或 manager 角色可以查看审计日志。"
            showIcon
          />
        </Card>
      </PageTransition>
    );
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => new Date(v).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
    },
    {
      title: '操作类型',
      dataIndex: 'action_type',
      key: 'action_type',
      render: (op) => <Tag color={OPERATION_COLORS[op] || 'default'}>{op || 'UPDATE'}</Tag>,
    },
    {
      title: '操作人',
      dataIndex: 'actor',
      key: 'actor',
      render: (v) => <><UserOutlined /> {v || '-'}</>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (v) => <Tag>{v || '-'}</Tag>,
    },
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region',
      render: (v) => v || '-',
    },
    { title: '对象', dataIndex: 'target', key: 'target', render: (v) => v || '-' },
    { title: '变更前', dataIndex: 'before_value', key: 'before_value', ellipsis: true, render: (v) => v || '-' },
    { title: '变更后', dataIndex: 'after_value', key: 'after_value', ellipsis: true, render: (v) => v || '-' },
    {
      title: '原因 / 备注',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (v) => v || '-',
    },
  ];

  return (
    <PageTransition>
      <Card className="admin-settings-page admin-settings-audit-page" title={<><DatabaseOutlined /> 审计日志</>}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div>
        ) : !logs.length ? (
          <Empty description="暂无审计日志" />
        ) : (
          <>
            <div className="admin-audit-summary-strip">
              <div className="admin-audit-summary-item"><span>可见日志</span><strong>{filteredLogs.length}</strong></div>
              <div className="admin-audit-summary-item"><span>关键操作</span><strong>{filteredLogs.filter((log) => /level|reward|scan|material|staff|point|等级|奖励|扫码|物料|员工|积分/i.test(log.action_type)).length}</strong></div>
              <div className="admin-audit-summary-item"><span>可见区域</span><strong>{regionOptions.length || (getAssignedRegion(profile) ? 1 : 0)}</strong></div>
              <div className="admin-audit-summary-item"><span>角色范围</span><strong>{canViewCompanyScope(profile) ? '全部' : getAssignedRegion(profile) || '已分配'}</strong></div>
            </div>
            <Space wrap style={{ marginBottom: 16 }}>
              <RangePicker value={dateRange} onChange={setDateRange} />
              <Select placeholder="操作类型" value={actionType} onChange={setActionType} allowClear style={{ width: 220 }} options={actionTypeOptions} />
              <Select placeholder="操作人角色" value={actorRole} onChange={setActorRole} allowClear style={{ width: 150 }} options={roleOptions} />
              <Select placeholder="区域" value={region} onChange={setRegion} allowClear style={{ width: 150 }} options={regionOptions} disabled={!canViewCompanyScope(profile)} />
              <Input.Search placeholder="搜索对象、操作人、原因" value={targetSearch} onChange={(event) => setTargetSearch(event.target.value)} allowClear style={{ width: 260 }} />
              <Button icon={<FileTextOutlined />} onClick={() => exportAuditLogs(filteredLogs)} disabled={!filteredLogs.length}>导出CSV</Button>
            </Space>
            <Table
              rowKey="id"
              dataSource={filteredLogs}
              columns={columns}
              pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
              scroll={{ x: 1000 }}
            />
          </>
        )}
      </Card>
    </PageTransition>
  );
};

export default AuditLogPage;
