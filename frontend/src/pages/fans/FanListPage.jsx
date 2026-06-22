import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Select, Tag, Button, Spin, Empty, Card, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getFans } from '../../services/api';
import { FAN_LEVELS } from '../../utils/constants';

const FanListPage = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(undefined);

  const { data: fans = [], isLoading } = useQuery({ queryKey: ['fans', { level }], queryFn: () => getFans({ level }) });

  const levelMap = Object.fromEntries(FAN_LEVELS.map(f => [f.value, f]));

  const columns = [
    { title: 'Fan', dataIndex: ['profiles', 'name'], key: 'name', render: (v, r) => v || `Fan #${r.id?.slice(0, 6)}` },
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store' },
    { title: 'Level', dataIndex: 'level', key: 'level', render: (l) => <Tag color={levelMap[l]?.color || 'default'}>{levelMap[l]?.label || l}</Tag> },
    { title: 'Points', dataIndex: 'points', key: 'points', sorter: (a, b) => a.points - b.points, render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Total Contribution', dataIndex: 'total_contribution', key: 'contrib' },
    { title: 'Actions', key: 'action', render: (_, r) => <Button type="link" size="small" onClick={() => navigate(`/fans/${r.id}`)}>View</Button> },
  ];

  return (
    <Card title="Fan Operations" extra={<Button icon={<SettingOutlined />} onClick={() => navigate('/fans/rules')}>Rules</Button>}>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Level" value={level} onChange={setLevel} allowClear style={{ width: 150 }} options={FAN_LEVELS.map(f => ({ label: f.label, value: f.value }))} />
      </Space>
      <Table columns={columns} dataSource={fans} rowKey="id" loading={isLoading} locale={{ emptyText: <Empty description="No fans" /> }} pagination={{ pageSize: 15, showTotal: (t) => `Total ${t} fans` }} />
    </Card>
  );
};

export default FanListPage;
