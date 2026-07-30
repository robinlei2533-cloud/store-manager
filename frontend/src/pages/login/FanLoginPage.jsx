import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Typography, Button, Modal, Form, Input, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CrownOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import { isValidBusinessEmail } from '../../utils/uwellLaunchRules';

const { Title, Text } = Typography;

const FanLoginPage = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuthStore();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/fan-center', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  const handleRegister = async (values) => {
    setSubmitting(true);
    try {
      if (!isValidBusinessEmail(values.email)) {
        message.error('Use a real email domain suffix. Fake numeric domains are not accepted.');
        return;
      }
      await signUp(values.email, values.password, { name: values.name, role: 'fan' });
      message.success('Welcome to UWELL Fan Club.');
      navigate('/fan-center', { replace: true });
    } catch (err) {
      message.error(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (values) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      message.success('Welcome back.');
      navigate('/fan-center', { replace: true });
    } catch (err) {
      message.error(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fan-entry-page bg-radial-top">
      <div className="fan-entry-bg" />

      <div className="fan-entry-main">
        <div className="fan-entry-brand">UWELL</div>
        <Text className="fan-entry-subtitle">FAN CLUB</Text>

        <Title level={1}>Ready to join UWELL Fan Club?</Title>
        <Text className="fan-entry-desc">
          Sign in for check-ins, unique product-code scans, member rewards, store events, and community points.
        </Text>

        <Button
          type="primary"
          size="large"
          icon={<CrownOutlined />}
          className="fan-entry-cta"
          onClick={() => setRegisterModalOpen(true)}
        >
          Enter Fan Club
        </Button>

        <Button type="link" className="fan-entry-login" onClick={() => setLoginModalOpen(true)}>
          Already a member? Sign in
        </Button>

        <div className="fan-entry-features">
          {[
            { title: 'Daily check-in', desc: 'Open daily and collect base points.' },
            { title: 'Scan UWELL code', desc: 'Unique product codes count up to three scans per day.' },
            { title: 'Existing fan verification', desc: 'Upload older UWELL products for manual review.' },
            { title: 'Rewards mall', desc: 'Redeem gifts without losing your growth level.' },
          ].map((item) => (
            <div className="fan-entry-feature liquid-glass" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="entry-switcher">
        <Button icon={<ShopOutlined />} onClick={() => navigate('/store-login')}>Store Portal</Button>
        <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/admin')}>Admin Portal</Button>
      </div>

      <Modal
        title="Join UWELL Fan Club"
        open={registerModalOpen}
        onCancel={() => setRegisterModalOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Name is required.' }]}>
            <Input prefix={<UserOutlined />} placeholder="Name" size="large" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: 'Email is required.' }, { type: 'email', message: 'Enter a valid email.' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Password is required.' }, { min: 6, message: 'Use at least 6 characters.' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password, at least 6 characters" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting} style={{ height: 48 }} icon={<LoginOutlined />}>
              Register and enter
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Fan sign in"
        open={loginModalOpen}
        onCancel={() => setLoginModalOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <Form form={loginForm} layout="vertical" onFinish={handleLogin} style={{ marginTop: 16 }}>
          <Form.Item name="email" rules={[{ required: true, message: 'Email is required.' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Password is required.' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting} style={{ height: 48 }}>
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FanLoginPage;
