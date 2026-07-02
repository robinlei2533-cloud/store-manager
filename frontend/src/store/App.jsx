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
            colorPrimary: '#B98916',
            colorInfo: '#B98916',
            colorSuccess: '#16a34a',
            colorWarning: '#f59e0b',
            colorError: '#dc2626',
            colorText: '#181512',
            colorTextSecondary: '#62594b',
            colorTextTertiary: '#8a7d68',
            colorBgBase: '#f6f3ec',
            colorBgLayout: '#f6f3ec',
            colorBgContainer: '#ffffff',
            colorBorder: 'rgba(82,62,24,0.16)',
            colorBorderSecondary: 'rgba(82,62,24,0.10)',
            borderRadius: 8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif",
          },
          components: {
            Layout: { headerBg: '#ffffff', siderBg: '#11100d', bodyBg: '#f6f3ec' },
            Card: { borderRadiusLG: 8, colorBgContainer: '#ffffff', colorBorderSecondary: 'rgba(82,62,24,0.12)' },
            Menu: { itemBorderRadius: 8, itemSelectedBg: 'rgba(185,137,22,0.12)', itemSelectedColor: '#B98916' },
            Button: { borderRadius: 8 },
            Table: { headerBg: '#f1eadb', colorBgContainer: '#ffffff', borderColor: 'rgba(82,62,24,0.12)', headerColor: '#3b2d13', rowHoverBg: '#fff7df' },
          },
        }}
      >
        <AntApp>
          <ErrorBoundary>
            <Suspense fallback={<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#f6f3ec"}}><Spin size="large" /></div>}>
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
    </PageTransition>);
};

export default StoreApp;
