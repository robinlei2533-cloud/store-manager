import React, { Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '../components/common/ErrorBoundary';

import useLanguageStore from '../stores/languageStore';
import PageTransition from "../components/common/PageTransition";

// Store portal pages only
const StoreEntryPage = React.lazy(() => import('../pages/store-owner/StoreEntryPage'));
const StoreOwnerPage = React.lazy(() => import('../pages/store-owner/StoreOwnerPage'));

const router = createHashRouter([
  { path: "/", element: <Navigate to="/store-login" replace /> },
  { path: "/store-login", element: <StoreEntryPage /> },
  { path: "/store-owner", element: <StoreOwnerPage /> },
  { path: "*", element: <Navigate to="/store-login" replace /> }
]);

const queryClient = new QueryClient();

const StoreApp = () => {
  const { lang, activatePortalLanguage } = useLanguageStore();
  React.useEffect(() => {
    activatePortalLanguage('store');
  }, [activatePortalLanguage]);

  const localeMap = { en: enUS, ar: arEG };
  const locale = localeMap[lang] || enUS;

  return (
    <PageTransition>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={locale}
        direction={lang === 'ar' ? 'rtl' : 'ltr'}
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
        <AntApp>
          <ErrorBoundary>
            <Suspense fallback={<div className="uw-route-loading"><Spin size="large" /><span>Loading store portal...</span></div>}>
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
    </PageTransition>);
};

export default StoreApp;
