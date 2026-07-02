import useLanguageStore from '../../stores/languageStore';
import React from 'react';
import { Table, Card, Tag, Spin, Empty, Select, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfiles, updateProfile } from '../../services/api';
import { ROLE_NAMES } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";

const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguageStore();
  const { data: profiles = [], isLoading } = useQuery({ queryKey: ['profiles'], queryFn: getProfiles });
  const roleLabel = (role) => {
    const roleKeyMap = {
      admin: 'set_role_admin',
      manager: 'set_role_manager',
      rep: 'set_role_rep',
      fan: 'set_role_fan',
    };
    return t(roleKeyMap[role] || '') || ROLE_NAMES[role] || role;
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, profile }) => updateProfile(id, profile),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profiles'] }); message.success(t('user_updated')); },
  });

  const columns = [
    { title: t('store_name'), dataIndex: 'name', key: 'name' },
    { title: t('store_phone'), dataIndex: 'phone', key: 'phone', render: (v) => v || '-' },
    { title: t('profile'), dataIndex: 'role', key: 'role', render: (role) => <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'default'}>{roleLabel(role)}</Tag> },
    {
      title: t('actions'), key: 'change',
      render: (_, record) => (
        <Select value={record.role} style={{ width: 150 }} onChange={(v) => updateMutation.mutate({ id: record.id, profile: { role: v } })} options={Object.keys(ROLE_NAMES).map((k) => ({ label: roleLabel(k), value: k }))} />
      ),
    },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass admin-readable-card" title={t('set_user_mgmt')}>
      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
     !profiles.length ? <Empty description={t('no_users')} /> :
     <Table rowKey="id" dataSource={profiles} columns={columns} pagination={false} />}
    </Card>
    </div>
    </PageTransition>);
};

export default UserManagementPage;
