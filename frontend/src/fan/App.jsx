import React, { Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useLanguageStore from '../stores/languageStore';
import PageTransition from "../components/common/PageTransition";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } } });

// Fan portal pages only
const FanEntryPage = React.lazy(() => import('../pages/fan-entry/FanEntryPage'));
const FanCenterPage = React.lazy(() => import('../pages/fans/FanCenterPage'));

const StoreLoginBridge = () => {
  React.useEffect(() => {
    window.location.replace('store-app.html#/store-login');
  }, []);
  return <div style={{ minHeight: '100vh', background: '#000000' }} />;
};

const router = createHashRouter([
  { path: "/", element: <Navigate to="/fan-entry" replace /> },
  { path: "/fan-entry", element: <FanEntryPage /> },
  { path: "/fan-center", element: <ProtectedRoute redirectTo="/fan-entry"><FanCenterPage /></ProtectedRoute> },
  { path: "/store-login", element: <StoreLoginBridge /> },
  { path: "*", element: <Navigate to="/fan-entry" replace /> }
]);

const FanApp = () => {
  const { lang } = useLanguageStore();
  const localeMap = { zh: zhCN, en: enUS, ar: arEG };
  const locale = localeMap[lang] || zhCN;

  return (
    <PageTransition>
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: '#FFD700',
          colorInfo: '#FFD700',
          colorSuccess: '#16a34a',
          colorWarning: '#f59e0b',
          colorError: '#dc2626',
          colorText: '#e5e5e5',
          colorTextSecondary: 'rgba(255,255,255,0.65)',
          colorTextTertiary: 'rgba(255,255,255,0.35)',
          colorBgBase: '#000000',
          colorBgLayout: '#0a0a0f',
          colorBgContainer: '#111118',
          colorBorder: 'rgba(255,255,255,0.08)',
          colorBorderSecondary: 'rgba(255,255,255,0.06)',
          borderRadius: 8,
          fontFamily: "'Barlow', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif",
        },
        components: {
          Layout: { headerBg: '#0a0a0f', siderBg: '#000000', bodyBg: '#0a0a0f' },
          Card: { borderRadiusLG: 8, colorBgContainer: 'rgba(255,255,255,0.02)', colorBorderSecondary: 'rgba(255,215,0,0.08)' },
          Menu: { itemBorderRadius: 8, itemSelectedBg: 'rgba(255,215,0,0.12)', itemSelectedColor: '#FFD700' },
          Button: { borderRadius: 8 },
          Table: { headerBg: 'rgba(255,215,0,0.06)', colorBgContainer: '#0a0a0f', borderColor: 'rgba(255,255,255,0.08)', headerColor: '#e5e5e5', rowHoverBg: 'rgba(255,215,0,0.06)' },
        },
      }}
    >
      <QueryClientProvider client={queryClient}><AntApp>
        <ErrorBoundary>
          <Suspense fallback={<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#000000"}}><Spin size="large" /></div>}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
      </AntApp></QueryClientProvider>
    </ConfigProvider>
    </PageTransition>);
};

export default FanApp;
