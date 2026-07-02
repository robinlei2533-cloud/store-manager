import useLanguageStore from '../../stores/languageStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Tabs, Select, Tag, Row, Col, Spin, Empty, Badge, Progress, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../../services/api';
import { CAMPAIGN_TYPES } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import { canViewCompanyScope, getAssignedStoreIds } from '../../utils/uwellRoleAccess';

const { Text } = Typography;
const CampaignListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const profile = useAuthStore((state) => state.profile);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [typeFilter, setTypeFilter] = useState(undefined);
  const canManageCompany = canViewCompanyScope(profile);
  const assignedStoreIds = canManageCompany ? null : getAssignedStoreIds(profile, localDb.all('stores') || []);
  const statusConfig = {
    planned: { color: 'blue', text: t('status_planned') },
    ongoing: { color: 'processing', text: t('status_ongoing') },
    completed: { color: 'default', text: t('status_completed') },
    cancelled: { color: 'red', text: t('status_cancelled') },
  };

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', { status: statusFilter, type: typeFilter, profileId: profile?.id }],
    queryFn: () => getCampaigns({ status: statusFilter, type: typeFilter, assigned_store_ids: assignedStoreIds }),
  });

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
      <Card className="crud-card liquid-glass" title={canManageCompany ? t('campaign_management_title') : '活动执行'} extra={canManageCompany ? <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/campaigns/create')}>{t('new_campaign')}</Button> : null} style={{ marginBottom: 16 }}>
        <Tabs activeKey={statusFilter || 'all'} onChange={(k) => setStatusFilter(k === 'all' ? undefined : k)} items={[
          { key: 'all', label: t('all') }, { key: 'planned', label: t('status_planned') }, { key: 'ongoing', label: t('status_ongoing') }, { key: 'completed', label: t('status_completed') },
        ]} />
        <Select placeholder={t('type')} value={typeFilter} onChange={setTypeFilter} allowClear style={{ width: 200 }} options={CAMPAIGN_TYPES.map((type) => ({ label: type, value: type }))} />
      </Card>

      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
       !campaigns.length ? <Empty description={t('no_campaigns')} /> :
       <Row gutter={[16, 16]}>
         {campaigns.map(c => {
           const totalTasks = c.tasks?.length || 0;
           const doneTasks = c.tasks?.filter(t => t.status === 'done').length || 0;
           return (
             <Col xs={24} sm={12} lg={8} key={c.id}>
          <Card className="liquid-glass" hoverable onClick={() => navigate(`/app/campaigns/${c.id}`)} title={<span>{c.name}</span>} extra={<Badge status={c.status === 'ongoing' ? 'processing' : c.status === 'planned' ? 'default' : 'success'} text={<Tag color={statusConfig[c.status]?.color}>{statusConfig[c.status]?.text}</Tag>} />}>
                 <p style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>{c.type}</p>
                 <p style={{ marginBottom: 8 }}><Text type="secondary">{c.start_date} ~ {c.end_date}</Text></p>
                 <p style={{ fontSize: 13, color: '#999', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 4 }}>
                   <span>{c.store_count || c.target_stores?.length || 0} {t('stores_unit')}</span>
                   <span>{t('budget')}: ${c.budget || 0}</span>
                 </div>
                 {totalTasks > 0 && <Progress percent={Math.round(doneTasks / totalTasks * 100)} size="small" format={() => `${doneTasks}/${totalTasks} ${t('tasks_unit')}`} />}
               </Card>
             </Col>
           );
         })}
       </Row>}
    </div>
    </PageTransition>);
};

export default CampaignListPage;

