import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Tag, Input, Select, Space, Statistic, Row, Col, Spin, Empty } from 'antd';
import { PlusOutlined, SearchOutlined, StarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getEvaluations } from '../../services/api';

const EvalListPage = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(undefined);
  const [search, setSearch] = useState('');

  const { data: evals = [], isLoading } = useQuery({ queryKey: ['evaluations', { level }], queryFn: () => getEvaluations({ level }) });

  const filtered = search ? evals.filter(e => e.stores?.name?.toLowerCase().includes(search.toLowerCase())) : evals;
  const avgScore = filtered.length > 0 ? (filtered.reduce((sum, e) => sum + e.total_score, 0) / filtered.length).toFixed(1) : 0;
  const aCount = filtered.filter(e => e.recommended_level === 'A').length;
  const bCount = filtered.filter(e => e.recommended_level === 'B').length;
  const cCount = filtered.filter(e => e.recommended_level === 'C').length;

  const columns = [
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store' },
    { title: 'Date', dataIndex: 'eval_date', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
    { title: 'Total Score', dataIndex: 'total_score', key: 'score', render: (v) => <span style={{ fontWeight: 700, fontSize: 16 }}>{v}</span> },
    { title: 'Level', dataIndex: 'recommended_level', key: 'level', render: (l) => <Tag color={l === 'A' ? 'green' : l === 'B' ? 'blue' : 'orange'}>{l}</Tag> },
    { title: 'Evaluator', dataIndex: ['evaluator', 'name'], key: 'evaluator' },
    { title: 'Actions', key: 'action', render: (_, r) => <Button type="link" size="small" onClick={() => navigate(`/evaluation/${r.id}`)}>View</Button> },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="Avg Score" value={avgScore} suffix="/60" prefix={<StarOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="Level A" value={aCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="Level B" value={bCount} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="Level C" value={cCount} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>
      <Card title="Store Evaluation" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/evaluation/create')}>New Evaluation</Button>}>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="Search store" prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 200 }} />
          <Select placeholder="Level" value={level} onChange={setLevel} allowClear style={{ width: 120 }} options={[{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }]} />
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={isLoading} locale={{ emptyText: <Empty description="No evaluations" /> }} pagination={{ pageSize: 15, showTotal: (t) => `Total ${t}` }} />
      </Card>
    </div>
  );
};

export default EvalListPage;
