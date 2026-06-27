import useLanguageStore from '../../stores/languageStore';
﻿import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, Card, Typography, message, Modal, Select, Divider, Alert } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ShopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import { ROLES, ROLE_NAMES } from '../../utils/constants';
import { IS_LOCAL_MODE } from '../../services/api';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { user, loading, signIn, signUp } = useAuthStore();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (user && !loading) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

  const handleLogin = async (values) => {
    setSubmitting(true);
    try {
      const result = await signIn(values.email, values.password);
      if (IS_LOCAL_MODE && result?.profile) {
        localStorage.setItem('store_manager_current_user', result.profile.id);
      }
      message.success('登录成功');
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      message.error(err.message || '登录失败，请检查账号信息');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (values) => {
    setRegistering(true);
    try {
      await signUp(values.email, values.password, { name: values.name, role: values.role });
      message.success('账号已创建，请登录');
      setRegisterModalOpen(false);
      registerForm.resetFields();
    } catch (err) {
      message.error(err.message || '注册失败');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="staff-login-page">
      <div className="staff-login-copy">
        <div className="brand-mark">UWELL CRM</div>
        <Title level={1}>门店增长与粉丝运营管理后台</Title>
        <Text>
          将门店拜访、活动执行、扫码积分、粉丝等级和物料库存集中管理，帮助团队把线下动作沉淀成可追踪的数据资产。
        </Text>
      </div>

      <Card className="staff-login-card" styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="login-icon">
            <SafetyCertificateOutlined />
          </div>
          <Title level={3} style={{ margin: 0 }}>管理端登录</Title>
          <Text type="secondary">运营人员、业务代表和管理员使用</Text>
        </div>

        {IS_LOCAL_MODE && (
          <Alert
            type="info"
            showIcon
            message="本地演示模式"
            description="当前未连接 Supabase，输入任意邮箱和密码即可体验后台功能。正式上线后会使用真实账号体系。"
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={loginForm} layout="vertical" onFinish={handleLogin} size="large" autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: 44 }}>登录后台</Button>
          </Form.Item>
        </Form>

        <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>首次使用</Text></Divider>
        <Button block style={{ height: 44 }} onClick={() => setRegisterModalOpen(true)}>创建员工账号</Button>
      </Card>

      <Modal title="创建员工账号" open={registerModalOpen} onCancel={() => { setRegisterModalOpen(false); registerForm.resetFields(); }} footer={null} width={420} destroyOnClose>
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input prefix={<UserOutlined />} placeholder="姓名" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少 6 位字符' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码，至少 6 位" />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true, message: '请选择角色' }]} initialValue={ROLES.REP}>
            <Select prefix={<ShopOutlined />} placeholder="角色" options={[
              { label: ROLE_NAMES.rep, value: ROLES.REP },
              { label: ROLE_NAMES.fan, value: ROLES.FAN },
            ]} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={registering} block style={{ height: 44 }}>创建账号</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginPage;


