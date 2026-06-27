import useLanguageStore from '../../stores/languageStore';
﻿import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Typography, Button, Modal, Form, Input, message, Space } from 'antd';
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

const { Title, Text } = Typography;

const FanLoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { user, loading, signIn, signUp } = useAuthStore();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
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
      await signUp(values.email, values.password, { name: values.name, role: 'fan' });
      message.success('欢迎加入 UWELL 粉丝俱乐部');
      navigate('/fan-center', { replace: true });
    } catch (err) {
      message.error(err.message || '注册失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (values) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      message.success('欢迎回来');
      navigate('/fan-center', { replace: true });
    } catch (err) {
      message.error(err.message || '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fan-entry-page">
      <div className="fan-entry-bg" />

      <div className="fan-entry-main">
        <div className="fan-entry-brand">UWELL</div>
        <Text className="fan-entry-subtitle">FAN CLUB</Text>

        <Title level={1}>你是 UWELL 粉丝吗？</Title>
        <Text className="fan-entry-desc">
          加入会员、签到积分、扫码认证、兑换奖励，和更多 UWELL 用户一起参与品牌活动。
        </Text>

        <Button
          type="primary"
          size="large"
          icon={<CrownOutlined />}
          className="fan-entry-cta"
          onClick={() => setRegisterModalOpen(true)}
        >
          粉丝进入
        </Button>

        <Button type="link" className="fan-entry-login" onClick={() => setLoginModalOpen(true)}>
          已是会员？登录粉丝中心
        </Button>

        <div className="fan-entry-features">
          {[
            { title: '每日签到', desc: '连续活跃累积积分' },
            { title: '扫码积分', desc: '购买产品后扫码获得奖励' },
            { title: '老粉认证', desc: '上传老产品照片升级白银' },
            { title: '积分商城', desc: '兑换产品与会员权益' },
          ].map((item) => (
            <div className="fan-entry-feature" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="entry-switcher">
        <Button icon={<ShopOutlined />} onClick={() => setOwnerModalOpen(true)}>店主进入</Button>
        <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/admin')}>管理员进入</Button>
      </div>

      <Modal
        title="店主入口"
        open={ownerModalOpen}
        onCancel={() => setOwnerModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setOwnerModalOpen(false)}>知道了</Button>,
        ]}
      >
        <Text>
          店主端入口已预留。后续可以用于门店老板查看门店等级、扫码积分、活动任务、物料申请和门店资料确认。
        </Text>
      </Modal>

      <Modal
        title="加入 UWELL 粉丝俱乐部"
        open={registerModalOpen}
        onCancel={() => setRegisterModalOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input prefix={<UserOutlined />} placeholder="姓名" size="large" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少 6 位字符' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码，至少 6 位" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting} style={{ height: 48 }} icon={<LoginOutlined />}>
              注册并进入
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="粉丝登录"
        open={loginModalOpen}
        onCancel={() => setLoginModalOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <Form form={loginForm} layout="vertical" onFinish={handleLogin} style={{ marginTop: 16 }}>
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting} style={{ height: 48 }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FanLoginPage;

