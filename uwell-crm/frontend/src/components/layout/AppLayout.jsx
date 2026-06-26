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
  ApartmentOutlined,
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

  const getMenuItems = () => {
    const isAdmin = profile.role === ROLES.ADMIN;
    const isManager = profile.role === ROLES.MANAGER;
    const canViewAllCRM = isAdmin || isManager;

    const crmChildren = [];
    if (canViewAllCRM) {
      crmChildren.push({ key: '/app/stores/list', icon: React.createElement(ShopOutlined), label: '\u95e8\u5e97\u7ba1\u7406' });
    }
    crmChildren.push({ key: '/app/visits/list', icon: React.createElement(CameraOutlined), label: '\u62dc\u8bbf\u8bb0\u5f55' });
    crmChildren.push({ key: '/app/evaluation', icon: React.createElement(StarOutlined), label: '\u95e8\u5e97\u8bc4\u4f30' });
    if (canViewAllCRM) {
      crmChildren.push({ key: '/app/campaigns', icon: React.createElement(ThunderboltOutlined), label: '\u6d3b\u52a8\u7ba1\u7406' });
    }
    crmChildren.push({ key: '/app/materials/list', icon: React.createElement(InboxOutlined), label: '\u7269\u6599\u7ba1\u7406' });

    const items = [
      { key: '/app/dashboard', icon: React.createElement(DashboardOutlined), label: '\u7ecf\u8425\u603b\u89c8' },
      { key: 'crm', icon: React.createElement(ApartmentOutlined), label: 'CRM \u7ba1\u7406', children: crmChildren },
    ];

    if (canViewAllCRM) {
      items.push({
        key: 'fan-ops',
        icon: React.createElement(TeamOutlined),
        label: '\u7c89\u4e1d\u8fd0\u8425',
        children: [
          { key: '/app/fans/list', icon: React.createElement(TeamOutlined), label: '\u7c89\u4e1d\u5217\u8868' },
          { key: '/app/fans/growth', icon: React.createElement(RiseOutlined), label: '\u589e\u957f\u770b\u677f' },
          { key: '/app/fans/scan', icon: React.createElement(QrcodeOutlined), label: '\u626b\u7801\u79ef\u5206' },
        ],
      });
    }

    if (isAdmin) {
      items.push({ key: '/app/settings/users', icon: React.createElement(SettingOutlined), label: '\u7cfb\u7edf\u8bbe\u7f6e' });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) navigate(key);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: `${profile.name || ''} (${ROLE_NAMES[profile.role] || profile.role})` },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') handleLogout();
    },
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/app/dashboard')) return '/app/dashboard';
    if (path.startsWith('/app/stores')) return '/app/stores/list';
    if (path.startsWith('/app/visits')) return '/app/visits/list';
    if (path.startsWith('/app/evaluation')) return '/app/evaluation';
    if (path.startsWith('/app/campaigns')) return '/app/campaigns';
    if (path.startsWith('/app/fans/scan')) return '/app/fans/scan';
    if (path.startsWith('/app/fans/growth')) return '/app/fans/growth';
    if (path.startsWith('/app/fans')) return '/app/fans/list';
    if (path.startsWith('/app/materials')) return '/app/materials/list';
    if (path.startsWith('/app/settings')) return '/app/settings/users';
    return '/app/dashboard';
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    const keys = [];
    if (
      path.startsWith('/app/stores') ||
      path.startsWith('/app/visits') ||
      path.startsWith('/app/evaluation') ||
      path.startsWith('/app/campaigns') ||
      path.startsWith('/app/materials')
    ) keys.push('crm');
    if (path.startsWith('/app/fans')) keys.push('fan-ops');
    return keys;
  };

  const brandBlock = (
    <div style={{
      height: 76,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      color: token.colorPrimary,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    }}>
      <div style={{ fontSize: 20, lineHeight: '24px' }}>UWELL CRM</div>
      <div style={{ fontSize: 11, color: token.colorTextTertiary, fontWeight: 500, marginTop: 3 }}>
        粉丝运营与门店增长系统
      </div>
    </div>
  );

  const menu = (
    <Menu
      mode="inline"
      defaultOpenKeys={getOpenKeys()}
      selectedKeys={[getSelectedKey()]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderRight: 0, marginTop: 8, padding: '0 8px' }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      {!isMobile && (
        <Sider width={232} breakpoint="lg" collapsedWidth={0} style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}>
          {brandBlock}
          {IS_LOCAL_MODE && (
            <div style={{ padding: '10px 16px 2px', textAlign: 'center' }}>
              <Tag color="blue" style={{ fontSize: 11, marginInlineEnd: 0 }}>本地演示模式</Tag>
            </div>
          )}
          {menu}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          styles={{ body: { padding: 0, background: token.colorBgContainer } }}
        >
          {brandBlock}
          {menu}
        </Drawer>
      )}

      <Layout>
        <Header style={{
          background: token.colorBgContainer,
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          gap: 8,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
            )}
            {!isMobile && (
              <span style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                门店拜访 / 活动复盘 / 粉丝积分 / 物料库存
              </span>
            )}
          </div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              {!isMobile && <span>{profile.name || '用户'}</span>}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{
          margin: isMobile ? 8 : 20,
          padding: isMobile ? 12 : 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          overflow: 'auto',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;



