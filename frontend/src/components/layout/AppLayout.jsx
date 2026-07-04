import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Layout, Menu, Button, Avatar, Spin, Tag, Grid, Drawer, Input } from 'antd';
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
  MenuOutlined,
  ApartmentOutlined,
  SearchOutlined,
  FileTextOutlined,
  WarningOutlined,
  DownloadOutlined,
  UploadOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  CustomerServiceOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import useLanguageStore from '../../stores/languageStore';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import ShinyText from '../../components/effects/ShinyText';
import PageTransition from '../../components/common/PageTransition';
import { ROLES, ROLE_NAMES } from '../../utils/constants';
import { IS_LOCAL_MODE } from '../../services/api';
import { motion } from 'framer-motion';
import { canViewCompanyScope } from '../../utils/uwellRoleAccess';
import { DeviceProvider } from '../../contexts/DeviceContext';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const { t, lang, setLang } = useLanguageStore();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const contentRef = useRef(null);

  const ensureChineseFirst = () => {
    setLang('zh');
  };

  useEffect(() => {
    ensureChineseFirst();
    document.body.classList.add('admin-workspace-active');
    return () => {
      document.body.classList.remove('admin-workspace-active');
    };
  }, []);
  
  if (!profile) {
  
  return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getMenuItems = () => {
    const isAdmin = profile.role === ROLES.ADMIN;
    const canViewAllCRM = canViewCompanyScope(profile);

    const crmChildren = [
      ...(canViewAllCRM ? [{ key: '/app/stores/list', icon: React.createElement(ShopOutlined), label: t('nav_stores') }] : []),
      ...(!canViewAllCRM ? [{ key: '/app/stores/list', icon: React.createElement(ShopOutlined), label: '负责门店' }] : []),
      { key: '/app/visits/list', icon: React.createElement(CameraOutlined), label: t('nav_visits') },
      { key: '/app/evaluation', icon: React.createElement(StarOutlined), label: t('nav_evaluation') },
      { key: '/app/campaigns', icon: React.createElement(ThunderboltOutlined), label: canViewAllCRM ? t('nav_campaigns') : '活动执行' },
    ];

    const materialChildren = [
      { key: '/app/materials/list', icon: React.createElement(InboxOutlined), label: t('nav_material_list') },
      { key: '/app/materials/stocks', icon: React.createElement(WarningOutlined), label: t('nav_material_stocks') },
      { key: '/app/materials/inbound', icon: React.createElement(DownloadOutlined), label: t('nav_material_inbound') },
      { key: '/app/materials/outbound', icon: React.createElement(UploadOutlined), label: t('nav_material_outbound') },
    ];

    const items = [
      { key: '/app/dashboard', icon: React.createElement(DashboardOutlined), label: canViewAllCRM ? t('nav_dashboard2') : '地推工作台' },
      { key: 'crm', icon: React.createElement(ApartmentOutlined), label: t('nav_crm'), children: crmChildren },
      { key: 'materials', icon: React.createElement(InboxOutlined), label: t('nav_materials'), children: materialChildren },
    ];

    if (canViewAllCRM) {
      items.push({
        key: 'fan-ops',
        icon: React.createElement(TeamOutlined),
        label: t('fan_operations'),
        children: [
          { key: '/app/fans/list', icon: React.createElement(TeamOutlined), label: t('nav_fan_list') },
          { key: '/app/fans/growth', icon: React.createElement(RiseOutlined), label: t('nav_fan_growth') },
          { key: '/app/fans/scan', icon: React.createElement(QrcodeOutlined), label: t('nav_fan_scan') },
          { key: '/app/fans/rules', icon: React.createElement(SettingOutlined), label: t('nav_fan_rules') },
        ],
      });
    } else {
      items.push({
        key: 'fan-support',
        icon: React.createElement(CustomerServiceOutlined),
        label: '粉丝客诉',
        children: [
          { key: '/app/fans/complaints', icon: React.createElement(CustomerServiceOutlined), label: '客诉回复' },
        ],
      });
    }

    if (isAdmin) {
      items.push({
        key: 'settings',
        icon: React.createElement(SettingOutlined),
        label: t('nav_settings'),
        children: [
          { key: '/app/settings/users', icon: React.createElement(UserOutlined), label: t('nav_users') },
          { key: '/app/settings/products', icon: React.createElement(AppstoreOutlined), label: t('nav_products') },
          { key: '/app/settings/data', icon: React.createElement(DatabaseOutlined), label: t('nav_data') },
          { key: '/app/settings/audit', icon: React.createElement(FileTextOutlined), label: t('audit_log') },
        ],
      });
    }

    return items;
  };

  const menuItems = getMenuItems();
  const roleLabel = (role) => {
    const roleKeyMap = {
      admin: 'set_role_admin',
      manager: 'set_role_manager',
      rep: 'set_role_rep',
      fan: 'set_role_fan',
    };
    return t(roleKeyMap[role] || '') || ROLE_NAMES[role] || role;
  };

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) navigate(key);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/app/dashboard')) return '/app/dashboard';
    if (path.startsWith('/app/stores')) return '/app/stores/list';
    if (path.startsWith('/app/visits')) return '/app/visits/list';
    if (path.startsWith('/app/evaluation')) return '/app/evaluation';
    if (path.startsWith('/app/campaigns')) return '/app/campaigns';
    if (path.startsWith('/app/fans/complaints')) return '/app/fans/complaints';
    if (path.startsWith('/app/fans/scan')) return '/app/fans/scan';
    if (path.startsWith('/app/fans/growth')) return '/app/fans/growth';
    if (path.startsWith('/app/fans/rules')) return '/app/fans/rules';
    if (path.startsWith('/app/fans')) return '/app/fans/list';
    if (path.startsWith('/app/materials/stocks')) return '/app/materials/stocks';
    if (path.startsWith('/app/materials/inbound')) return '/app/materials/inbound';
    if (path.startsWith('/app/materials/outbound')) return '/app/materials/outbound';
    if (path.startsWith('/app/materials')) return '/app/materials/list';
    if (path.startsWith('/app/settings/products')) return '/app/settings/products';
    if (path.startsWith('/app/settings/data')) return '/app/settings/data';
    if (path.startsWith('/app/settings/audit')) return '/app/settings/audit';
    if (path.startsWith('/app/settings')) return '/app/settings/users';
    return '/app/dashboard';
  };

  const getOpenKeys = () => {
    const keys = ['crm', 'materials'];
    if (canViewCompanyScope(profile)) keys.push('fan-ops');
    if (!canViewCompanyScope(profile)) keys.push('fan-support');
    if (profile.role === ROLES.ADMIN) keys.push('settings');
    return keys;
  };

  const brandBlock = (
    <div className="admin-ref-brand">
      <div className="admin-ref-logo">U</div>
      <div>
        <div className="layout-brand"><span className="text-gold-gradient"><ShinyText speed={4}>UWELL</ShinyText></span> <b>CRM</b></div>
        <div className="admin-ref-brand-sub">{t('app_subtitle')}</div>
      </div>
    </div>
  );

  const menu = (
    <Menu
      key={`${profile.role}-${lang}`}
      mode="inline"
      defaultOpenKeys={getOpenKeys()}
      selectedKeys={[getSelectedKey()]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderRight: 0, marginTop: 12, padding: '0 12px' }}
      theme="dark"
    />
  );


  return (
    <DeviceProvider>
    <Layout className="layout-root app-liquid-shell admin-liquid-shell">
      {!isMobile && (
        <Sider width={260} breakpoint="lg" collapsedWidth={0} className="layout-sider admin-ref-sider">
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
          width={292}
          styles={{
            body: { padding: 0, background: '#071a2a' },
            content: { background: '#071a2a' },
            header: { background: '#071a2a', borderBottom: '1px solid rgba(255,255,255,0.08)' },
          }}
        >
          {brandBlock}
          {menu}
        </Drawer>
      )}

      <Layout>
        <Header className="admin-ref-header" style={{
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            {isMobile && (
              <Button className="admin-mobile-menu-button" type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
            )}
            {!isMobile && (
              <Input
                className="admin-ref-search"
                prefix={<SearchOutlined />}
                placeholder={t('admin_search_placeholder')}
                allowClear
              />
            )}
          </div>
          <div className="layout-settings-slot">
            <button
              type="button"
              className={`layout-settings-trigger${settingsOpen ? ' is-open' : ''}`}
              onClick={() => setSettingsOpen((value) => !value)}
              aria-label="Open admin settings"
            >
              <SettingOutlined />
            </button>
            {settingsOpen && (
              <div className="layout-settings-panel layout-settings-panel-admin liquid-glass">
                <div className="layout-settings-panel-head">
                  <strong>系统设置</strong>
                  <button type="button" className="layout-settings-close" onClick={() => setSettingsOpen(false)} aria-label="关闭设置">
                    <CloseOutlined />
                  </button>
                </div>
                <div className="layout-settings-profile">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{profile.name || t('profile')} ({roleLabel(profile.role)})</span>
                </div>
                <div className="store-settings-label">{t('settings_language')}</div>
                <LanguageSwitcher inline showCurrent hideFlag sourceOnly zIndex={360} tone="light" buttonMinWidth={112} menuMinWidth={180} />
                <div className="fe-settings-divider" />
                <button type="button" className="store-settings-item" onClick={handleLogout}>
                  <LogoutOutlined /> {t('logout')}
                </button>
              </div>
            )}
          </div>
        </Header>
        <Content ref={contentRef} className="bg-radial-top admin-ref-content" style={{
          margin: isMobile ? 8 : 24,
          padding: isMobile ? 12 : 28,
          background: 'transparent',
          borderRadius: 18,
          overflow: 'auto',
          boxShadow: 'none',
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
    </DeviceProvider>
  );
};

export default AppLayout;
