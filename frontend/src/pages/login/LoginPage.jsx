import useLanguageStore from '../../stores/languageStore';
import BlurText from '../../components/effects/BlurText';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, Card, Typography, message, Modal, Select, Divider, Alert } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ShopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import useAuthStore, { isLocalAuthFallbackEnabled } from '../../stores/authStore';
import { ROLES } from '../../utils/constants';
import { IS_LOCAL_MODE } from '../../services/api';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { t, setLang } = useLanguageStore();
  const { user, loading, signIn, signUp } = useAuthStore();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  const ensureChineseFirst = () => {
    setLang('zh');
  };

  useEffect(() => {
    ensureChineseFirst();
  }, []);

  useEffect(() => {
    if (user && !loading) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

  const handleLogin = async (values) => {
    setSubmitting(true);
    try {
      const result = await signIn(values.email, values.password);
      let resolvedProfile = result?.profile;
      if (isLocalAuthFallbackEnabled() && values.email?.toLowerCase() === 'admin@uwell.com' && result?.profile?.role !== ROLES.ADMIN) {
        resolvedProfile = { ...result.profile, id: result.profile?.id || 'u-admin', role: ROLES.ADMIN, name: result.profile?.name || 'admin' };
        useAuthStore.getState().setProfile(resolvedProfile);
      }
      if (isLocalAuthFallbackEnabled() && resolvedProfile) {
        localStorage.setItem('store_manager_current_user', resolvedProfile.id);
      }
      message.success(t('admin_login_success'));
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      message.error(err.message || t('admin_login_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (values) => {
    setRegistering(true);
    try {
      await signUp(values.email, values.password, { name: values.name, role: values.role });
      message.success(t('account_created'));
      setRegisterModalOpen(false);
      registerForm.resetFields();
    } catch (err) {
      message.error(err.message || t('register_failed'));
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="staff-login-page bg-radial-top">
      <div className="staff-login-copy">
        <div className="brand-mark text-gold-gradient">UWELL CRM</div>
        <BlurText text={t('staff_login_title')} as="h1" delay={0.04} style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.3 }} />
        <Text>{t('staff_login_desc')}</Text>
      </div>

      <Card className="staff-login-card liquid-glass-strong" styles={{ body: { padding: 32 } }}>
        <div className="login-title">
          <div className="login-icon">
            <SafetyCertificateOutlined />
          </div>
          <Title level={3}>{t('admin_login')}</Title>
          <Text type="secondary">{t('staff_login_hint')}</Text>
        </div>

        {IS_LOCAL_MODE && (
          <Alert
            type="info"
            showIcon
            message={t('local_demo')}
            description={t('staff_local_demo_desc')}
            className="login-mb16"
          />
        )}

        <Form form={loginForm} layout="vertical" onFinish={handleLogin} size="large" autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, message: t('email_required') }, { type: 'email', message: t('email_invalid') }]}>
            <Input prefix={<MailOutlined />} placeholder={t('admin_email')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('password_required') }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('admin_password')} />
          </Form.Item>
          <Form.Item className="login-mb12">
            <Button type="primary" htmlType="submit" loading={submitting} block className="login-btn-primary">{t('admin_login_btn')}</Button>
          </Form.Item>
        </Form>

        <Divider plain><Text type="secondary" className="login-divider-text">{t('first_time_use')}</Text></Divider>
        <Button block className="login-btn-secondary" onClick={() => setRegisterModalOpen(true)}>{t('create_staff_account')}</Button>
      </Card>

      <Modal title={t('create_staff_account')} open={registerModalOpen} onCancel={() => { setRegisterModalOpen(false); registerForm.resetFields(); }} footer={null} width={420} destroyOnHidden>
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} className="login-form-mt16">
          <Form.Item name="name" rules={[{ required: true, message: t('name_required') }]}>
            <Input prefix={<UserOutlined />} placeholder={t('store_name')} />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: t('email_required') }, { type: 'email', message: t('email_invalid') }]}>
            <Input prefix={<MailOutlined />} placeholder={t('admin_email')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('password_required') }, { min: 6, message: t('password_min') }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('password_min')} />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true, message: t('role_required') }]} initialValue={ROLES.REP}>
            <Select prefix={<ShopOutlined />} placeholder={t('profile')} options={[
              { label: t('set_role_rep'), value: ROLES.REP },
              { label: t('set_role_fan'), value: ROLES.FAN },
            ]} />
          </Form.Item>
          <Form.Item className="login-mb0">
            <Button type="primary" htmlType="submit" loading={registering} block className="login-btn-primary">{t('create_staff_account')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginPage;
