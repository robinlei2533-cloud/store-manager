import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tabs, Table, Tag, Button, Spin, Empty, Row, Col, Statistic, Progress, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getStoreById, getVisits, getEvaluations } from '../../services/api';
import PageTransition from "../../components/common/PageTransition";

const levelColorMap = { S: 'purple', A: 'red', B: 'blue', C: 'default', D: 'orange' };

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: store, isLoading } = useQuery({ queryKey: ['store', id], queryFn: () => getStoreById(id), enabled: !!id });
  const { data: visits = [] } = useQuery({ queryKey: ['store-visits', id], queryFn: () => getVisits({ store_id: id }), enabled: !!id });
  const { data: evaluations = [] } = useQuery({ queryKey: ['store-evaluations', id], queryFn: () => getEvaluations({ store_id: id }), enabled: !!id });
  const latestEval = evaluations[0];
  const latestTotal = Number(latestEval?.total_score || 0);
  const latestMax = latestTotal > 60 ? 110 : 60;

  const visitColumns = [
    { title: 'Date', dataIndex: 'visit_date', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
    { title: 'Rep', dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => { const m = { draft: 'Draft', completed: 'Done', cancelled: 'Cancelled' }; return <Tag color={s === 'completed' ? 'success' : s === 'cancelled' ? 'error' : 'default'}>{m[s] || s}</Tag>; } },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
      <Button type="link" onClick={() => navigate('/app/stores/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Stores</Button>
      <Card className="crud-card store-detail-rating-card" title={store?.name || 'Store Detail'} extra={
        <Space wrap>
          {latestEval && <Button onClick={() => navigate(`/app/evaluation/${latestEval.id}`)}>查看评级</Button>}
          <Button type="primary" onClick={() => navigate(`/app/evaluation/create?store_id=${id}`)}>新增评分</Button>
        </Space>
      }>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={12} md={6}>
            <Statistic title="当前门店等级" value={store?.level || '-'} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="最新评分" value={latestEval ? latestTotal : 0} suffix={latestEval ? `/ ${latestMax}` : ''} />
          </Col>
          <Col xs={24} md={6}>
            <div className="store-rating-summary-level">
              <span>自动评级</span>
              <Tag color={levelColorMap[latestEval?.recommended_level || store?.level] || 'default'}>
                {latestEval?.recommended_level || store?.level || '-'} 级
              </Tag>
            </div>
          </Col>
          <Col xs={24} md={6}>
            {latestEval ? (
              <>
                <Progress percent={Math.min(100, Math.round((latestTotal / latestMax) * 100))} showInfo={false} strokeColor="#d6a84f" />
                <div className="store-rating-date">{latestEval.eval_date ? new Date(latestEval.eval_date).toLocaleDateString() : '最近记录'}</div>
              </>
            ) : (
              <div className="store-rating-empty">暂无评分，建议完成一次 BD 现场评级。</div>
            )}
          </Col>
        </Row>
      </Card>

      <Card className="crud-card" title="门店档案" style={{ marginTop: 16 }}>
        <Tabs items={[
          { key: 'info', label: 'Store Info', children: (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Name">{store?.name}</Descriptions.Item>
              <Descriptions.Item label="Level"><Tag color={levelColorMap[store?.level] || 'default'}>{store?.level || '-'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color={store?.status === 'pending_review' ? 'orange' : 'green'}>{store?.status || 'active'}</Tag></Descriptions.Item>
              <Descriptions.Item label="City">{store?.city ? `${store.city}, ${store.country || ''}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Address">{store?.address}</Descriptions.Item>
              <Descriptions.Item label="Phone">{store?.phone}</Descriptions.Item>
              <Descriptions.Item label="Chain">{store?.chain_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Chain Stores">{store?.chain_store_count || 0}</Descriptions.Item>
              <Descriptions.Item label="Contact">{store?.contact || '-'}</Descriptions.Item>
              <Descriptions.Item label="Coordinates">{store?.lat}, {store?.lng}</Descriptions.Item>
            </Descriptions>
          )},
          { key: 'visits', label: 'Visit History', children: <Table columns={visitColumns} dataSource={visits} rowKey="id" pagination={{ pageSize: 10 }} locale={{ emptyText: <Empty description="No visits yet" /> }} /> },
          { key: 'ratings', label: 'Rating History', children: <Table
            columns={[
              { title: 'Date', dataIndex: 'eval_date', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
              { title: 'Score', dataIndex: 'total_score', key: 'score', render: (v) => <strong>{v}</strong> },
              { title: 'Level', dataIndex: 'recommended_level', key: 'level', render: (v) => <Tag color={levelColorMap[v] || 'default'}>{v} 级</Tag> },
              { title: 'BD', dataIndex: ['evaluator', 'name'], key: 'bd', render: (v) => v || '-' },
              { title: 'Action', key: 'action', render: (_, record) => <Button type="link" size="small" onClick={() => navigate(`/app/evaluation/${record.id}`)}>查看</Button> },
            ]}
            dataSource={evaluations}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: <Empty description="No ratings yet" /> }}
          /> },
        ]} />
      </Card>
    </div>
    </PageTransition>);
};

export default StoreDetailPage;

