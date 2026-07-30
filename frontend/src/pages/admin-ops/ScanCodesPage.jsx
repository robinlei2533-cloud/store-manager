import React, { useMemo, useState } from 'react';
import { Button, Card, Col, InputNumber, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import localDb from '../../services/db/localDb';
import { generateScanCodeBatch, reviewScanRecord, setScanCodeStatus } from './admin-ops-workflows';
import { getScanValidationContract } from '../../utils/uwellLaunchRules';

const { Title, Text } = Typography;

const codeTypeLabels = {
  product_unique: 'UWELL 唯一产品码',
  store_event: '门店活动码',
  official_activity: '官方活动码',
  fan_center_entry: '粉丝中心入口码',
  official_site: '官方网站码',
  social_community: '私域社区 / 社交码',
};

const supportedCodeTypes = [
  { key: 'product_unique', type: 'UWELL 唯一产品码', points: '+5', rule: '全局一次性领取，每个粉丝每天最多 3 次产品扫码计分', status: '可领取' },
  { key: 'store_event', type: '门店活动码', points: '按活动规则', rule: '发放积分前需要门店核销', status: '需核销' },
  { key: 'official_activity', type: '官方活动码', points: '按配置', rule: '需要校验活动有效期和重复参与', status: '启用中' },
  { key: 'fan_center_entry', type: '粉丝中心入口码', points: '可选', rule: '只做入口、归因或追踪，不自动发放产品扫码积分', status: '无产品积分' },
  { key: 'social_community', type: '官网 / 社交 / 私域社区码', points: '按任务决定', rule: '可成为任务入口，但不一定发放积分', status: '可配置' },
  { key: 'unknown', type: '非 UWELL 码', points: '0', rule: '友好识别并拒绝，必要时记录风险证据', status: '已拒绝' },
];

const scanCodeClassCards = [
  ['产品唯一码', '官方 UWELL 产品凭证。发放积分必须通过服务端签名和一次性领取校验。'],
  ['门店活动码和官方活动码', '用于活动参与和门店闭环，必要时需要门店核销。'],
  ['粉丝入口、官网、社交和私域码', '可以承接流量或开启任务，但不会自动发放产品扫码积分。'],
  ['非 UWELL 码拒绝', '友好识别并拒绝，必要时记录风险证据。'],
];

const scanBoundaryLadder = [
  '本地识别不足以发放产品积分',
  '每日计分产品扫码上限继续生效',
  '封禁、过期、清除、审核或拒绝扫码记录都要保留审计链路',
];

function getScanCodeRows() {
  return (localDb.all('qr_codes') || []).map((code) => ({
    ...code,
    products: localDb.findById('products', code.product_id),
    stores: localDb.findById('stores', code.store_id),
    code_type: code.code_type || 'product_unique',
    status: code.status || (code.is_active === false ? 'blocked' : code.scan_count > 0 ? 'claimed' : 'unused'),
  })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function getSuspiciousScanRows() {
  return (localDb.all('scan_records') || [])
    .filter((record) => ['suspicious', 'under_review', 'confirmed_fraud'].includes(record.risk_status) || ['pending', 'under_review'].includes(record.review_status))
    .map((record) => ({
      ...record,
      fan: localDb.findById('fans', record.fan_id),
      product: localDb.findById('products', record.product_id),
      store: localDb.findById('stores', record.store_id),
      review_status: record.review_status || 'pending',
    }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export default function ScanCodesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [batchCount, setBatchCount] = useState(20);
  const [codeType, setCodeType] = useState('product_unique');
  const [productId, setProductId] = useState('p-004');
  const codes = useMemo(() => {
    void refreshKey;
    return getScanCodeRows();
  }, [refreshKey]);
  const suspiciousScans = useMemo(() => {
    void refreshKey;
    return getSuspiciousScanRows();
  }, [refreshKey]);
  const products = localDb.all('products') || [];
  const validationContract = getScanValidationContract();
  const claimedToday = (localDb.all('scan_records') || []).filter((record) => {
    const scannedAt = record.scanned_at || record.created_at;
    return scannedAt && scannedAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }).length;
  const dailyLimitHits = (localDb.all('scan_records') || []).filter((record) => record.scan_result === 'daily_limit').length;
  const blockedCodes = codes.filter((code) => code.status === 'blocked' || code.is_active === false).length;

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleGenerate = () => {
    const created = generateScanCodeBatch({
      count: batchCount,
      codeType,
      productId,
      points: codeType === 'product_unique' ? 5 : 0,
      prefix: codeType === 'product_unique' ? 'UWELL-G5' : 'UWELL-ACT',
    });
    refresh();
    message.success(`已生成 ${created.length} 个扫码码`);
  };

  const updateCode = (id, status) => {
    try {
      setScanCodeStatus(id, status);
      refresh();
      message.success('扫码码状态已更新');
    } catch (error) {
      message.error(error?.message || '扫码码状态更新失败');
    }
  };

  const updateScan = (id, status) => {
    try {
      reviewScanRecord(id, status);
      refresh();
      message.success('扫码审核已更新');
    } catch (error) {
      message.error(error?.message || '扫码审核失败');
    }
  };

  return (
    <div className="admin-ops-page admin-scan-cockpit">
      <Title level={2}>扫码码库</Title>
      <Text type="secondary">扫码码库统一管理反作弊、产品唯一码、活动码、扫码记录和可疑扫码审核。</Text>
      <Card className="admin-scan-command-strip" style={{ marginTop: 18 }}>
        <div>
          <Text strong>UWELL扫码反作弊驾驶舱</Text>
          <p>唯一产品码只有经过官方校验后才会发放积分。</p>
        </div>
        <Tag color="volcano">生产校验边界</Tag>
      </Card>
      <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={14}>
          <Card title="码类型治理" className="admin-scan-code-class-grid">
            <Row gutter={[10, 10]}>
              {scanCodeClassCards.map(([title, desc]) => (
                <Col xs={24} sm={12} key={title}>
                  <div className="admin-ops-mini-card">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="校验边界阶梯" className="admin-scan-boundary-ladder">
            {scanBoundaryLadder.map((item, index) => (
              <div className="admin-ops-row" key={item}>
                <span>步骤 {index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
        {[
          ['今日已领取', claimedToday],
          ['触发每日上限', dailyLimitHits],
          ['可疑扫码', suspiciousScans.length],
          ['已封禁码', blockedCodes],
        ].map(([item, value]) => (
          <Col xs={24} sm={12} lg={6} key={item}>
            <Card><Text>{item}</Text><Title level={3}>{value}</Title></Card>
          </Col>
        ))}
      </Row>

      <Card title="生成UWELL码批次" style={{ marginTop: 18 }}>
        <Space wrap>
          <Select
            value={codeType}
            onChange={setCodeType}
            style={{ width: 250 }}
            options={Object.entries(codeTypeLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            value={productId}
            onChange={setProductId}
            style={{ width: 240 }}
            options={products.map((item) => ({ value: item.id, label: `${item.name || item.id} ${item.sku ? `(${item.sku})` : ''}` }))}
          />
          <InputNumber min={1} max={200} value={batchCount} onChange={(value) => setBatchCount(value || 20)} />
          <Button type="primary" onClick={handleGenerate}>生成批次</Button>
        </Space>
        <div style={{ marginTop: 10 }}>
          <Text type="secondary">产品唯一码是一次性的 UWELL 产品凭证。入口、官网、社交和私域社区码可以追踪来源，但不会自动发放产品扫码积分。</Text>
        </div>
      </Card>

      <Card title="支持的码类型" style={{ marginTop: 18 }}>
        <Table
          size="small"
          pagination={false}
          dataSource={supportedCodeTypes}
          rowKey="key"
          columns={[
            { title: '码类型', dataIndex: 'type' },
            { title: '积分', dataIndex: 'points' },
            { title: '规则', dataIndex: 'rule' },
            { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === '已拒绝' ? 'volcano' : value === '需核销' ? 'gold' : 'green'}>{value}</Tag> },
          ]}
        />
      </Card>

      <Card title="生产校验边界" style={{ marginTop: 18 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={8}>
            <Text strong>模式</Text>
            <div><Tag color="volcano">{validationContract.mode}</Tag></div>
            <Text type="secondary">本地模式识别状态为 {validationContract.localRecognitionMode}；它可以识别可能的 UWELL 码，但不能单独发放产品扫码积分。</Text>
          </Col>
          <Col xs={24} lg={8}>
            <Text strong>产品码必填字段</Text>
            <div style={{ marginTop: 8 }}>
              {validationContract.requiredProductCodeFields.map((field) => <Tag key={field}>{field}</Tag>)}
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <Text strong>判定状态</Text>
            <div style={{ marginTop: 8 }}>
              {validationContract.decisionStatuses.map((status) => <Tag color={status === 'suspicious' || status === 'blocked' ? 'volcano' : 'blue'} key={status}>{status}</Tag>)}
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="码库" style={{ marginTop: 18 }}>
        <Table
          size="small"
          rowKey="id"
          dataSource={codes}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: '码', dataIndex: 'code', ellipsis: true },
            { title: '类型', dataIndex: 'code_type', render: (value) => codeTypeLabels[value] || value },
            { title: '产品', render: (_, row) => row.products?.name || row.product_id || '-' },
            { title: '批次', render: (_, row) => row.batch_no || row.batch_id || '-' },
            { title: '校验来源', render: (_, row) => row.validator_source || 'admin_generated_trial_batch' },
            { title: '扫码次数', dataIndex: 'scan_count' },
            { title: '状态', dataIndex: 'status', render: (value, row) => <Tag color={!row.is_active || value === 'blocked' ? 'volcano' : value === 'claimed' ? 'green' : 'blue'}>{!row.is_active ? 'blocked' : value}</Tag> },
            {
              title: '操作',
              render: (_, row) => (
                <Space>
                  <Button size="small" onClick={() => updateCode(row.id, 'blocked')}>封禁</Button>
                  <Button size="small" onClick={() => updateCode(row.id, 'unused')}>解封</Button>
                  <Button size="small" onClick={() => updateCode(row.id, 'expired')}>设为过期</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Card title="可疑扫码审核" style={{ marginTop: 18 }}>
        <Table
          size="small"
          rowKey="id"
          dataSource={suspiciousScans}
          pagination={{ pageSize: 6 }}
          columns={[
            { title: '粉丝', render: (_, row) => row.fan?.name || row.fan_id },
            { title: '产品', render: (_, row) => row.product?.name || row.product_id || '-' },
            { title: '门店', render: (_, row) => row.store?.name || row.store_id || '-' },
            { title: '积分', dataIndex: 'points_earned' },
            { title: '审核', dataIndex: 'review_status', render: (value) => <Tag color={value === 'cleared' ? 'green' : value === 'rejected' ? 'volcano' : 'gold'}>{value}</Tag> },
            {
              title: '操作',
              render: (_, row) => (
                <Space>
                  <Button size="small" type="primary" onClick={() => updateScan(row.id, 'cleared')}>放行</Button>
                  <Button size="small" onClick={() => updateScan(row.id, 'under_review')}>复核</Button>
                  <Button size="small" danger onClick={() => updateScan(row.id, 'rejected')}>拒绝</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
