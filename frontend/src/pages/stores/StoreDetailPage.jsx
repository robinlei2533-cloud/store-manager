import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tabs, Table, Tag, Button, Spin, Empty, Row, Col, Statistic, Progress, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getStoreById, getVisits, getEvaluations } from '../../services/api';
import PageTransition from '../../components/common/PageTransition';
import localDb from '../../services/db/localDb';
import { getStoreExposureScore } from '../../utils/uwellLaunchRules';
import useAuthStore from '../../stores/authStore';

const levelColorMap = { S: 'purple', A: 'red', B: 'blue', C: 'default', D: 'orange' };

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id, profile?.id, profile?.role, profile?.region],
    queryFn: () => getStoreById(id, { scopeProfile: profile }),
    enabled: !!id,
  });
  const { data: visits = [] } = useQuery({
    queryKey: ['store-visits', id],
    queryFn: () => getVisits({ store_id: id }),
    enabled: !!id && Boolean(store),
  });
  const { data: evaluations = [] } = useQuery({
    queryKey: ['store-evaluations', id],
    queryFn: () => getEvaluations({ store_id: id }),
    enabled: !!id && Boolean(store),
  });
  const latestEval = evaluations[0];
  const latestTotal = Number(latestEval?.total_score || 0);
  const latestMax = latestTotal > 60 ? 110 : 60;
  const exposureControls = store?.exposure_controls || {};
  const storeDisplayUploads = useMemo(() => (
    localDb.find('store_display_uploads', (item) => item.store_id === id) || []
  ), [id]);
  const approvedStorefrontPhoto = storeDisplayUploads.find((item) => (
    item.category === 'store_front_photo' && item.status === 'approved'
  ));
  const approvedDisplayPhoto = storeDisplayUploads.find((item) => (
    item.category === 'display_photos' && item.status === 'approved'
  ));
  const exposureScore = store ? getStoreExposureScore(store) : 0;
  const exposureReadiness = [
    {
      label: '门头照片已通过',
      ready: Boolean(approvedStorefrontPhoto),
      detail: approvedStorefrontPhoto
        ? '可作为粉丝端门店推荐和地图详情的信任照片。'
        : '请门店上传门头照片，并在地图信任文案完成前完成审核。',
    },
    {
      label: '陈列照片已审核',
      ready: Boolean(approvedDisplayPhoto),
      detail: approvedDisplayPhoto
        ? '陈列证据可支持 S/A/B/C 等级审核。'
        : '陈列照片仍缺失或待审核。',
    },
    {
      label: '粉丝首页推荐',
      ready: Boolean(exposureControls.fan_home_recommended),
      detail: 'S/A 门店通过服务、库存和风险检查后，可推荐到粉丝首页。',
    },
    {
      label: '粉丝地图高亮',
      ready: Boolean(exposureControls.fan_map_highlighted),
      detail: '高亮门店会在粉丝端门店发现中获得更强曝光。',
    },
    {
      label: '奖励领取资格',
      ready: Boolean(exposureControls.reward_pickup_recommended || ['S', 'A'].includes(store?.level)),
      detail: '库存和审核规则允许时，合格门店可被分配为奖励领取门店。',
    },
  ];

  const visitColumns = [
    { title: '日期', dataIndex: 'visit_date', key: 'date', render: (date) => (date ? new Date(date).toLocaleDateString('en-US') : '-') },
    { title: 'Rep', dataIndex: ['profiles', 'name'], key: 'rep' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const labels = { draft: '草稿', completed: '已完成', cancelled: '已取消' };
        return <Tag color={status === 'completed' ? 'success' : status === 'cancelled' ? 'error' : 'default'}>{labels[status] || status}</Tag>;
      },
    },
    { title: '备注', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!store) {
    return (
      <PageTransition>
        <div className="bg-radial-top" style={{ minHeight: '100vh', padding: 24 }}>
          <Button type="link" onClick={() => navigate('/app/stores/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>
            &larr; 返回门店列表
          </Button>
          <Card className="crud-card" title="访问受限">
            <Empty description="未找到门店，或该门店不在你的访问范围内。" />
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="bg-radial-top" style={{ minHeight: '100vh', padding: 24 }}>
        <Button type="link" onClick={() => navigate('/app/stores/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>
          &larr; 返回门店列表
        </Button>
        <Card
          className="crud-card store-detail-rating-card"
          title={store?.name || '门店详情'}
          extra={(
            <Space wrap>
              {latestEval && <Button onClick={() => navigate(`/app/evaluation/${latestEval.id}`)}>查看评级</Button>}
              <Button type="primary" onClick={() => navigate(`/app/evaluation/create?store_id=${id}`)}>新建评级</Button>
            </Space>
          )}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={12} md={6}>
              <Statistic title="当前门店等级" value={store?.level || '-'} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="最新评级分数" value={latestEval ? latestTotal : 0} suffix={latestEval ? `/ ${latestMax}` : ''} />
            </Col>
            <Col xs={24} md={6}>
              <div className="store-rating-summary-level">
                <span>系统建议等级</span>
                <Tag color={levelColorMap[latestEval?.recommended_level || store?.level] || 'default'}>
                  {latestEval?.recommended_level || store?.level || '-'} 级
                </Tag>
              </div>
            </Col>
            <Col xs={24} md={6}>
              {latestEval ? (
                <>
                  <Progress percent={Math.min(100, Math.round((latestTotal / latestMax) * 100))} showInfo={false} strokeColor="#d6a84f" />
                  <div className="store-rating-date">
                    {latestEval.eval_date ? new Date(latestEval.eval_date).toLocaleDateString('en-US') : '最新记录'}
                  </div>
                </>
              ) : (
                <div className="store-rating-empty">暂无评级。请完成一次地推评级拜访来给门店分类。</div>
              )}
            </Col>
          </Row>
        </Card>

        <Card className="crud-card fan-exposure-readiness-card" title="粉丝曝光准备度" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Statistic title="曝光分" value={exposureScore} />
              <div style={{ marginTop: 8 }}>
                <Tag color={levelColorMap[store?.level] || 'default'}>{store?.level || 'C'} 级</Tag>
                {exposureControls.risk_downrank && <Tag color="red">风险降权</Tag>}
                {exposureControls.hidden_from_fan_app && <Tag color="default">粉丝端隐藏</Tag>}
              </div>
            </Col>
            <Col xs={24} md={18}>
              <Row gutter={[12, 12]}>
                {exposureReadiness.map((item) => (
                  <Col xs={24} md={12} xl={8} key={item.label}>
                    <div className="fan-exposure-readiness-item">
                      <Space wrap size={6}>
                        <Tag color={item.ready ? 'green' : 'gold'}>{item.ready ? '已就绪' : '需处理'}</Tag>
                        <strong>{item.label}</strong>
                      </Space>
                      <p>{item.detail}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Card>

        <Card className="crud-card" title="门店档案" style={{ marginTop: 16 }}>
          <Tabs items={[
            {
              key: 'info',
              label: '门店信息',
              children: (
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="名称">{store?.name}</Descriptions.Item>
                  <Descriptions.Item label="等级"><Tag color={levelColorMap[store?.level] || 'default'}>{store?.level || '-'}</Tag></Descriptions.Item>
                  <Descriptions.Item label="状态"><Tag color={store?.status === 'pending_review' ? 'orange' : 'green'}>{store?.status || 'active'}</Tag></Descriptions.Item>
                  <Descriptions.Item label="城市">{store?.city ? `${store.city}, ${store.country || ''}` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="地址">{store?.address}</Descriptions.Item>
                  <Descriptions.Item label="电话">{store?.phone}</Descriptions.Item>
                  <Descriptions.Item label="连锁品牌">{store?.chain_name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="连锁门店数">{store?.chain_store_count || 0}</Descriptions.Item>
                  <Descriptions.Item label="联系人">{store?.contact || '-'}</Descriptions.Item>
                  <Descriptions.Item label="坐标">{store?.lat}, {store?.lng}</Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'visits',
              label: '拜访历史',
              children: (
                <Table
                  columns={visitColumns}
                  dataSource={visits}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: <Empty description="暂无拜访记录" /> }}
                />
              ),
            },
            {
              key: 'ratings',
              label: '评级历史',
              children: (
                <Table
                  columns={[
                    { title: '日期', dataIndex: 'eval_date', key: 'date', render: (date) => (date ? new Date(date).toLocaleDateString('en-US') : '-') },
                    { title: '分数', dataIndex: 'total_score', key: 'score', render: (value) => <strong>{value}</strong> },
                    { title: '等级', dataIndex: 'recommended_level', key: 'level', render: (value) => <Tag color={levelColorMap[value] || 'default'}>{value} 级</Tag> },
                    { title: 'BD', dataIndex: ['evaluator', 'name'], key: 'bd', render: (value) => value || '-' },
                    { title: '操作', key: 'action', render: (_, record) => <Button type="link" size="small" onClick={() => navigate(`/app/evaluation/${record.id}`)}>查看</Button> },
                  ]}
                  dataSource={evaluations}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: <Empty description="暂无评级记录" /> }}
                />
              ),
            },
          ]}
          />
        </Card>
      </div>
    </PageTransition>
  );
};

export default StoreDetailPage;
