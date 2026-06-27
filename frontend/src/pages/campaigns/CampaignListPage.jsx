import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Button, Tabs, Select, Tag, Row, Col, Spin, Empty, Badge, Progress, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../../services/api';
import { CAMPAIGN_TYPES } from '../../utils/constants';

const { Text } = Typography;
const statusConfig = { planned: { color: 'blue', text: 'Planned' }, ongoing: { color: 'processing', text: 'Ongoing' }, completed: { color: 'default', text: 'Completed' }, cancelled: { color: 'red', text: 'Cancelled' } };

const CampaignListPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [typeFilter, setTypeFilter] = useState(undefined);

  const { data: campaigns = [], isLoading } = useQuery({ queryKey: ['campaigns', { status: statusFilter, type: typeFilter }], queryFn: () => getCampaigns({ status: statusFilter, type: typeFilter }) });

  return (
    <div>
      <Card title="Campaign Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/campaigns/create')}>New Campaign</Button>} style={{ marginBottom: 16 }}>
        <Tabs activeKey={statusFilter || 'all'} onChange={(k) => setStatusFilter(k === 'all' ? undefined : k)} items={[
          { key: 'all', label: 'All' }, { key: 'planned', label: 'Planned' }, { key: 'ongoing', label: 'Ongoing' }, { key: 'completed', label: 'Completed' },
        ]} />
        <Select placeholder="Type" value={typeFilter} onChange={setTypeFilter} allowClear style={{ width: 200 }} options={CAMPAIGN_TYPES.map(t => ({ label: t, value: t }))} />
      </Card>

      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
       !campaigns.length ? <Empty description="No campaigns" /> :
       <Row gutter={[16, 16]}>
         {campaigns.map(c => {
           const totalTasks = c.tasks?.length || 0;
           const doneTasks = c.tasks?.filter(t => t.status === 'done').length || 0;
           return (
             <Col xs={24} sm={12} lg={8} key={c.id}>
               <Card hoverable onClick={() => navigate(`/campaigns/${c.id}`)} title={<span>{c.name}</span>} extra={<Badge status={c.status === 'ongoing' ? 'processing' : c.status === 'planned' ? 'default' : 'success'} text={<Tag color={statusConfig[c.status]?.color}>{statusConfig[c.status]?.text}</Tag>} />}>
                 <p style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>{c.type}</p>
                 <p style={{ marginBottom: 8 }}><Text type="secondary">{c.start_date} ~ {c.end_date}</Text></p>
                 <p style={{ fontSize: 13, color: '#999', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 4 }}>
                   <span>{c.store_count || c.target_stores?.length || 0} stores</span>
                   <span>Budget: ${c.budget || 0}</span>
                 </div>
                 {totalTasks > 0 && <Progress percent={Math.round(doneTasks / totalTasks * 100)} size="small" format={() => `${doneTasks}/${totalTasks} tasks`} />}
               </Card>
             </Col>
           );
         })}
       </Row>}
    </div>
  );
};

export default CampaignListPage;

