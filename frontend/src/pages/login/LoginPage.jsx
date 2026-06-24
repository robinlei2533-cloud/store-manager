import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Modal, Select, Divider } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import { ROLES, ROLE_NAMES } from '../../utils/constants';
import { IS_LOCAL_MODE } from '../../services/api';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
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
      message.success('Login successful');
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      message.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (values) => {
    setRegistering(true);
    try {
      await signUp(values.email, values.password, { name: values.name, role: values.role });
      message.success('Registration successful! Please login.');
      setRegisterModalOpen(false);
      registerForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 24,
    }}>
      <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} styles={{ body: { padding: '40px 32px' } }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>🏪</div>
          <Title level={2} style={{ margin: 0 }}>Store Manager</Title>
          <Text type="secondary">Visits · Evaluation · Campaigns · Fans · Materials</Text>
        </div>

        {IS_LOCAL_MODE && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f0f5ff', borderRadius: 6, fontSize: 12, color: '#666' }}>
            <strong>Demo Mode</strong>: Enter any email and password to login and explore all features.
          </div>
        )}

        <Form form={loginForm} layout="vertical" onFinish={handleLogin} size="large" autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Invalid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: 44 }}>Login</Button>
          </Form.Item>
        </Form>

        <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>Don't have an account?</Text></Divider>
        <Button block style={{ height: 44 }} onClick={() => setRegisterModalOpen(true)}>Register</Button>
      </Card>

      <Modal title="Register" open={registerModalOpen} onCancel={() => { setRegisterModalOpen(false); registerForm.resetFields(); }} footer={null} width={420} destroyOnClose>
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input prefix={<UserOutlined />} placeholder="Name" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Invalid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }, { min: 6, message: 'At least 6 characters' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password (min 6 chars)" />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true, message: 'Please select role' }]} initialValue={ROLES.REP}>
            <Select prefix={<ShopOutlined />} placeholder="Role" options={[
              { label: ROLE_NAMES.rep, value: ROLES.REP },
              { label: ROLE_NAMES.fan, value: ROLES.FAN },
            ]} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={registering} block style={{ height: 44 }}>Register</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginPage;
