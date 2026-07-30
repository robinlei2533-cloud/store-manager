import useLanguageStore from '../../stores/languageStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Tabs, Select, Tag, Spin, Empty, Badge, Progress, Typography } from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../../services/api';
import { CAMPAIGN_TYPES } from '../../utils/constants';
import PageTransition from '../../components/common/PageTransition';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import { canViewCompanyScope, getAssignedStoreIds } from '../../utils/uwellRoleAccess';

const { Text } = Typography;

const campaignHandoffItems = [
  ['粉丝端新鲜度', '保持活跃活动可见，避免粉丝任务过期无聊。'],
  ['需要审核', '门店创建或门店支持的活动，粉丝曝光前需要回到审核中心。'],
  ['门店执行', '进行中的活动要连接门店任务、核销和领取流程。'],
  ['过期或已完成', '已完成活动保留为绩效历史，不再作为粉丝端新鲜内容。'],
];

const getCampaignFreshnessState = (campaign) => {
  if (['completed', 'cancelled', 'archived'].includes(campaign.status)) {
    return { label: '仅历史记录', color: 'default' };
  }
  if (['pending', 'pending_review', 'review_pending'].includes(campaign.approval_status || campaign.review_status)) {
    return { label: '粉丝曝光前需审核', color: 'orange' };
  }
  if (campaign.status === 'ongoing') {
    return { label: '当前粉丝可见', color: 'green' };
  }
  return { label: '新鲜度状态', color: 'blue' };
};

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
      <div className="bg-radial-top admin-campaigns-page">
        <Card
          className="crud-card liquid-glass admin-campaign-toolbar"
          title={canManageCompany ? t('campaign_management_title') : '活动执行'}
          extra={canManageCompany ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/campaigns/create')}>
              {t('new_campaign')}
            </Button>
          ) : null}
        >
          <div className="admin-campaign-filter-row">
            <Tabs
              className="admin-campaign-status-tabs"
              activeKey={statusFilter || 'all'}
              onChange={(key) => setStatusFilter(key === 'all' ? undefined : key)}
              items={[
                { key: 'all', label: t('all') },
                { key: 'planned', label: t('status_planned') },
                { key: 'ongoing', label: t('status_ongoing') },
                { key: 'completed', label: t('status_completed') },
              ]}
            />
            <Select
              className="admin-campaign-type-filter"
              placeholder={t('type')}
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              options={CAMPAIGN_TYPES.map((type) => ({ label: type, value: type }))}
            />
          </div>
        </Card>

        <Card className="crud-card liquid-glass admin-campaign-handoff-strip admin-campaign-handoff-compact">
          <div className="admin-campaign-handoff-stack">
            <div>
              <Text strong>活动运营交接</Text>
              <p className="admin-campaign-handoff-summary">
                活动运营需要保持粉丝端活动持续上新，同时把审核和门店执行工作流转到正确的后台模块。
              </p>
            </div>
            <div className="admin-campaign-handoff-grid">
              {campaignHandoffItems.map(([title, desc]) => (
                <div className="admin-ops-mini-card admin-campaign-handoff-chip" key={title}>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
        ) : !campaigns.length ? (
          <Empty description={t('no_campaigns')} />
        ) : (
          <div className="admin-campaign-card-grid">
            {campaigns.map((campaign) => {
              const totalTasks = campaign.tasks?.length || 0;
              const doneTasks = campaign.tasks?.filter((task) => task.status === 'done').length || 0;
              const freshnessState = getCampaignFreshnessState(campaign);
              return (
                  <Card
                    className="liquid-glass admin-campaign-card"
                    hoverable
                    key={campaign.id}
                    onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                    title={<span>{campaign.name}</span>}
                    extra={(
                      <Badge
                        status={campaign.status === 'ongoing' ? 'processing' : campaign.status === 'planned' ? 'default' : 'success'}
                        text={<Tag color={statusConfig[campaign.status]?.color}>{statusConfig[campaign.status]?.text}</Tag>}
                      />
                    )}
                  >
                    <div className="admin-campaign-card-kicker">{campaign.type}</div>
                    <Tag color={freshnessState.color}>新鲜度状态：{freshnessState.label}</Tag>
                    <div className="admin-campaign-meta-row"><Text type="secondary">{campaign.start_date} ~ {campaign.end_date}</Text></div>
                    <p className="admin-campaign-description">
                      {campaign.description}
                    </p>
                    <div className="admin-campaign-metric-row">
                      <span>{campaign.store_count || campaign.target_stores?.length || 0} {t('stores_unit')}</span>
                      <span>{t('budget')}: ${campaign.budget || 0}</span>
                    </div>
                    <div className="admin-campaign-progress-row">
                      {totalTasks > 0 ? (
                        <Progress
                          percent={Math.round((doneTasks / totalTasks) * 100)}
                          size="small"
                          format={() => `${doneTasks}/${totalTasks} ${t('tasks_unit')}`}
                        />
                      ) : (
                        <span>暂无任务进度</span>
                      )}
                    </div>
                    <Button
                      block
                      className="admin-campaign-card-action"
                      icon={<EyeOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/app/campaigns/${campaign.id}`);
                      }}
                    >
                      查看
                    </Button>
                  </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default CampaignListPage;
