import useLanguageStore from '../../stores/languageStore';
import React from 'react';
import { Table, Card, Tag, Spin, Empty, Select, message, Form, Input, Button, Row, Col } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfiles, updateProfile } from '../../services/api';
import { ROLE_NAMES } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";
import localDb from '../../services/db/localDb';
import { isValidBusinessEmail } from '../../utils/uwellLaunchRules';

const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguageStore();
  const [form] = Form.useForm();
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

  const handleCreateStaff = async () => {
    const values = await form.validateFields();
    const email = values.email.trim().toLowerCase();
    if (!isValidBusinessEmail(email)) {
      message.error('请使用真实邮箱后缀。无效示例包括 123@123、123@123.、123@123.com。');
      return;
    }
    const staffId = `staff-${Date.now()}`;
    localDb.insert('profiles', {
      id: staffId,
      name: values.name,
      email,
      phone: values.phone || values.region,
      role: values.role,
      region: values.region,
      assignedArea: values.assignedArea,
      assignedStores: values.assignedStores || [],
      status: values.status,
      temp_password: values.tempPassword,
      created_at: new Date().toISOString(),
    });
    localDb.insert('auth', {
      id: `auth-${staffId}`,
      profile_id: staffId,
      email,
      password: values.tempPassword,
      role: values.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    localDb.insert('audit_logs', {
      actor: 'Admin',
      role: 'admin',
      region: values.region,
      action_type: '员工账号创建',
      target: email,
      before_value: 'none',
      after_value: `${values.role} / ${values.status} / ${values.region}`,
      reason: `Assigned area: ${values.assignedArea || '-'}; assigned stores: ${(values.assignedStores || []).join(', ') || '-'}`,
      created_at: new Date().toISOString(),
    });
    form.resetFields();
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    message.success('员工账号已创建');
  };

  const columns = [
    { title: '员工', dataIndex: 'name', key: 'name', width: 170 },
    { title: '联系方式', dataIndex: 'phone', key: 'phone', width: 140, render: (v) => v || '-' },
    { title: '角色', dataIndex: 'role', key: 'role', width: 110, render: (role) => <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'default'}>{roleLabel(role)}</Tag> },
    {
      title: '角色调整', key: 'change', width: 140,
      render: (_, record) => (
        <Select value={record.role} style={{ width: 132 }} onChange={(v) => updateMutation.mutate({ id: record.id, profile: { role: v } })} options={Object.keys(ROLE_NAMES).map((k) => ({ label: roleLabel(k), value: k }))} />
      ),
    },
  ];

  return (
    <PageTransition>
    <div className="bg-radial-top admin-settings-page admin-settings-users-page" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass admin-readable-card" title="员工账号管理" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 12, color: 'rgba(255,255,255,0.68)' }}>
        角色仅限 Manager 或 Rep。Manager 不能创建账号，只有 Admin 使用此表单。状态可设为启用或停用。
      </div>
      <Form form={form} layout="vertical" initialValues={{ status: 'active' }}>
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="地推团队成员" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                {
                  validator: (_, value) => (
                    !value || isValidBusinessEmail(value)
                      ? Promise.resolve()
                      : Promise.reject(new Error('请使用真实邮箱后缀，不接受纯数字伪域名。'))
                  ),
                },
              ]}
            >
              <Input placeholder="name@uwell.sa" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="tempPassword" label="临时密码" rules={[{ required: true, message: '请输入临时密码' }]}>
              <Input.Password placeholder="临时密码" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
              <Select options={[
                { label: 'Manager', value: 'manager' },
                { label: 'Field Rep', value: 'rep' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="region" label="区域" rules={[{ required: true, message: '请选择区域' }]}>
              <Select options={[
                { label: 'Riyadh', value: 'Riyadh' },
                { label: 'Dammam', value: 'Dammam' },
                { label: 'Jeddah', value: 'Jeddah' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="assignedArea" label="分配片区" rules={[{ required: true, message: '请输入分配片区' }]}>
              <Input placeholder="North Riyadh / Jeddah Central" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="assignedStores" label="分配门店">
              <Select
                mode="tags"
                placeholder="可选：门店ID或门店名称"
                tokenSeparators={[',']}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select options={[
                { label: '启用', value: 'active' },
                { label: '停用', value: 'disabled' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Button type="primary" onClick={handleCreateStaff} style={{ marginTop: 30, width: '100%' }}>创建员工账号</Button>
          </Col>
        </Row>
      </Form>
    </Card>
    <Card className="liquid-glass admin-readable-card" title={t('set_user_mgmt')}>
      {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
     !profiles.length ? <Empty description={t('no_users')} /> :
     <Table className="admin-settings-users-table" rowKey="id" dataSource={profiles} columns={columns} pagination={false} scroll={{ x: 560 }} />}
    </Card>
    </div>
    </PageTransition>);
};

export default UserManagementPage;
