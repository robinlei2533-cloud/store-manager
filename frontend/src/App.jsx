import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import enUS from 'antd/locale/en_US';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StoreListPage from './pages/stores/StoreListPage';
import StoreDetailPage from './pages/stores/StoreDetailPage';
import StoreCreatePage from './pages/stores/StoreCreatePage';
import VisitListPage from './pages/visits/VisitListPage';
import VisitDetailPage from './pages/visits/VisitDetailPage';
import VisitCreatePage from './pages/visits/VisitCreatePage';
import EvalListPage from './pages/evaluation/EvalListPage';
import EvalDetailPage from './pages/evaluation/EvalDetailPage';
import EvalCreatePage from './pages/evaluation/EvalCreatePage';
import CampaignListPage from './pages/campaigns/CampaignListPage';
import CampaignDetailPage from './pages/campaigns/CampaignDetailPage';
import CampaignCreatePage from './pages/campaigns/CampaignCreatePage';
import FanListPage from './pages/fans/FanListPage';
import FanDetailPage from './pages/fans/FanDetailPage';
import FanRulesPage from './pages/fans/FanRulesPage';
import ScanCenterPage from './pages/fans/ScanCenterPage';
import MaterialListPage from './pages/materials/MaterialListPage';
import MaterialStocksPage from './pages/materials/MaterialStocksPage';
import MaterialInboundPage from './pages/materials/MaterialInboundPage';
import MaterialOutboundPage from './pages/materials/MaterialOutboundPage';
import UserManagementPage from './pages/settings/UserManagementPage';
import ProductManagementPage from './pages/settings/ProductManagementPage';
import SettingsPage from './pages/settings/SettingsPage';
import FanGrowthPage from './pages/fans/FanGrowthPage';
import CommunityPage from './pages/community/CommunityPage';

import FanLoginPage from './pages/login/FanLoginPage';
import FanCenterPage from './pages/fans/FanCenterPage';

import { ROLES } from './utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={enUS}
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
          },
        }}
      >
        <AntApp>
          <ErrorBoundary>
            <HashRouter>
            <Routes>
              {/* Fan entrance — root path */}
              <Route path="/" element={<FanLoginPage />} />
              <Route path="/fan-center" element={<FanCenterPage />} />

              {/* Admin login — hidden URL */}
              <Route path="/admin" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin app — all routes under /dashboard with AppLayout */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Stores */}
                <Route path="stores/list" element={<StoreListPage />} />
                <Route path="stores/create" element={<StoreCreatePage />} />
                <Route path="stores/:id" element={<StoreDetailPage />} />

                {/* Visits */}
                <Route path="visits/list" element={<VisitListPage />} />
                <Route path="visits/create" element={<VisitCreatePage />} />
                <Route path="visits/:id" element={<VisitDetailPage />} />

                {/* Evaluation */}
                <Route path="evaluation" element={<EvalListPage />} />
                <Route path="evaluation/create" element={<EvalCreatePage />} />
                <Route path="evaluation/:id" element={<EvalDetailPage />} />

                {/* Campaigns */}
                <Route path="campaigns" element={<CampaignListPage />} />
                <Route path="campaigns/create" element={<CampaignCreatePage />} />
                <Route path="campaigns/:id" element={<CampaignDetailPage />} />

                {/* Fans — admin/manager only */}
                <Route path="fans/list" element={<ProtectedRoute requiredRole={ROLES.MANAGER}><FanListPage /></ProtectedRoute>} />
                <Route path="fans/:id" element={<ProtectedRoute requiredRole={ROLES.MANAGER}><FanDetailPage /></ProtectedRoute>} />
                <Route path="fans/rules" element={<ProtectedRoute requiredRole={ROLES.MANAGER}><FanRulesPage /></ProtectedRoute>} />
                <Route path="fans/scan" element={<ProtectedRoute requiredRole={ROLES.MANAGER}><ScanCenterPage /></ProtectedRoute>} />
                <Route path="fans/growth" element={<ProtectedRoute requiredRole={ROLES.MANAGER}><FanGrowthPage /></ProtectedRoute>} />

                {/* Community */}
                <Route path="community" element={<CommunityPage />} />

                {/* Materials */}
                <Route path="materials/list" element={<MaterialListPage />} />
                <Route path="materials/stocks" element={<MaterialStocksPage />} />
                <Route path="materials/inbound" element={<MaterialInboundPage />} />
                <Route path="materials/outbound" element={<MaterialOutboundPage />} />

                {/* Settings */}
                <Route path="settings/users" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><SettingsPage /></ProtectedRoute>} />
                <Route path="settings/products" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><SettingsPage /></ProtectedRoute>} />
                <Route path="settings/data" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><SettingsPage /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
          </ErrorBoundary>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
