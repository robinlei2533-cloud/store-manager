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

  return (
    <PageTransition>
    <Card>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'users',
            label: <span><UserOutlined /> Users</span>,
            children: <UserManagementPage />,
          },
          {
            key: 'products',
            label: <span><AppstoreOutlined /> Products</span>,
            children: <ProductManagementPage />,
          },
          {
            key: 'data',
            label: <span><DatabaseOutlined /> Data</span>,
            children: <DataManagement />,
          },
          {
            key: 'audit',
            label: <span><FileTextOutlined /> Audit Log</span>,
            children: <AuditLogPage />,
          },
        ]}
      />
    </Card>
    </PageTransition>);
};

export default SettingsPage;
