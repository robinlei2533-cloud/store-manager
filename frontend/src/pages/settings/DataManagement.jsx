import useLanguageStore from '../../stores/languageStore';
import React from 'react';
import { Card, Button, Upload, message, Space, Divider, Typography, Tag, Alert } from 'antd';
import { DownloadOutlined, ImportOutlined, DatabaseOutlined, CloudOutlined } from '@ant-design/icons';
import { IS_LOCAL_MODE } from '../../services/api';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';

const { Text, Paragraph } = Typography;

const TABLES = [
  'profiles', 'stores', 'visits', 'visit_sales', 'visit_photos', 'products',
  'fans', 'fan_points_log', 'fan_points_rules', 'fan_level_rules',
  'materials', 'material_stocks', 'material_inbound', 'material_outbound',
  'store_evaluations', 'campaigns', 'campaign_tasks', 'campaign_reports',
  'qr_codes', 'scan_records',
];

const DataManagement = () => {
  // Export all local data as JSON
  const handleExport = () => {
    const allData = {};
    TABLES.forEach(table => {
      allData[table] = localDb.all(table);
    });
    allData._export_time = new Date().toISOString();
    allData._version = '2.0';

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `store-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Data exported successfully');
  };

  // Import data from JSON
  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        let count = 0;
        TABLES.forEach(table => {
          if (data[table] && Array.isArray(data[table])) {
            // Replace existing data
            localStorage.setItem('store_manager_db_' + table, JSON.stringify(data[table]));
            count += data[table].length;
          }
        });
        message.success(`Import complete: ${count} records restored. Reloading...`);
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        message.error('Invalid backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    return false;
  };

  // Reset to seed data
  const handleReset = () => {
    if (window.confirm('This will DELETE all your data and restore demo data. Are you sure?')) {
      TABLES.forEach(table => {
        localStorage.removeItem('store_manager_db_' + table);
      });
      localStorage.removeItem('store_manager_version');
      localDb.init(seedData);
      message.success('Data reset to demo. Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (window.confirm('This will DELETE ALL DATA permanently. Are you absolutely sure?')) {
      TABLES.forEach(table => {
        localStorage.removeItem('store_manager_db_' + table);
      });
      localStorage.removeItem('store_manager_version');
      localStorage.removeItem('store_manager_current_user');
      message.success('All data cleared. Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // Count records
  const totalRecords = TABLES.reduce((sum, table) => sum + localDb.all(table).length, 0);

  return (
    <Card title={<><DatabaseOutlined /> Data Management</>} style={{ maxWidth: 700 }}>
      {IS_LOCAL_MODE ? (
        <Alert
          type="info"
          message="Local Demo Mode"
          description="Your data is stored in this browser only. Export regularly to avoid data loss. To enable cloud sync, configure Supabase."
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Alert type="success" message="Cloud Mode (Supabase)" description="Data is synced to the cloud." showIcon style={{ marginBottom: 16 }} />
      )}

      <div style={{ marginBottom: 16 }}>
        <Text strong>Total Records: </Text>
        <Tag color="blue" style={{ fontSize: 14, padding: '2px 12px' }}>{totalRecords}</Tag>
        <Text type="secondary" style={{ marginLeft: 8 }}>across {TABLES.length} tables</Text>
      </div>

      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <h4>Backup & Restore</h4>
          <Paragraph type="secondary" style={{ fontSize: 13 }}>
            Export your data to a JSON file for backup. Import to restore from a previous backup.
          </Paragraph>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>Export Data (Backup)</Button>
            <Upload accept=".json" showUploadList={false} beforeUpload={handleImport}>
              <Button icon={<ImportOutlined />}>Import Data (Restore)</Button>
            </Upload>
          </Space>
        </div>

        <Divider />

        <div>
          <h4>Reset & Clear</h4>
          <Paragraph type="secondary" style={{ fontSize: 13 }}>
            Reset restores demo data. Clear removes everything permanently.
          </Paragraph>
          <Space>
            <Button onClick={handleReset}>Reset to Demo Data</Button>
            <Button danger onClick={handleClearAll}>Clear All Data</Button>
          </Space>
        </div>

        <Divider />

        <div>
          <h4><CloudOutlined /> Upgrade to Cloud Mode</h4>
          <Paragraph type="secondary" style={{ fontSize: 13 }}>
            To enable multi-user access, cloud storage, and data persistence:
          </Paragraph>
          <ol style={{ paddingLeft: 20, color: '#666', fontSize: 13, lineHeight: 2 }}>
            <li>Create a free account at <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a></li>
            <li>Create a new project (free tier is sufficient)</li>
            <li>Run the SQL migration script (in <code>database/migration.sql</code>) in Supabase SQL Editor</li>
            <li>Create a Storage bucket named <code>visit-photos</code> (set to public)</li>
            <li>Copy your Project URL and anon key into <code>.env</code> file</li>
            <li>Redeploy — the app automatically switches to cloud mode</li>
          </ol>
        </div>
      </Space>
    </Card>
  );
};

export default DataManagement;
