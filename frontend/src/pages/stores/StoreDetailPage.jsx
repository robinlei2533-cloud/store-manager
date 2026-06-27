import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tabs, Table, Tag, Button, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getStoreById, getVisits } from '../../services/api';

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: store, isLoading } = useQuery({ queryKey: ['store', id], queryFn: () => getStoreById(id), enabled: !!id });
  const { data: visits = [] } = useQuery({ queryKey: ['store-visits', id], queryFn: () => getVisits({ store_id: id }), enabled: !!id });

  const visitColumns = [
    { title: 'Date', dataIndex: 'visit_date', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
    { title: 'Rep', dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => { const m = { draft: 'Draft', completed: 'Done', cancelled: 'Cancelled' }; return <Tag color={s === 'completed' ? 'success' : s === 'cancelled' ? 'error' : 'default'}>{m[s] || s}</Tag>; } },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <div>
      <Button type="link" onClick={() => navigate('/app/stores/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Stores</Button>
      <Card title={store?.name || 'Store Detail'}>
        <Tabs items={[
          { key: 'info', label: 'Store Info', children: (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Name">{store?.name}</Descriptions.Item>
              <Descriptions.Item label="Level"><Tag color={store?.level === 'A' ? 'red' : store?.level === 'B' ? 'blue' : 'default'}>{store?.level || '-'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Address">{store?.address}</Descriptions.Item>
              <Descriptions.Item label="Phone">{store?.phone}</Descriptions.Item>
              <Descriptions.Item label="Chain">{store?.chain_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Chain Stores">{store?.chain_store_count || 0}</Descriptions.Item>
              <Descriptions.Item label="Contact">{store?.contact || '-'}</Descriptions.Item>
              <Descriptions.Item label="Coordinates">{store?.lat}, {store?.lng}</Descriptions.Item>
            </Descriptions>
          )},
          { key: 'visits', label: 'Visit History', children: <Table columns={visitColumns} dataSource={visits} rowKey="id" pagination={{ pageSize: 10 }} locale={{ emptyText: <Empty description="No visits yet" /> }} /> },
        ]} />
      </Card>
    </div>
  );
};

export default StoreDetailPage;

