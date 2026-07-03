import React from 'react';
import { Table, Card, Tag, Empty, Alert } from 'antd';
import { FileTextOutlined, UserOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { IS_LOCAL_MODE } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import PageTransition from '../../components/common/PageTransition';

const OPERATION_COLORS = {
  INSERT: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
};

const AuditLogPage = () => {
  const profile = useAuthStore((s) => s.profile);

  // Role check: only admin/manager
  const allowedRoles = ['admin', 'manager'];
  const hasAccess = profile && allowedRoles.includes(profile.role);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: hasAccess && !IS_LOCAL_MODE,
  });

  if (IS_LOCAL_MODE) {
    return (
      <PageTransition>
        <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
        <Card className="liquid-glass" title={<><DatabaseOutlined /> Audit Log</>}>
          <Alert
            type="info"
            message="Local Demo Mode"
            description="Database audit logs are only available in Supabase mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable."
            showIcon
          />
        </Card>
      </div>
      </PageTransition>
    );
  }

  if (!hasAccess) {
    return (
      <PageTransition>
        <Card title={<><DatabaseOutlined /> Audit Log</>}>
          <Alert
            type="warning"
            message="Access Restricted"
            description="Only users with admin or manager roles can view audit logs."
            showIcon
          />
        </Card>
      </PageTransition>
    );
  }

  const columns = [
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => new Date(v).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      render: (op) => (
        <Tag color={OPERATION_COLORS[op] || 'default'}>
          {op}
        </Tag>
      ),
      filters: [
        { text: 'INSERT', value: 'INSERT' },
        { text: 'UPDATE', value: 'UPDATE' },
        { text: 'DELETE', value: 'DELETE' },
      ],
      onFilter: (value, record) => record.operation === value,
    },
    {
      title: 'Table',
      dataIndex: 'table_name',
      key: 'table_name',
      render: (v) => <Tag icon={<FileTextOutlined />}>{v}</Tag>,
    },
    {
      title: 'Record ID',
      dataIndex: 'record_id',
      key: 'record_id',
      render: (v) => v ? <Tag>{v}</Tag> : '-',
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (v) => v ? <><UserOutlined /> {v}</> : '-',
    },
    {
      title: 'Changes',
      dataIndex: 'changed_fields',
      key: 'changed_fields',
      ellipsis: true,
      render: (v) => v ? JSON.stringify(v) : '-',
    },
  ];

  return (
    <PageTransition>
      <Card title={<><DatabaseOutlined /> Audit Log</>}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div>
        ) : !logs.length ? (
          <Empty description="No audit logs found" />
        ) : (
          <Table
            rowKey="id"
            dataSource={logs}
            columns={columns}
            pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </PageTransition>
  );
};

export default AuditLogPage;
