import useLanguageStore from './stores/languageStore';
import React, { Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router-dom';
import PageTransition from './components/common/PageTransition';
import './styles/animations.css';
import './styles/glass-morphism.css';
import './styles/loading-states.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
const LoginPage = React.lazy(() => import('./pages/login/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const StoreListPage = React.lazy(() => import('./pages/stores/StoreListPage'));
const StoreDetailPage = React.lazy(() => import('./pages/stores/StoreDetailPage'));
const StoreCreatePage = React.lazy(() => import('./pages/stores/StoreCreatePage'));
const VisitListPage = React.lazy(() => import('./pages/visits/VisitListPage'));
const VisitDetailPage = React.lazy(() => import('./pages/visits/VisitDetailPage'));
const VisitCreatePage = React.lazy(() => import('./pages/visits/VisitCreatePage'));
const EvalListPage = React.lazy(() => import('./pages/evaluation/EvalListPage'));
const EvalDetailPage = React.lazy(() => import('./pages/evaluation/EvalDetailPage'));
const EvalCreatePage = React.lazy(() => import('./pages/evaluation/EvalCreatePage'));
const CampaignListPage = React.lazy(() => import('./pages/campaigns/CampaignListPage'));
const CampaignDetailPage = React.lazy(() => import('./pages/campaigns/CampaignDetailPage'));
const CampaignCreatePage = React.lazy(() => import('./pages/campaigns/CampaignCreatePage'));
const FanListPage = React.lazy(() => import('./pages/fans/FanListPage'));
const FanDetailPage = React.lazy(() => import('./pages/fans/FanDetailPage'));
const FanRulesPage = React.lazy(() => import('./pages/fans/FanRulesPage'));
const ScanCenterPage = React.lazy(() => import('./pages/fans/ScanCenterPage'));
const MaterialListPage = React.lazy(() => import('./pages/materials/MaterialListPage'));
const MaterialStocksPage = React.lazy(() => import('./pages/materials/MaterialStocksPage'));
const MaterialInboundPage = React.lazy(() => import('./pages/materials/MaterialInboundPage'));
const MaterialOutboundPage = React.lazy(() => import('./pages/materials/MaterialOutboundPage'));
const UserManagementPage = React.lazy(() => import('./pages/settings/UserManagementPage'));
const ProductManagementPage = React.lazy(() => import('./pages/settings/ProductManagementPage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const FanGrowthPage = React.lazy(() => import('./pages/fans/FanGrowthPage'));
const FanEntryPage = React.lazy(() => import('./pages/fan-entry/FanEntryPage'));
const FanEntryRedirect = React.lazy(() => import('./pages/login/FanEntryRedirect'));
const FanCenterPage = React.lazy(() => import('./pages/fans/FanCenterPage'));
const StoreEntryPage = React.lazy(() => import('./pages/store-owner/StoreEntryPage'));
const StoreOwnerPage = React.lazy(() => import('./pages/store-owner/StoreOwnerPage'));

import { ROLES } from './utils/constants';

const router = createHashRouter([
  { path: "/", element: <FanEntryRedirect /> },
  { path: "/fan-entry", element: <FanEntryPage /> },
  { path: "/fan-center", element: <FanCenterPage /> },
  { path: "/store-login", element: <StoreEntryPage /> },
  { path: "/store-owner", element: <StoreOwnerPage /> },
  { path: "/admin", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/app",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "stores/list", element: <StoreListPage /> },
      { path: "stores/create", element: <StoreCreatePage /> },
      { path: "stores/:id", element: <StoreDetailPage /> },
      { path: "visits/list", element: <VisitListPage /> },
      { path: "visits/create", element: <VisitCreatePage /> },
      { path: "visits/:id", element: <VisitDetailPage /> },
      { path: "evaluation", element: <EvalListPage /> },
      { path: "evaluation/create", element: <EvalCreatePage /> },
      { path: "evaluation/:id", element: <EvalDetailPage /> },
      { path: "campaigns", element: <CampaignListPage /> },
      { path: "campaigns/create", element: <CampaignCreatePage /> },
      { path: "campaigns/:id", element: <CampaignDetailPage /> },
      { path: "fans/list", element: <ProtectedRoute requiredRole={ROLES.MANAGER}><FanListPage /></ProtectedRoute> },
      { path: "fans/:id", element: <ProtectedRoute requiredRole={ROLES.MANAGER}><FanDetailPage /></ProtectedRoute> },
      { path: "fans/rules", element: <ProtectedRoute requiredRole={ROLES.MANAGER}><FanRulesPage /></ProtectedRoute> },
      { path: "fans/scan", element: <ProtectedRoute requiredRole={ROLES.MANAGER}><ScanCenterPage /></ProtectedRoute> },
      { path: "fans/growth", element: <ProtectedRoute requiredRole={ROLES.MANAGER}><FanGrowthPage /></ProtectedRoute> },
      { path: "materials/list", element: <MaterialListPage /> },
      { path: "materials/stocks", element: <MaterialStocksPage /> },
      { path: "materials/inbound", element: <MaterialInboundPage /> },
      { path: "materials/outbound", element: <MaterialOutboundPage /> },
      { path: "settings/users", element: <ProtectedRoute requiredRole={ROLES.ADMIN}><SettingsPage /></ProtectedRoute> },
      { path: "settings/products", element: <ProtectedRoute requiredRole={ROLES.ADMIN}><SettingsPage /></ProtectedRoute> },
      { path: "settings/data", element: <ProtectedRoute requiredRole={ROLES.ADMIN}><SettingsPage /></ProtectedRoute> },
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

const App = () => {
  const { lang } = useLanguageStore();
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={lang === 'ar' ? arEG : lang === 'zh' ? zhCN : enUS}
        theme={{
          token: {
            colorPrimary: '#FFD700',
            colorInfo: '#FFD700',
            colorSuccess: '#16a34a',
            colorWarning: '#f59e0b',
            colorError: '#dc2626',
            borderRadius: 8,
            fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif",
          },
          components: {
            Layout: { headerBg: '#14141e', siderBg: '#11111a', bodyBg: '#1a1a24' },
            Card: { borderRadiusLG: 12, colorBgContainer: '#1e1e2a', colorBorderSecondary: 'rgba(255,255,255,0.08)' },
            Menu: { itemBorderRadius: 8, itemSelectedBg: '#2a2000', itemSelectedColor: '#FFD700', itemColor: '#c0c0d0', itemHoverBg: 'rgba(255,215,0,0.08)' },
            Button: { borderRadius: 8 },
            Table: { headerBg: '#1e1e2a', colorBgContainer: '#1e1e2a', borderColor: 'rgba(255,255,255,0.06)' },
          },
        }}
      >
        <AntApp>
          <ErrorBoundary>
            <Suspense fallback={<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#14141e"}}><Spin size="large" /></div>}>
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
