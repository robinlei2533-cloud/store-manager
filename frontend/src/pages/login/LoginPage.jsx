import useLanguageStore from '../../stores/languageStore';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { App, Form, Input, Button, Card, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import useAuthStore, { isLocalAuthFallbackEnabled } from '../../stores/authStore';
import { ROLES } from '../../utils/constants';
import { isLocalMode } from '../../services/api';

const { Title, Text } = Typography;
const STAFF_ROLES = new Set([ROLES.ADMIN, ROLES.MANAGER, ROLES.REP]);
const assignedAccountSummary = '\u5458\u5de5\u8d26\u53f7\u7531\u7ba1\u7406\u5458\u7edf\u4e00\u5206\u914d';
const assignedAccountNotice = 'Manager \u548c Rep \u4e0d\u80fd\u81ea\u884c\u6ce8\u518c\u3002\u7ba1\u7406\u5458\u53ef\u5728 \u7cfb\u7edf\u8bbe\u7f6e > \u7528\u6237\u7ba1\u7406 \u4e2d\u521b\u5efa Manager \u6216 Rep \u8d26\u53f7\u3002';
// Task-141 ReactBits-inspired staff login polish: restrained form interactions.

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { user, profile, loading, signIn } = useAuthStore();
  const { message } = App.useApp();
  const [loginForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading && STAFF_ROLES.has(profile?.role)) navigate('/app/dashboard', { replace: true });
  }, [user, profile?.role, loading, navigate]);

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
      if (!STAFF_ROLES.has(resolvedProfile?.role)) {
        throw new Error('This login is for assigned staff accounts only.');
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

  return (
    <div className="staff-login-page staff-login-green-theme bg-radial-top">
      <div className="staff-login-copy">
        <div className="brand-mark text-gold-gradient">UWELL CRM</div>
        <h1 className="staff-login-heading uw-reactbits-split-text">{t('staff_login_title')}</h1>
        <Text>{t('staff_login_desc')}</Text>
      </div>

      <Card className="staff-login-card liquid-glass-strong uw-reactbits-fade-content" styles={{ body: { padding: 32 } }}>
        <div className="login-title">
          <div className="login-icon">
            <SafetyCertificateOutlined />
          </div>
          <Title level={3}>{t('admin_login')}</Title>
          <Text type="secondary">{t('staff_login_hint')}</Text>
        </div>

        {isLocalMode() && (
          <Alert
            type="info"
            showIcon
            title={t('local_demo')}
            description={t('staff_local_demo_desc')}
            className="login-mb16"
          />
        )}

        <Form form={loginForm} layout="vertical" onFinish={handleLogin} size="large" autoComplete="off">
          <Form.Item name="email" className="staff-login-field uw-reactbits-field" rules={[{ required: true, message: t('email_required') }, { type: 'email', message: t('email_invalid') }]}>
            <Input prefix={<MailOutlined />} placeholder={t('admin_email')} />
          </Form.Item>
          <Form.Item name="password" className="staff-login-field uw-reactbits-field" rules={[{ required: true, message: t('password_required') }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('admin_password')} />
          </Form.Item>
          <Form.Item className="login-mb12">
            <Button type="primary" htmlType="submit" loading={submitting} block className="login-btn-primary uw-reactbits-specular-button">{t('admin_login_btn')}</Button>
          </Form.Item>
        </Form>

        <details className="staff-login-notice-fold">
          <summary>{assignedAccountSummary}</summary>
          <p>{assignedAccountNotice}</p>
        </details>
      </Card>
    </div>
  );
};

export default LoginPage;
