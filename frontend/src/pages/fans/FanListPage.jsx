import useLanguageStore from '../../stores/languageStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Select, Tag, Button, Empty, Card, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getFans } from '../../services/api';
import { FAN_LEVELS } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";

const FanListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const [level, setLevel] = useState(undefined);

  const { data: fans = [], isLoading } = useQuery({ queryKey: ['fans', { level }], queryFn: () => getFans({ level }) });

  const levelMap = Object.fromEntries(FAN_LEVELS.map(f => [f.value, f]));

  const columns = [
    { title: t('fan'), dataIndex: ['profiles', 'name'], key: 'name', render: (v, r) => v || `${t('fan')} #${r.id?.slice(0, 6)}` },
    { title: t('store'), dataIndex: ['stores', 'name'], key: 'store' },
    { title: t('level'), dataIndex: 'level', key: 'level', render: (l) => <Tag color={levelMap[l]?.color || 'default'}>{levelMap[l]?.label || l}</Tag> },
    { title: t('points'), dataIndex: 'points', key: 'points', sorter: (a, b) => a.points - b.points, render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: t('total_contribution'), dataIndex: 'total_contribution', key: 'contrib' },
    { title: t('actions'), key: 'action', render: (_, r) => <Button type="link" size="small" onClick={() => navigate(`/app/fans/${r.id}`)}>{t('view')}</Button> },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass" title={t('fan_operations')} extra={<Button icon={<SettingOutlined />} onClick={() => navigate('/app/fans/rules')}>{t('points_rules')}</Button>}>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder={t('level')} value={level} onChange={setLevel} allowClear style={{ width: 150 }} options={FAN_LEVELS.map(f => ({ label: f.label, value: f.value }))} />
      </Space>
      <Table columns={columns} dataSource={fans} rowKey="id" loading={isLoading} locale={{ emptyText: <Empty description={t('no_fans')} /> }} pagination={{ pageSize: 15, showTotal: (total) => `${t('total')} ${total}` }} />
    </Card>
    </div>
    </PageTransition>);
};

export default FanListPage;

