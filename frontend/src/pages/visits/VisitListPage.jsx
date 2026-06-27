import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Button, DatePicker, Select, Input, Space, Tag, Spin, Empty, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getVisits, getStores } from '../../services/api';
import dayjs from 'dayjs';

const VisitListPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState(undefined);

  const { RangePicker } = DatePicker;

  const filters = {};
  if (status) filters.status = status;
  if (dateRange && dateRange[0] && dateRange[1]) {
    filters.date_from = dateRange[0].format('YYYY-MM-DD');
    filters.date_to = dateRange[1].format('YYYY-MM-DD');
  }

  const { data: visits = [], isLoading } = useQuery({ queryKey: ['visits', filters], queryFn: () => getVisits(filters) });

  const statusMap = { draft: { color: 'default', text: 'Draft' }, completed: { color: 'success', text: 'Completed' }, cancelled: { color: 'error', text: 'Cancelled' } };

  const columns = [
    { title: 'Store', dataIndex: ['stores', 'name'], key: 'store' },
    { title: 'Date', dataIndex: 'visit_date', key: 'date', render: (d) => d ? new Date(d).toLocaleDateString('en-US') : '-' },
    { title: 'Rep', dataIndex: ['profiles', 'name'], key: 'rep' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag> },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', ellipsis: true },
    { title: 'Actions', key: 'action', render: (_, r) => <Button type="link" size="small" onClick={() => navigate(`/visits/${r.id}`)}>View</Button> },
  ];

  return (
    <Card title="Visit Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/visits/create')}>New Visit</Button>}>
      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker value={dateRange} onChange={setDateRange} />
        <Select placeholder="Status" value={status} onChange={setStatus} allowClear style={{ width: 140 }} options={[
          { label: 'Draft', value: 'draft' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' },
        ]} />
      </Space>
      <Table columns={columns} dataSource={visits} rowKey="id" loading={isLoading} locale={{ emptyText: <Empty description="No visits found" /> }} pagination={{ pageSize: 15, showTotal: (t) => `Total ${t} visits` }} scroll={{ x: 700 }} />
    </Card>
  );
};

export default VisitListPage;

