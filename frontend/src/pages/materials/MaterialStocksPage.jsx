import React from 'react';
import { Table, Tag, Card, Spin, Empty, Image, Statistic, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getMaterialStocks, getMaterials } from '../../services/api';
import PageTransition from '../../components/common/PageTransition';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import { OPERATIONAL_RULE_RECORD_ID, canViewWarehouse, REGIONAL_WAREHOUSES, mergeOperationalRules } from '../../utils/uwellLaunchRules';

const WAREHOUSE_LABELS = {
  Riyadh: 'Riyadh Warehouse',
  Dammam: 'Dammam Warehouse',
  Jeddah: 'Jeddah Warehouse',
};

const MaterialStocksPage = () => {
  const { profile } = useAuthStore();
  const { data: stocks = [], isLoading } = useQuery({ queryKey: ['material-stocks'], queryFn: getMaterialStocks });
  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const assignedRegion = profile?.region || profile?.city || 'Riyadh';
  const visibleWarehouses = REGIONAL_WAREHOUSES.filter((item) => canViewWarehouse(profile?.role || 'admin', assignedRegion, item.region));
  const visibleWarehouseRegions = new Set(visibleWarehouses.map((item) => item.region));
  const operationalRules = mergeOperationalRules(localDb.findById('fan_points_rules', OPERATIONAL_RULE_RECORD_ID)?.settings);
  const effectiveSafetyStock = (stock) => Math.max(Number(stock?.safety_stock || 0), operationalRules.materialLowStockThreshold);

  const getWarehouseStock = (materialId, region) => {
    const warehouseName = WAREHOUSE_LABELS[region];
    const direct = stocks.find((item) => item.material_id === materialId && [region, warehouseName].includes(item.warehouse));
    if (direct) return { ...direct, safety_stock: effectiveSafetyStock(direct) };
    const fallback = stocks.find((item) => item.material_id === materialId && (!item.warehouse || item.warehouse === 'Default'));
    if (!fallback) return { qty: 0, safety_stock: operationalRules.materialLowStockThreshold };
    const regionOffset = region === 'Riyadh' ? 0 : region === 'Dammam' ? 0.62 : 0.38;
    return {
      qty: Math.max(0, Math.round((fallback.qty || 0) * (region === 'Riyadh' ? 0.46 : regionOffset))),
      safety_stock: Math.max(Math.round((fallback.safety_stock || 0) * 0.34), operationalRules.materialLowStockThreshold),
    };
  };

  // Merge image from materials into multi-warehouse stocks.
  const enrichedStocks = materials.map((mat) => {
    const baseStock = stocks.find((item) => item.material_id === mat.id) || {};
    const warehouseStock = Object.fromEntries(REGIONAL_WAREHOUSES.map((item) => [item.region, getWarehouseStock(mat.id, item.region)]));
    const visibleTotalStock = visibleWarehouses.reduce((sum, item) => sum + (warehouseStock[item.region]?.qty || 0), 0);
    const lowRegions = REGIONAL_WAREHOUSES.filter((item) => {
      const stock = warehouseStock[item.region];
      return stock.safety_stock > 0 && stock.qty <= stock.safety_stock;
    });
    return {
      ...baseStock,
      material_id: mat.id,
      materials: mat,
      image_url: mat?.image_url,
      warehouseStock,
      visibleTotalStock,
      lowRegions,
    };
  });

  const legacyStocks = stocks.map((stock) => {
    const mat = materials.find((item) => item.id === stock.material_id);
    return { ...stock, image_url: mat?.image_url };
  });
  const tableData = enrichedStocks.length ? enrichedStocks : legacyStocks;
  const getVisibleLowRegions = (row) => row.lowRegions?.filter((item) => visibleWarehouseRegions.has(item.region)) || [];
  const hasVisibleLowStock = (row) => getVisibleLowRegions(row).length > 0 || row.qty <= row.safety_stock;
  const materialRequests = (localDb.all('material_requests') || []).filter((request) => (
    canViewWarehouse(profile?.role || 'admin', assignedRegion, request.region || request.warehouse)
  ));
  const pendingRequests = materialRequests.filter((request) => request.status === 'pending');
  const stockRiskRequests = materialRequests.filter((request) => {
    const stock = stocks.find((item) => item.material_id === request.material_id && [request.region, request.warehouse].includes(item.warehouse));
    return !stock || Number(stock.qty || 0) < Number(request.qty || 0) || Number(stock.qty || 0) <= effectiveSafetyStock(stock);
  });
  const visibleLowStockRows = tableData.filter((row) => hasVisibleLowStock(row));
  const materialWarehouseCommand = [
    {
      label: '可见仓库范围',
      value: visibleWarehouses.length,
      detail: profile?.role === 'admin'
        ? 'Admin 可查看 Riyadh、Dammam、Jeddah 三个仓库。'
        : `当前 ${profile?.role || 'user'} 范围：${assignedRegion}。`,
    },
    {
      label: '待审核门店申请',
      value: pendingRequests.length,
      detail: '物料申请需后台审核后才会预留库存。',
    },
    {
      label: '库存风险申请',
      value: stockRiskRequests.length,
      detail: '可能超过区域库存或触发低库存线的申请。',
    },
    {
      label: '低库存仓库预警',
      value: visibleLowStockRows.length,
      detail: `可见仓库低库存阈值为 ${operationalRules.materialLowStockThreshold}。`,
    },
  ];
  const warehouseStatusCards = visibleWarehouses.map((warehouse) => {
    const rows = tableData.map((row) => row.warehouseStock?.[warehouse.region]).filter(Boolean);
    const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
    const lowCount = tableData.filter((row) => {
      const stock = row.warehouseStock?.[warehouse.region];
      return stock && Number(stock.qty || 0) <= Number(stock.safety_stock || 0);
    }).length;
    const requestCount = materialRequests.filter((request) => (request.region || request.warehouse) === warehouse.region || request.warehouse === WAREHOUSE_LABELS[warehouse.region]).length;
    return { ...warehouse, totalQty, lowCount, requestCount };
  });

  const columns = [
    {
      title: '图片',
      dataIndex: 'image_url',
      key: 'image',
      width: 70,
      render: (url) => url
        ? <Image src={url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} />
        : <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 10 }}>N/A</div>,
    },
    { title: '物料', dataIndex: ['materials', 'name'], key: 'name' },
    { title: '编码', dataIndex: ['materials', 'sku'], key: 'sku' },
    { title: '单位', dataIndex: ['materials', 'unit'], key: 'unit' },
    ...visibleWarehouses.map((warehouse) => ({
      title: WAREHOUSE_LABELS[warehouse.region],
      key: warehouse.region,
      render: (_, row) => {
        const stock = row.warehouseStock?.[warehouse.region] || { qty: row.qty || 0, safety_stock: row.safety_stock || 0 };
        const low = stock.safety_stock > 0 && stock.qty <= stock.safety_stock;
        return <Tag className="material-stock-tag" color={low ? 'orange' : 'green'}>{stock.qty} / {stock.safety_stock}</Tag>;
      },
    })),
    {
      title: '可见库存',
      dataIndex: 'visibleTotalStock',
      key: 'visibleTotalStock',
      sorter: (a, b) => (a.visibleTotalStock || a.qty || 0) - (b.visibleTotalStock || b.qty || 0),
      render: (value, row) => <span style={{ fontWeight: 600 }}>{value ?? row.qty ?? 0}</span>,
    },
    {
      title: '低库存仓库',
      key: 'threshold',
      render: (_, row) => {
        const visibleLowRegions = getVisibleLowRegions(row);
        return (
          <span className="material-stock-risk-tags">
            {visibleLowRegions.length
              ? visibleLowRegions.map((item) => <Tag key={item.region} color="orange">{WAREHOUSE_LABELS[item.region]}</Tag>)
              : <Tag color="green">Normal</Tag>}
          </span>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (_, row) => {
        const total = row.visibleTotalStock ?? row.qty ?? 0;
        if (total === 0) return <Tag color="red">Out of Stock</Tag>;
        if (hasVisibleLowStock(row)) return <Tag color="orange">Low Stock</Tag>;
        return <Tag color="green">Normal</Tag>;
      },
    },
  ];

  return (
    <PageTransition>
      <div className="bg-radial-top material-warehouse-page" style={{ minHeight: '100vh', padding: 24 }}>
        <Card className="liquid-glass material-warehouse-table-card" title="库存看板">
          <section className="material-warehouse-command-strip">
            <div>
              <span className="admin-mini-label">区域仓库指挥台</span>
              <h2>按仓库查看物料、申请风险和角色范围</h2>
              <p>Riyadh、Dammam、Jeddah 库存分仓管理。申请审核边界：Manager 审核分配区域申请，Field Rep 仅查看分配区域库存。</p>
            </div>
            <div className="material-warehouse-summary-grid">
              {materialWarehouseCommand.map((item) => (
                <Card size="small" className="material-command-card material-warehouse-summary-card" key={item.label}>
                  <Statistic title={item.label} value={item.value} />
                  <p>{item.detail}</p>
                </Card>
              ))}
            </div>
          </section>
          <div className="material-warehouse-card-grid">
            {warehouseStatusCards.map((warehouse) => (
              <article key={warehouse.region} className="material-warehouse-card">
                <Space wrap size={6}>
                  <Tag color={warehouse.lowCount ? 'orange' : 'green'}>{WAREHOUSE_LABELS[warehouse.region]}</Tag>
                  <strong>{warehouse.totalQty} 可见件数</strong>
                </Space>
                <p>{warehouse.lowCount} 个低库存物料 · {warehouse.requestCount} 个关联门店申请</p>
              </article>
            ))}
          </div>
          <div className="material-warehouse-note">
            Riyadh、Dammam、Jeddah 仓库独立追踪。Field Rep 只查看分配区域库存，Admin 可查看全部仓库。可见仓库低库存阈值：{operationalRules.materialLowStockThreshold}。
          </div>
          {isLoading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> :
          !tableData.length ? <Empty description="暂无库存数据" /> :
          <Table rowKey={(row) => row.id || row.material_id} dataSource={tableData} columns={columns} scroll={{ x: 980 }} pagination={{ pageSize: 15, showTotal: (total) => `共 ${total} 项` }} rowClassName={(row) => hasVisibleLowStock(row) ? 'low-stock-row' : ''} />}
        </Card>
      </div>
    </PageTransition>
  );
};

export default MaterialStocksPage;
