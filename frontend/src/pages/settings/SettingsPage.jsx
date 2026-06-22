import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { UserOutlined, AppstoreOutlined, DatabaseOutlined } from '@ant-design/icons';
import UserManagementPage from './UserManagementPage';
import ProductManagementPage from './ProductManagementPage';
import DataManagement from './DataManagement';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
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
        ]}
      />
    </Card>
  );
};

export default SettingsPage;
