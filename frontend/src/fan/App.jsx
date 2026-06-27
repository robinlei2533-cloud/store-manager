import React, { Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useLanguageStore from '../stores/languageStore';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } } });

// Fan portal pages only
const FanEntryPage = React.lazy(() => import('../pages/fan-entry/FanEntryPage'));
const FanCenterPage = React.lazy(() => import('../pages/fans/FanCenterPage'));

const router = createHashRouter([
  { path: "/", element: <Navigate to="/fan-entry" replace /> },
  { path: "/fan-entry", element: <FanEntryPage /> },
  { path: "/fan-center", element: <FanCenterPage /> },
  { path: "*", element: <Navigate to="/fan-entry" replace /> }
]);

const FanApp = () => {
  return (
    <ConfigProvider
      locale={zhCN}
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
      <QueryClientProvider client={queryClient}><AntApp>
        <ErrorBoundary>
          <Suspense fallback={<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#0a0a0f"}}><Spin size="large" /></div>}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
      </AntApp></QueryClientProvider>
    </ConfigProvider>
  );
};

export default FanApp;
