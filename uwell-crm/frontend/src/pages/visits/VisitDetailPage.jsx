import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tabs, Table, Image, Tag, Button, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getVisitById, getVisitSales, getVisitPhotos } from '../../services/api';

const VisitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: visit, isLoading } = useQuery({ queryKey: ['visit', id], queryFn: () => getVisitById(id), enabled: !!id });
  const { data: sales = [] } = useQuery({ queryKey: ['visit-sales', id], queryFn: () => getVisitSales(id), enabled: !!id });
  const { data: photos = [] } = useQuery({ queryKey: ['visit-photos', id], queryFn: () => getVisitPhotos(id), enabled: !!id });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  const statusMap = { draft: 'Draft', completed: 'Completed', cancelled: 'Cancelled' };
  const photoTypeMap = { shelf: 'Shelf', display: 'Display', exterior: 'Exterior', product: 'Product' };

  const salesColumns = [
    { title: 'Product', dataIndex: ['products', 'name'], key: 'name' },
    { title: 'SKU', dataIndex: ['products', 'sku'], key: 'sku' },
    { title: 'Sales Qty', dataIndex: 'sales_qty', key: 'sqty' },
    { title: 'Sales Amount', dataIndex: 'sales_amount', key: 'samt', render: (v) => `$${(v || 0).toFixed(2)}` },
    { title: 'Stock Qty', dataIndex: 'stock_qty', key: 'stock' },
  ];

  return (
    <div>
      <Button type="link" onClick={() => navigate('/app/visits/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Visits</Button>
      <Card title="Visit Detail">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Store">{visit?.stores?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Date">{visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString('en-US') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Rep">{visit?.profiles?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color={visit?.status === 'completed' ? 'success' : visit?.status === 'cancelled' ? 'error' : 'default'}>{statusMap[visit?.status] || '-'}</Tag></Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>{visit?.notes || '-'}</Descriptions.Item>
        </Descriptions>
        <Tabs style={{ marginTop: 16 }} items={[
          { key: 'sales', label: 'Sales Data', children: <Table columns={salesColumns} dataSource={sales} rowKey="id" pagination={false} size="small" locale={{ emptyText: <Empty description="No sales data" /> }} /> },
          { key: 'photos', label: 'Photos', children: photos.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {photos.map((p) => (
                <div key={p.id} style={{ textAlign: 'center' }}>
                  <Image src={p.photo_url} width={150} height={150} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ marginTop: 4 }}><Tag>{photoTypeMap[p.photo_type] || p.photo_type}</Tag></div>
                </div>
              ))}
            </div>
          ) : <Empty description="No photos" /> },
        ]} />
      </Card>
    </div>
  );
};

export default VisitDetailPage;
