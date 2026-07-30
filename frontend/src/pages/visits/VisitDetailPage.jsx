import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tabs, Table, Image, Tag, Button, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getVisitById, getVisitSales, getVisitPhotos, getSStoreVisitDetails } from '../../services/api';
import PageTransition from "../../components/common/PageTransition";
import useAuthStore from '../../stores/authStore';

const VisitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const { data: visit, isLoading } = useQuery({ queryKey: ['visit', id, profile?.id, profile?.role, profile?.region], queryFn: () => getVisitById(id, { scopeProfile: profile }), enabled: !!id });
  const { data: sales = [] } = useQuery({ queryKey: ['visit-sales', id], queryFn: () => getVisitSales(id), enabled: !!id && Boolean(visit) });
  const { data: photos = [] } = useQuery({ queryKey: ['visit-photos', id], queryFn: () => getVisitPhotos(id), enabled: !!id && Boolean(visit) });
  const { data: sStoreVisitDetails = [] } = useQuery({
    queryKey: ['s-store-visit-details', visit?.store_id, id],
    queryFn: () => getSStoreVisitDetails(visit.store_id),
    enabled: !!id && Boolean(visit?.store_id),
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!visit) {
    return (
      <PageTransition>
        <div className="bg-radial-top" style={{ minHeight: "100vh", padding: 24 }}>
          <Button type="link" onClick={() => navigate('/app/visits/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; 返回拜访列表</Button>
          <Card className="liquid-glass" title="访问受限">
            <Empty description="未找到拜访记录，或该记录不在你的可访问范围内。" />
          </Card>
        </div>
      </PageTransition>
    );
  }

  const statusMap = { draft: '草稿', completed: '已完成', cancelled: '已取消' };
  const photoTypeMap = { shelf: '货架', display: '陈列', exterior: '门头', product: '产品' };
  const sStoreVisitDetail = sStoreVisitDetails.find((record) => record.visit_id === id);

  const salesColumns = [
    { title: '产品', dataIndex: ['products', 'name'], key: 'name' },
    { title: 'SKU', dataIndex: ['products', 'sku'], key: 'sku' },
    { title: '销售数量', dataIndex: 'sales_qty', key: 'sqty' },
    { title: '销售金额', dataIndex: 'sales_amount', key: 'samt', render: (v) => `$${(v || 0).toFixed(2)}` },
    { title: '库存数量', dataIndex: 'stock_qty', key: 'stock' },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
      <Button type="link" onClick={() => navigate('/app/visits/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; 返回拜访列表</Button>
      <Card className="liquid-glass" title="拜访详情">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="门店">{visit?.stores?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="日期">{visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString('zh-CN') : '-'}</Descriptions.Item>
          <Descriptions.Item label="地推">{visit?.profiles?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={visit?.status === 'completed' ? 'success' : visit?.status === 'cancelled' ? 'error' : 'default'}>{statusMap[visit?.status] || '-'}</Tag></Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{visit?.notes || '-'}</Descriptions.Item>
        </Descriptions>
        <Tabs style={{ marginTop: 16 }} items={[
          { key: 'sales', label: '销售数据', children: <Table columns={salesColumns} dataSource={sales} rowKey="id" pagination={false} size="small" locale={{ emptyText: <Empty description="暂无销售数据" /> }} /> },
          { key: 's-store-visit-detail', label: 'S店拜访详情', children: sStoreVisitDetail ? (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="库存状态">{sStoreVisitDetail.inventory_status || '-'}</Descriptions.Item>
              <Descriptions.Item label="陈列状态">{sStoreVisitDetail.display_status || '-'}</Descriptions.Item>
              <Descriptions.Item label="动销观察" span={2}>{sStoreVisitDetail.sell_through_observation || '-'}</Descriptions.Item>
              <Descriptions.Item label="竞品情况" span={2}>{sStoreVisitDetail.competitor_situation || '-'}</Descriptions.Item>
              <Descriptions.Item label="热卖品牌">{sStoreVisitDetail.hot_brands || '-'}</Descriptions.Item>
              <Descriptions.Item label="热卖口味">{sStoreVisitDetail.hot_flavors || '-'}</Descriptions.Item>
              <Descriptions.Item label="消费者反馈" span={2}>{sStoreVisitDetail.consumer_feedback || '-'}</Descriptions.Item>
              <Descriptions.Item label="市场备注" span={2}>{sStoreVisitDetail.market_notes || '-'}</Descriptions.Item>
              <Descriptions.Item label="需要支持">{sStoreVisitDetail.support_needed || '-'}</Descriptions.Item>
              <Descriptions.Item label="需要补货">
                <Tag color={sStoreVisitDetail.replenishment_needed ? 'error' : 'success'}>
                  {sStoreVisitDetail.replenishment_needed ? '是' : '否'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : <Empty description="暂无S店拜访详情" /> },
          { key: 'photos', label: '照片', children: photos.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {photos.map((p) => (
                <div key={p.id} style={{ textAlign: 'center' }}>
                  <Image src={p.photo_url} width={150} height={150} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ marginTop: 4 }}><Tag>{photoTypeMap[p.photo_type] || p.photo_type}</Tag></div>
                </div>
              ))}
            </div>
          ) : <Empty description="暂无照片" /> },
        ]} />
      </Card>
    </div>
    </PageTransition>);
};

export default VisitDetailPage;

