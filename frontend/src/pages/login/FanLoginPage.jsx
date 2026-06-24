import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Modal, Form, Input, message, Space } from 'antd';
import { FireOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import { IS_LOCAL_MODE } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

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
      await signUp(values.email, values.password, { name: values.name, role: 'fan' });
      message.success('Welcome to UWELL Fan Club!');
      navigate('/fan-center', { replace: true });
    } catch (err) {
      message.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (values) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      message.success('Welcome back!');
      navigate('/fan-center', { replace: true });
    } catch (err) {
      message.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0a0a23 0%, #1a1a4e 50%, #2d1b69 100%)',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(102,126,234,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(118,75,162,0.15) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* UWELL Brand */}
      <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 48, fontWeight: 900, letterSpacing: 8,
          background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'shine 3s linear infinite',
        }}>
          UWELL
        </div>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, letterSpacing: 4 }}>
          MIDDLE EAST FAN CLUB
        </Text>
      </div>

      {/* Main question */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <Title level={1} style={{
          color: '#fff', fontSize: 36, fontWeight: 700, marginBottom: 8,
          textShadow: '0 0 30px rgba(102,126,234,0.5)',
        }}>
          Are You Our Fans?
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
          Join the UWELL community · Earn points · Win rewards
        </Text>
      </div>

      {/* Flashing Fans button */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: 24 }}>
        <button
          onClick={() => setRegisterModalOpen(true)}
          style={{
            padding: '20px 80px',
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: 6,
            color: '#fff',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 16,
            cursor: 'pointer',
            boxShadow: '0 0 40px rgba(102,126,234,0.6), 0 8px 32px rgba(0,0,0,0.3)',
            animation: 'pulse 2s ease-in-out infinite, glow 2s ease-in-out infinite alternate',
            transition: 'transform 0.3s',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🔥 FANS 🔥
        </button>
      </div>

      {/* Login link for returning fans */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Already a member?{' '}
        </Text>
        <Button type="link" style={{ color: '#667eea', fontSize: 14, padding: 0 }} onClick={() => setLoginModalOpen(true)}>
          Login here
        </Button>
      </div>

      {/* Feature highlights */}
      <div style={{
        display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap',
        justifyContent: 'center', position: 'relative', zIndex: 1,
      }}>
        {[
          { icon: '📅', title: 'Daily Check-in', desc: '+5 points every day' },
          { icon: '🎁', title: 'Points Mall', desc: 'Redeem UWELL products' },
          { icon: '🎰', title: 'Lucky Draw', desc: 'Win up to 500 points' },
          { icon: '📱', title: 'Scan & Earn', desc: 'Scan product QR codes' },
          { icon: '👥', title: 'Invite Friends', desc: 'Earn 30 pts per invite' },
          { icon: '💬', title: 'Community', desc: 'Join the discussion' },
        ].map((f, i) => (
          <div key={i} style={{ textAlign: 'center', width: 100 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{f.icon}</div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{f.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Admin link (subtle) */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <Button type="text" size="small" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }} onClick={() => navigate('/admin')}>
          Staff Login
        </Button>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes glow {
          from { box-shadow: 0 0 40px rgba(102,126,234,0.6), 0 8px 32px rgba(0,0,0,0.3); }
          to { box-shadow: 0 0 60px rgba(102,126,234,0.9), 0 8px 32px rgba(0,0,0,0.3); }
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
      `}</style>

      {/* Register Modal */}
      <Modal
        title="Join UWELL Fan Club"
        open={registerModalOpen}
        onCancel={() => setRegisterModalOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} style={{ marginTop: 16 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input prefix={<UserOutlined />} placeholder="Your Name" size="large" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Invalid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }, { min: 6, message: 'At least 6 characters' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password (min 6 chars)" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting} style={{ height: 48, fontSize: 16 }}>
              Join Now
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Login Modal */}
      <Modal
        title="Fan Login"
        open={loginModalOpen}
        onCancel={() => setLoginModalOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 420 }}
      >
        <Form form={loginForm} layout="vertical" onFinish={handleLogin} style={{ marginTop: 16 }}>
          <Form.Item name="email" rules={[{ required: true, message: 'Please enter email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting} style={{ height: 48 }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FanLoginPage;
