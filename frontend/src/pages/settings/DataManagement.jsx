import useLanguageStore from '../../stores/languageStore';
import React from 'react';
import { Card, Button, Upload, message, Space, Divider, Typography, Tag, Alert } from 'antd';
import { DownloadOutlined, ImportOutlined, DatabaseOutlined, CloudOutlined } from '@ant-design/icons';
import { IS_LOCAL_MODE } from '../../services/api';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import PageTransition from "../../components/common/PageTransition";

const { Text, Paragraph } = Typography;

const TABLES = [
  'profiles', 'stores', 'visits', 'visit_sales', 'visit_photos', 'products',
  'fans', 'fan_points_log', 'fan_points_rules', 'fan_level_rules',
  'materials', 'material_stocks', 'material_inbound', 'material_outbound',
  'store_evaluations', 'campaigns', 'campaign_tasks', 'campaign_reports',
  'qr_codes', 'scan_records',
];

const DataManagement = () => {
  const { t } = useLanguageStore();
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
    message.success(t('data_export_success'));
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
        message.success(`${t('data_import_complete')}: ${count}`);
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        message.error(`${t('invalid_backup_file')}: ${err.message}`);
      }
    };
    reader.readAsText(file);
    return false;
  };

  // Reset to seed data
  const handleReset = () => {
    if (window.confirm(t('confirm_reset_data'))) {
      TABLES.forEach(table => {
        localStorage.removeItem('store_manager_db_' + table);
      });
      localStorage.removeItem('store_manager_version');
      localDb.init(seedData);
      message.success(t('data_reset_success'));
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (window.confirm(t('confirm_clear_all'))) {
      TABLES.forEach(table => {
        localStorage.removeItem('store_manager_db_' + table);
      });
      localStorage.removeItem('store_manager_version');
      localStorage.removeItem('store_manager_current_user');
      message.success(t('data_clear_success'));
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // Count records
  const totalRecords = TABLES.reduce((sum, table) => sum + localDb.all(table).length, 0);

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass admin-readable-card" title={<><DatabaseOutlined /> {t('data_management')}</>} style={{ maxWidth: 760 }}>
      {IS_LOCAL_MODE ? (
        <Alert
          type="info"
          message={t('local_demo')}
          description={t('local_data_warning')}
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Alert type="success" message={`${t('cloud_mode')} (Supabase)`} description={t('cloud_mode_desc')} showIcon style={{ marginBottom: 16 }} />
      )}

      <div style={{ marginBottom: 16 }}>
        <Text strong>{t('total_records')}: </Text>
        <Tag color="blue" style={{ fontSize: 14, padding: '2px 12px' }}>{totalRecords}</Tag>
        <Text type="secondary" style={{ marginLeft: 8 }}>{TABLES.length} {t('across_tables')}</Text>
      </div>

      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <h4>{t('backup_restore')}</h4>
          <Paragraph type="secondary" style={{ fontSize: 13 }}>
            {t('backup_restore_desc')}
          </Paragraph>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>{t('export_data_backup')}</Button>
            <Upload accept=".json" showUploadList={false} beforeUpload={handleImport}>
              <Button icon={<ImportOutlined />}>{t('import_data_restore')}</Button>
            </Upload>
          </Space>
        </div>

        <Divider />

        <div>
          <h4>{t('reset_clear')}</h4>
          <Paragraph type="secondary" style={{ fontSize: 13 }}>
            {t('reset_clear_desc')}
          </Paragraph>
          <Space>
            <Button onClick={handleReset}>{t('reset_demo_data')}</Button>
            <Button danger onClick={handleClearAll}>{t('clear_all_data')}</Button>
          </Space>
        </div>

        <Divider />

        <div>
          <h4><CloudOutlined /> {t('cloud_upgrade')}</h4>
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
    </div>
    </PageTransition>);
};

export default DataManagement;
