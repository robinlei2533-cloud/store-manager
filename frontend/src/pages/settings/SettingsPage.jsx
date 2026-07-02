import useLanguageStore from '../../stores/languageStore';
import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { UserOutlined, AppstoreOutlined, DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';
import UserManagementPage from './UserManagementPage';
import ProductManagementPage from './ProductManagementPage';
import DataManagement from './DataManagement';
import AuditLogPage from './AuditLogPage';
import PageTransition from '../../components/common/PageTransition';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { t } = useLanguageStore();

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'users',
            label: <span><UserOutlined /> {t('set_user_mgmt')}</span>,
            children: <UserManagementPage />,
          },
          {
            key: 'products',
            label: <span><AppstoreOutlined /> {t('set_product_mgmt')}</span>,
            children: <ProductManagementPage />,
          },
          {
            key: 'data',
            label: <span><DatabaseOutlined /> {t('set_data_mgmt')}</span>,
            children: <DataManagement />,
          },
          {
            key: 'audit',
            label: <span><FileTextOutlined /> {t('audit_log')}</span>,
            children: <AuditLogPage />,
          },
        ]}
      />
    </Card>
    </div>
    </PageTransition>);
};

export default SettingsPage;
