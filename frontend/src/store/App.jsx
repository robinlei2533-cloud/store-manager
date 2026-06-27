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
import LanguageSwitcher from '../components/common/LanguageSwitcher';

// Store portal pages only
const StoreOwnerPage = React.lazy(() => import('../pages/store-owner/StoreOwnerPage'));

const router = createHashRouter([
  { path: "/", element: <Navigate to="/store-owner" replace /> },
  { path: "/store-owner", element: <StoreOwnerPage /> },
  { path: "*", element: <Navigate to="/store-owner" replace /> }
]);

const queryClient = new QueryClient();

const StoreApp = () => {
  const { lang } = useLanguageStore();

  const localeMap = { zh: zhCN, en: enUS, ar: arEG };
  const locale = localeMap[lang] || zhCN;

  return (
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
            Layout: { headerBg: '#0a0a0f', siderBg: '#0d0d15', bodyBg: '#12121a' },
            Card: { borderRadiusLG: 8 },
            Menu: { itemBorderRadius: 8, itemSelectedBg: '#2a2000', itemSelectedColor: '#FFD700' },
            Button: { borderRadius: 8 },
            Table: { headerBg: '#1a1a25' },
          },
        }}
      >
        <AntApp>
          <ErrorBoundary>
            <Suspense fallback={<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#0a0a0f"}}><Spin size="large" /></div>}>
              <LanguageSwitcher />
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default StoreApp;
