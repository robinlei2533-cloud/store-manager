import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Spin, Tag, theme } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  CameraOutlined,
  TeamOutlined,
  InboxOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  StarOutlined,
  ThunderboltOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import { ROLES, ROLE_NAMES } from '../../utils/constants';
import { IS_LOCAL_MODE } from '../../services/api';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const { token } = theme.useToken();

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/stores/list', icon: <ShopOutlined />, label: 'Stores' },
    { key: '/visits/list', icon: <CameraOutlined />, label: 'Visits' },
    { key: '/evaluation', icon: <StarOutlined />, label: 'Evaluation' },
    { key: '/campaigns', icon: <ThunderboltOutlined />, label: 'Campaigns' },
  ];

  if (profile.role === ROLES.ADMIN || profile.role === ROLES.MANAGER) {
    menuItems.push({ key: '/fans/list', icon: <TeamOutlined />, label: 'Fans' });
    menuItems.push({ key: '/fans/scan', icon: <QrcodeOutlined />, label: 'Scan & Points' });
  }

  menuItems.push({ key: '/materials/stocks', icon: <InboxOutlined />, label: 'Materials' });

  if (profile.role === ROLES.ADMIN) {
    menuItems.push({ key: '/settings/users', icon: <SettingOutlined />, label: 'Settings' });
  }

  const handleMenuClick = ({ key }) => { navigate(key); };
  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: `${profile.name || ''} (${ROLE_NAMES[profile.role] || profile.role})` },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ],
    onClick: ({ key }) => { if (key === 'logout') handleLogout(); },
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return '/dashboard';
    if (path.startsWith('/stores')) return '/stores/list';
    if (path.startsWith('/visits')) return '/visits/list';
    if (path.startsWith('/evaluation')) return '/evaluation';
    if (path.startsWith('/campaigns')) return '/campaigns';
    if (path.startsWith('/fans/scan')) return '/fans/scan';
    if (path.startsWith('/fans')) return '/fans/list';
    if (path.startsWith('/materials')) return '/materials/stocks';
    if (path.startsWith('/settings')) return '/settings/users';
    return '/dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible breakpoint="lg" style={{ background: token.colorBgContainer }}>
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: 18, color: token.colorPrimary,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          🏪 Store Manager
        </div>
        {IS_LOCAL_MODE && (
          <div style={{ padding: '8px 16px', fontSize: 11, textAlign: 'center' }}>
            <Tag color="blue" style={{ fontSize: 10 }}>Local Demo Mode</Tag>
          </div>
        )}
        <Menu mode="inline" selectedKeys={[getSelectedKey()]} items={menuItems} onClick={handleMenuClick} style={{ borderRight: 0, marginTop: 8 }} />
      </Sider>
      <Layout>
        <Header style={{
          background: token.colorBgContainer, padding: '0 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
            Store Visits · Evaluation · Campaigns · Fan Operations · Materials
          </span>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{profile.name || 'User'}</span>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{
          margin: 16, padding: 24, background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG, overflow: 'auto',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
