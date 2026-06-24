import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Spin, Tag, theme, Grid, Drawer } from 'antd';
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
  RiseOutlined,
  MessageOutlined,
  MenuOutlined,
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
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const menuItems = [
    { key: '/app/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/app/stores/list', icon: <ShopOutlined />, label: 'Stores' },
    { key: '/app/visits/list', icon: <CameraOutlined />, label: 'Visits' },
    { key: '/app/evaluation', icon: <StarOutlined />, label: 'Evaluation' },
    { key: '/app/campaigns', icon: <ThunderboltOutlined />, label: 'Campaigns' },
  ];

  if (profile.role === ROLES.ADMIN || profile.role === ROLES.MANAGER) {
    menuItems.push({ key: '/app/fans/list', icon: <TeamOutlined />, label: 'Fans' });
    menuItems.push({ key: '/app/fans/growth', icon: <RiseOutlined />, label: 'Fan Growth' });
    menuItems.push({ key: '/app/fans/scan', icon: <QrcodeOutlined />, label: 'Scan & Points' });
  }

  menuItems.push({ key: '/app/materials/list', icon: <InboxOutlined />, label: 'Materials' });
  menuItems.push({ key: '/app/community', icon: <MessageOutlined />, label: 'Community' });

  if (profile.role === ROLES.ADMIN) {
    menuItems.push({ key: '/app/settings/users', icon: <SettingOutlined />, label: 'Settings' });
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
    if (path.startsWith('/app/dashboard')) return '/app/dashboard';
    if (path.startsWith('/app/stores')) return '/stores/list';
    if (path.startsWith('/app/visits')) return '/visits/list';
    if (path.startsWith('/app/evaluation')) return '/evaluation';
    if (path.startsWith('/app/campaigns')) return '/campaigns';
    if (path.startsWith('/app/fans/scan')) return '/fans/scan';
    if (path.startsWith('/app/fans/growth')) return '/fans/growth';
    if (path.startsWith('/app/fans')) return '/fans/list';
    if (path.startsWith('/app/materials')) return '/materials/list';
    if (path.startsWith('/app/community')) return '/community';
    if (path.startsWith('/app/settings')) return '/settings/users';
    return '/app/dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider collapsible breakpoint="lg" collapsedWidth={0} style={{ background: token.colorBgContainer }}>
          <div style={{
            height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: 18, color: token.colorPrimary,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}>
            🏪 UWELL CRM
          </div>
          {IS_LOCAL_MODE && (
            <div style={{ padding: '8px 16px', fontSize: 11, textAlign: 'center' }}>
              <Tag color="blue" style={{ fontSize: 10 }}>Local Demo Mode</Tag>
            </div>
          )}
          <Menu mode="inline" selectedKeys={[getSelectedKey()]} items={menuItems} onClick={handleMenuClick} style={{ borderRight: 0, marginTop: 8 }} />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{ body: { padding: 0, background: token.colorBgContainer } }}
        >
          <div style={{
            height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: 18, color: token.colorPrimary,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}>
            🏪 UWELL CRM
          </div>
          <Menu mode="inline" selectedKeys={[getSelectedKey()]} items={menuItems} onClick={(e) => { handleMenuClick(e); setDrawerOpen(false); }} style={{ borderRight: 0, marginTop: 8 }} />
        </Drawer>
      )}

      <Layout>
        <Header style={{
          background: token.colorBgContainer, padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          gap: 8,
        }}>
          {isMobile && (
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
          )}
          {!isMobile && (
            <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
              Store Visits · Evaluation · Campaigns · Fan Operations · Materials
            </span>
          )}
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              {!isMobile && <span>{profile.name || 'User'}</span>}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{
          margin: isMobile ? 8 : 16, padding: isMobile ? 12 : 24, background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG, overflow: 'auto',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
