import React from 'react';
import { Table, Card, Tag, Spin, Empty, Button, Select, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfiles, updateProfile } from '../../services/api';
import { ROLE_NAMES } from '../../utils/constants';

const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const { data: profiles = [], isLoading } = useQuery({ queryKey: ['profiles'], queryFn: getProfiles });

  const updateMutation = useMutation({
    mutationFn: ({ id, profile }) => updateProfile(id, profile),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profiles'] }); message.success('User updated'); },
  });

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v) => v || '-' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'default'}>{ROLE_NAMES[role] || role}</Tag> },
    {
      title: 'Change Role', key: 'change',
      render: (_, record) => (
        <Select value={record.role} style={{ width: 150 }} onChange={(v) => updateMutation.mutate({ id: record.id, profile: { role: v } })} options={Object.entries(ROLE_NAMES).map(([k, v]) => ({ label: v, value: k }))} />
      ),
    },
  ];

  return (
    <Card title="User Management">
      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
     !profiles.length ? <Empty description="No users" /> :
     <Table rowKey="id" dataSource={profiles} columns={columns} pagination={false} />}
    </Card>
  );
};

export default UserManagementPage;
