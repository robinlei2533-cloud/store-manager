import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Tag, Empty, Card, Upload, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, ImportOutlined, DownloadOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStores, createStore } from '../../services/api';
import { STORE_LEVELS } from '../../utils/constants';

const levelColorMap = { A: 'red', B: 'blue', C: 'default' };

const StoreListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(undefined);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores', { search, level }],
    queryFn: () => getStores({ search, level }),
  });

  // Parse CSV file
  const parseCsv = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    // First line is header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      results.push(row);
    }
    return results;
  };

  const handleImport = async (file) => {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        message.error('No valid data found in file');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const row of rows) {
        try {
          const store = {
            name: row.name || row['store name'] || row['门店名称'] || '',
            address: row.address || row['地址'] || '',
            lat: parseFloat(row.lat || row.latitude || 0) || 0,
            lng: parseFloat(row.lng || row.longitude || 0) || 0,
            level: ['A', 'B', 'C'].includes((row.level || row['等级'] || '').toUpperCase()) ? row.level.toUpperCase() : '',
            chain_name: row.chain_name || row['chain'] || row['连锁'] || '',
            chain_store_count: parseInt(row.chain_store_count || row['连锁门店数'] || 0) || 0,
            contact: row.contact || row['联系人'] || '',
            phone: row.phone || row['电话'] || '',
          };
          if (store.name) {
            await createStore(store);
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        message.success(`Import complete: ${successCount} stores added${failCount > 0 ? `, ${failCount} failed` : ''}`);
        queryClient.invalidateQueries({ queryKey: ['stores'] });
      } else {
        message.error('Import failed: no valid stores found');
      }
      setImportModalOpen(false);
    } catch (err) {
      message.error('Failed to read file: ' + err.message);
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,address,lat,lng,level,chain_name,chain_store_count,contact,phone\nGood Store,123 Main St,39.9,116.4,A,TestChain,10,John,13800000000\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: 'Store Name', dataIndex: 'name', key: 'name', width: 200,
      render: (text, record) => <a onClick={() => navigate(`/stores/${record.id}`)}>{text}</a>,
    },
    { title: 'Address', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Level', dataIndex: 'level', key: 'level', width: 80, render: (level) => <Tag color={levelColorMap[level] || 'default'}>{level || '-'}</Tag> },
    { title: 'Chain', dataIndex: 'chain_name', key: 'chain_name', width: 150 },
    { title: 'Chain Stores', dataIndex: 'chain_store_count', key: 'chain_store_count', width: 110 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: 'Actions', key: 'action', width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/stores/${record.id}`)}>View</Button>
          <Button type="link" size="small" onClick={() => navigate(`/stores/create?id=${record.id}`)}>Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Store Management" extra={
      <Space>
        <Button icon={<ImportOutlined />} onClick={() => setImportModalOpen(true)}>Import</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/stores/create')}>Add Store</Button>
      </Space>
    }>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Search store name" prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 240 }} />
        <Select placeholder="Store Level" value={level} onChange={setLevel} allowClear style={{ width: 140 }} options={STORE_LEVELS} />
      </Space>
      <Table columns={columns} dataSource={stores} rowKey="id" loading={isLoading} locale={{ emptyText: <Empty description="No stores found" /> }} pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Total ${t} stores` }} scroll={{ x: 900 }} />

      {/* Import Modal */}
      {importModalOpen && (
        <Card title="Import Stores from CSV" size="small" style={{ marginTop: 16, background: '#fafafa' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
              Upload a CSV file with columns: name, address, lat, lng, level, chain_name, chain_store_count, contact, phone
            </p>
            <Space>
              <Upload accept=".csv,.txt" showUploadList={false} beforeUpload={(file) => { handleImport(file); return false; }}>
                <Button type="primary" icon={<ImportOutlined />}>Choose CSV File</Button>
              </Upload>
              <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Download Template</Button>
              <Button onClick={() => setImportModalOpen(false)}>Cancel</Button>
            </Space>
          </Space>
        </Card>
      )}
    </Card>
  );
};

export default StoreListPage;
