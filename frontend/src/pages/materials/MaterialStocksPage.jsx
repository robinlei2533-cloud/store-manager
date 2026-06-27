import useLanguageStore from '../../stores/languageStore';
import React from 'react';
import { Table, Tag, Card, Spin, Empty, Image } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getMaterialStocks, getMaterials } from '../../services/api';

const MaterialStocksPage = () => {
  const { data: stocks = [], isLoading } = useQuery({ queryKey: ['material-stocks'], queryFn: getMaterialStocks });
  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });

  // Merge image from materials into stocks
  const enrichedStocks = stocks.map(s => {
    const mat = materials.find(m => m.id === s.material_id);
    return { ...s, image_url: mat?.image_url };
  });

  const columns = [
    {
      title: 'Image', dataIndex: 'image_url', key: 'image', width: 70,
      render: (url) => url ? <Image src={url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 10 }}>N/A</div>,
    },
    { title: 'Material', dataIndex: ['materials', 'name'], key: 'name' },
    { title: 'SKU', dataIndex: ['materials', 'sku'], key: 'sku' },
    { title: 'Unit', dataIndex: ['materials', 'unit'], key: 'unit' },
    { title: 'Current Stock', dataIndex: 'qty', key: 'qty', sorter: (a, b) => a.qty - b.qty, render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Safety Stock', dataIndex: 'safety_stock', key: 'safety_stock' },
    {
      title: 'Status', key: 'status', render: (_, r) => {
        if (r.qty === 0) return <Tag color="red">Out of Stock</Tag>;
        if (r.qty <= r.safety_stock) return <Tag color="orange">Low Stock</Tag>;
        return <Tag color="green">Normal</Tag>;
      },
    },
  ];

  return (
    <Card title="Inventory Dashboard">
      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
     !enrichedStocks.length ? <Empty description="No inventory data" /> :
     <Table rowKey="id" dataSource={enrichedStocks} columns={columns} pagination={{ pageSize: 15, showTotal: (t) => `Total ${t} items` }} rowClassName={(r) => r.qty <= r.safety_stock ? 'low-stock-row' : ''} />}
    </Card>
  );
};

export default MaterialStocksPage;
