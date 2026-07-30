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
import { isLocalMode } from '../../services/api';
import { canViewOpsScope } from '../../utils/uwellRoleAccess';
import { DeviceProvider } from '../../contexts/DeviceContext';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const { t, lang } = useLanguageStore();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('admin-workspace-active');
    return () => {
      document.body.classList.remove('admin-workspace-active');
    };
  }, [profile?.role]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getMenuItems = () => {
    const isAdmin = profile.role === ROLES.ADMIN;
    const canViewAllCRM = canViewOpsScope(profile);

    const materialChildren = [
      { key: '/app/materials/list', icon: React.createElement(InboxOutlined), label: t('nav_material_list') },
      { key: '/app/materials/stocks', icon: React.createElement(WarningOutlined), label: t('nav_material_stocks') },
      { key: '/app/materials/inbound', icon: React.createElement(DownloadOutlined), label: t('nav_material_inbound') },
      { key: '/app/materials/outbound', icon: React.createElement(UploadOutlined), label: t('nav_material_outbound') },
    ];

    const items = [
      { key: '/app/dashboard', icon: React.createElement(DashboardOutlined), label: canViewAllCRM ? t('nav_dashboard2') : t('rep_workspace') },
    ];

    if (canViewAllCRM) {
      items.push(
        {
          key: 'stores-module',
          icon: React.createElement(ShopOutlined),
          label: t('nav_ops_stores'),
          children: [
            { key: '/app/stores/list', icon: React.createElement(ShopOutlined), label: t('nav_store_list') },
            { key: '/app/stores/s-stores', icon: React.createElement(StarOutlined), label: t('nav_s_store_management') },
            { key: '/app/evaluation?scope=stores', icon: React.createElement(StarOutlined), label: t('nav_evaluation') },
            { key: '/app/stores/list?review=display', icon: React.createElement(CameraOutlined), label: t('eval_display') },
            { key: '/app/stores/list?exposure=control', icon: React.createElement(RiseOutlined), label: t('nav_exposure_control') },
          ],
        },
        {
          key: 'fans-module',
          icon: React.createElement(TeamOutlined),
          label: t('nav_ops_fans'),
          children: [
            { key: '/app/fans/list', icon: React.createElement(TeamOutlined), label: t('nav_fan_list') },
            { key: '/app/fans/growth', icon: React.createElement(RiseOutlined), label: t('nav_fan_growth') },
            { key: '/app/fans/scan', icon: React.createElement(QrcodeOutlined), label: t('nav_fan_scan') },
            { key: '/app/fans/rules', icon: React.createElement(SettingOutlined), label: t('nav_fan_rules') },
            { key: '/app/fans/complaints', icon: React.createElement(CustomerServiceOutlined), label: t('nav_community') },
          ],
        },
        { key: '/app/campaigns', icon: React.createElement(ThunderboltOutlined), label: t('nav_campaigns') },
        { key: '/app/rewards', icon: React.createElement(StarOutlined), label: t('nav_ops_rewards') },
        { key: '/app/scan-codes', icon: React.createElement(QrcodeOutlined), label: t('nav_ops_scan_codes') },
        { key: 'materials', icon: React.createElement(InboxOutlined), label: t('nav_ops_materials'), children: materialChildren },
        {
          key: 'field-visits',
          icon: React.createElement(CameraOutlined),
          label: t('nav_ops_field_visits'),
          children: [
            { key: '/app/visits/create?type=new', icon: React.createElement(ShopOutlined), label: t('nav_new_store_visit') },
            { key: '/app/visits/create?type=repeat', icon: React.createElement(CameraOutlined), label: t('nav_repeat_visit') },
            { key: '/app/visits/list', icon: React.createElement(FileTextOutlined), label: t('nav_visits') },
            { key: '/app/evaluation', icon: React.createElement(StarOutlined), label: t('nav_evaluation') },
            { key: '/app/stores/list?display=data', icon: React.createElement(DatabaseOutlined), label: t('nav_display_data') },
          ],
        },
        { key: '/app/reviews', icon: React.createElement(FileTextOutlined), label: t('nav_ops_reviews') },
        { key: '/app/risk-center', icon: React.createElement(WarningOutlined), label: t('nav_ops_risk_center') },
      );
    } else {
      items.push(
        { key: '/app/stores/list', icon: React.createElement(ShopOutlined), label: t('rep_responsible_stores') },
        {
          key: 'field-visits',
          icon: React.createElement(CameraOutlined),
          label: t('nav_ops_field_visits'),
          children: [
            { key: '/app/visits/create?type=new', icon: React.createElement(ShopOutlined), label: t('nav_new_store_visit') },
            { key: '/app/visits/create?type=repeat', icon: React.createElement(CameraOutlined), label: t('nav_repeat_visit') },
            { key: '/app/visits/list', icon: React.createElement(FileTextOutlined), label: t('nav_visits') },
            { key: '/app/evaluation', icon: React.createElement(StarOutlined), label: t('nav_evaluation') },
          ],
        },
        { key: '/app/campaigns', icon: React.createElement(ThunderboltOutlined), label: t('rep_campaign_execution') },
        { key: 'materials', icon: React.createElement(InboxOutlined), label: t('nav_ops_materials'), children: materialChildren },
      );
    }

    if (canViewAllCRM) {
      items.push(
        { key: '/app/rules', icon: React.createElement(SettingOutlined), label: t('nav_ops_rules') },
      );
    } else {
      items.push({
        key: 'fan-support',
        icon: React.createElement(CustomerServiceOutlined),
        label: t('fan_complaints'),
        children: [
          { key: '/app/fans/complaints', icon: React.createElement(CustomerServiceOutlined), label: t('complaint_replies') },
        ],
      });
    }

    if (canViewAllCRM) {
      const settingsChildren = isAdmin
        ? [
            { key: '/app/settings/users', icon: React.createElement(UserOutlined), label: t('nav_users') },
            { key: '/app/settings/products', icon: React.createElement(AppstoreOutlined), label: t('nav_products') },
            { key: '/app/settings/data', icon: React.createElement(DatabaseOutlined), label: t('nav_data') },
            { key: '/app/settings/audit', icon: React.createElement(FileTextOutlined), label: t('audit_log') },
          ]
        : [
            { key: '/app/settings/audit', icon: React.createElement(FileTextOutlined), label: t('audit_log') },
          ];
      items.push({
        key: 'settings',
        icon: React.createElement(SettingOutlined),
        label: t('nav_settings'),
        children: settingsChildren,
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
    if (path.startsWith('/app/stores/s-stores')) return '/app/stores/s-stores';
    if (path.startsWith('/app/stores')) return '/app/stores/list';
    if (path.startsWith('/app/visits')) return '/app/visits/list';
    if (path.startsWith('/app/evaluation')) return '/app/evaluation';
    if (path.startsWith('/app/campaigns')) return '/app/campaigns';
    if (path.startsWith('/app/rewards')) return '/app/rewards';
    if (path.startsWith('/app/scan-codes')) return '/app/scan-codes';
    if (path.startsWith('/app/rules')) return '/app/rules';
    if (path.startsWith('/app/reviews')) return '/app/reviews';
    if (path.startsWith('/app/risk-center')) return '/app/risk-center';
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
    const keys = ['field-visits', 'materials'];
    if (canViewOpsScope(profile)) keys.push('stores-module', 'fans-module');
    if (!canViewOpsScope(profile)) keys.push('fan-support');
    if (canViewOpsScope(profile)) keys.push('settings');
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

  const menuPanel = (
    <div className="admin-ref-menu-scroll">
      {menu}
    </div>
  );

  return (
    <DeviceProvider>
      <Layout className="layout-root app-liquid-shell admin-liquid-shell">
        {!isMobile && (
          <Sider width={260} breakpoint="lg" collapsedWidth={0} className="layout-sider admin-ref-sider">
            {brandBlock}
            {isLocalMode() && (
              <div style={{ padding: '10px 16px 2px', textAlign: 'center' }}>
                <Tag color="blue" className="layout-role-tag">{t('local_demo')}</Tag>
              </div>
            )}
            {menuPanel}
          </Sider>
        )}

        {isMobile && (
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            size={292}
            styles={{
              body: { padding: 0, background: '#253123' },
              section: { background: '#253123' },
              header: { background: '#253123', borderBottom: '1px solid rgba(204,255,0,0.14)' },
            }}
          >
            {brandBlock}
            {menuPanel}
          </Drawer>
        )}

        <Layout className="admin-ref-main">
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
              <LanguageSwitcher
                inline
                showCurrent
                hideFlag
                sourceOnly
                className="layout-header-language"
                zIndex={360}
                tone="light"
                buttonMinWidth={112}
                menuMinWidth={180}
              />
              <button
                type="button"
                className={`layout-settings-trigger${settingsOpen ? ' is-open' : ''}`}
                onClick={() => setSettingsOpen((value) => !value)}
                aria-label={t('admin_open_settings')}
              >
                <SettingOutlined />
              </button>
              {settingsOpen && (
                <div className="layout-settings-panel layout-settings-panel-admin liquid-glass">
                  <div className="layout-settings-panel-head">
                    <strong>{t('nav_settings')}</strong>
                    <button type="button" className="layout-settings-close" onClick={() => setSettingsOpen(false)} aria-label={t('fan_modal_close')}>
                      <CloseOutlined />
                    </button>
                  </div>
                  <div className="layout-settings-profile">
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{profile.name || t('profile')} ({roleLabel(profile.role)})</span>
                  </div>
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
            <PageTransition key={`${location.pathname}${location.search}`}><Outlet /></PageTransition>
          </Content>
        </Layout>
      </Layout>
    </DeviceProvider>
  );
};

export default AppLayout;
