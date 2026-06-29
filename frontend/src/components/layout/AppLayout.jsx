import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
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
import useLanguageStore from '../../stores/languageStore';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import ShinyText from '../../components/effects/ShinyText';
import PageTransition from '../../components/common/PageTransition';
import { ROLES, ROLE_NAMES } from '../../utils/constants';
import { IS_LOCAL_MODE } from '../../services/api';
import { motion } from 'framer-motion';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const { t } = useLanguageStore();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const contentRef = useRef(null);
  
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
      crmChildren.push({ key: '/app/stores/list', icon: React.createElement(ShopOutlined), label: t('nav_stores') });
    }
    crmChildren.push({ key: '/app/visits/list', icon: React.createElement(CameraOutlined), label: t('nav_visits') });
    crmChildren.push({ key: '/app/evaluation', icon: React.createElement(StarOutlined), label: t('nav_evaluation') });
    if (canViewAllCRM) {
      crmChildren.push({ key: '/app/campaigns', icon: React.createElement(ThunderboltOutlined), label: t('nav_campaigns') });
    }
    crmChildren.push({ key: '/app/materials/list', icon: React.createElement(InboxOutlined), label: t('nav_materials') });

    const items = [
      { key: '/app/dashboard', icon: React.createElement(DashboardOutlined), label: t('nav_dashboard2') },
      { key: 'crm', icon: React.createElement(ApartmentOutlined), label: t('crm_management'), children: crmChildren },
    ];

    if (canViewAllCRM) {
      items.push({
        key: 'fan-ops',
        icon: React.createElement(TeamOutlined),
        label: t('fan_operations'),
        children: [
          { key: '/app/fans/list', icon: React.createElement(TeamOutlined), label: t('nav_fan_list') },
          { key: '/app/fans/growth', icon: React.createElement(RiseOutlined), label: t('nav_growth') },
          { key: '/app/fans/scan', icon: React.createElement(QrcodeOutlined), label: t('nav_fan_scan') },
        ],
      });
    }

    if (isAdmin) {
      items.push({ key: '/app/settings/users', icon: React.createElement(SettingOutlined), label: t('nav_settings') });
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
      { key: 'logout', icon: <LogoutOutlined />, label: t('logout'), danger: true },
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
      textShadow: '0 0 20px rgba(255,215,0,0.15)',
      color: token.colorPrimary,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    }}>
      <div className="layout-brand"><ShinyText speed={4}>UWELL CRM</ShinyText></div>
      <div style={{ fontSize: 11, color: token.colorTextTertiary, fontWeight: 500, marginTop: 3 }}>
        {t('app_subtitle')}
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
    <Layout className="layout-root">
      {!isMobile && (
        <Sider width={232} breakpoint="lg" collapsedWidth={0} className="layout-sider">
          {brandBlock}
          {IS_LOCAL_MODE && (
            <div style={{ padding: '10px 16px 2px', textAlign: 'center' }}>
              <Tag color="blue" className="layout-role-tag">{t('local_demo')}</Tag>
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
          background: 'linear-gradient(135deg, #16161f 0%, #1a1a24 100%)',
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
              <span style={{ color: '#b0b0c8', fontSize: 13, letterSpacing: '0.3px' }}>
                门店拜访 / 活动复盘 / 粉丝积分 / 物料库存
              </span>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}><LanguageSwitcher inline /><Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" className="layout-user-btn">
              <Avatar size="small" icon={<UserOutlined />} />
              {!isMobile && <span>{profile.name || '用户'}</span>}
            </Button>
          </Dropdown></div>
        </Header>
        <Content ref={contentRef} style={{
          margin: isMobile ? 8 : 20,
          padding: isMobile ? 12 : 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          overflow: 'auto',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <PageTransition><Outlet /></PageTransition>
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;






