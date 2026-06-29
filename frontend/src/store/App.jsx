import React, { Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
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
  const { lang } = useLanguageStore();

  const localeMap = { zh: zhCN, en: enUS, ar: arEG };
  const locale = localeMap[lang] || zhCN;

  return (
    <PageTransition>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={locale}
        theme={{
          token: {
            colorPrimary: '#FFD700',
            colorInfo: '#FFD700',
            colorSuccess: '#16a34a',
            colorWarning: '#f59e0b',
            colorError: '#dc2626',
            borderRadius: 8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif",
          },
          components: {
            Layout: { headerBg: '#14141e', siderBg: '#11111a', bodyBg: '#1a1a24' },
            Card: { borderRadiusLG: 8 },
            Menu: { itemBorderRadius: 8, itemSelectedBg: '#2a2000', itemSelectedColor: '#FFD700' },
            Button: { borderRadius: 8 },
            Table: { headerBg: '#1a1a25' },
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
    </PageTransition>);
};

export default StoreApp;
