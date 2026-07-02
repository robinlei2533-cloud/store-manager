import useLanguageStore from '../../stores/languageStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Button, DatePicker, Select, Space, Tag, Empty, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getVisits } from '../../services/api';
import PageTransition from "../../components/common/PageTransition";
import useAuthStore from '../../stores/authStore';
import { canViewCompanyScope } from '../../utils/uwellRoleAccess';

const VisitListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const profile = useAuthStore((state) => state.profile);
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState(undefined);

  const { RangePicker } = DatePicker;

  const filters = {};
  if (!canViewCompanyScope(profile) && profile?.id) filters.rep_id = profile.id;
  if (status) filters.status = status;
  if (dateRange && dateRange[0] && dateRange[1]) {
    filters.date_from = dateRange[0].format('YYYY-MM-DD');
    filters.date_to = dateRange[1].format('YYYY-MM-DD');
  }

  const { data: visits = [], isLoading } = useQuery({ queryKey: ['visits', filters], queryFn: () => getVisits(filters) });

  const statusMap = {
    draft: { color: 'default', text: t('status_draft') },
    completed: { color: 'success', text: t('status_completed') },
    cancelled: { color: 'error', text: t('status_cancelled') },
  };

  const columns = [
    { title: t('store'), dataIndex: ['stores', 'name'], key: 'store' },
    { title: t('date'), dataIndex: 'visit_date', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
    { title: t('rep'), dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag> },
    { title: t('notes'), dataIndex: 'notes', key: 'notes', ellipsis: true },
    { title: t('actions'), key: 'action', render: (_, r) => <Button type="link" size="small" onClick={() => navigate(`/app/visits/${r.id}`)}>{t('view')}</Button> },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
    <Card className="crud-card liquid-glass" title={t('visit_management_title')} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/visits/create')}>{t('new_visit')}</Button>}>
      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker value={dateRange} onChange={setDateRange} />
        <Select placeholder={t('status')} value={status} onChange={setStatus} allowClear style={{ width: 140 }} options={[
          { label: t('status_draft'), value: 'draft' }, { label: t('status_completed'), value: 'completed' }, { label: t('status_cancelled'), value: 'cancelled' },
        ]} />
      </Space>
      <Table columns={columns} dataSource={visits} rowKey="id" loading={isLoading} locale={{ emptyText: <Empty description={t('no_visits_found')} /> }} pagination={{ pageSize: 15, showTotal: (total) => `${t('total')} ${total}` }} scroll={{ x: 700 }} />
    </Card>
    </div>
    </PageTransition>);
};

export default VisitListPage;

