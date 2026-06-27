// ============================================================
// 本地数据引擎 — 基于 localStorage 的轻量数据库
// 无需任何云服务配置，打开浏览器即用
// ============================================================

const DB_PREFIX = 'store_manager_db_';
const VERSION_KEY = 'store_manager_version';
const CURRENT_VERSION = '5.1';

// 表结构定义
const TABLE_NAMES = [
  'profiles',
  'stores',
  'visits',
  'visit_sales',
  'visit_photos',
  'products',
  'fans',
  'fan_points_log',
  'fan_points_rules',
  'fan_level_rules',
  'materials',
  'material_stocks',
  'material_inbound',
  'material_outbound',
  'store_evaluations',
  'campaigns',
  'campaign_tasks',
  'campaign_reports',
  'qr_codes',
  'scan_records',
  'fan_checkins',
  'lottery_records',
  'mall_redemptions',
  'community_posts',
  'community_comments',
  'store_tasks',
  'scan_records',
];

// 生成 UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 从 localStorage 读取表数据
function loadTable(name) {
  const raw = localStorage.getItem(DB_PREFIX + name);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

// 保存表数据到 localStorage
function saveTable(name, data) {
  localStorage.setItem(DB_PREFIX + name, JSON.stringify(data));
}

// 检查是否需要初始化/重置
function checkVersion() {
  const version = localStorage.getItem(VERSION_KEY);
  if (version !== CURRENT_VERSION) {
    return true; // 需要初始化
  }
  return false;
}

// 初始化种子数据
function initSeedData(seedData) {
  TABLE_NAMES.forEach((name) => {
    saveTable(name, seedData[name] || []);
  });
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
}

// ============ 通用 CRUD 操作 ============

const db = {
  uuid,
  needsInit: checkVersion,
  init: initSeedData,
  reset: (seedData) => initSeedData(seedData),

  // 查询全表
  all(table) {
    return loadTable(table);
  },

  // 按 ID 查找
  findById(table, id) {
    return loadTable(table).find((r) => r.id === id);
  },

  // 条件查询
  find(table, predicate) {
    return loadTable(table).filter(predicate);
  },

  // 插入
  insert(table, record) {
    const data = loadTable(table);
    const newRecord = {
      id: record.id || uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record,
    };
    data.push(newRecord);
    saveTable(table, data);
    return newRecord;
  },

  // 批量插入
  insertBatch(table, records) {
    const data = loadTable(table);
    const newRecords = records.map((r) => ({
      id: r.id || uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...r,
    }));
    saveTable(table, [...data, ...newRecords]);
    return newRecords;
  },

  // 更新
  update(table, id, patch) {
    const data = loadTable(table);
    const idx = data.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...patch, updated_at: new Date().toISOString() };
    saveTable(table, data);
    return data[idx];
  },

  // 删除
  remove(table, id) {
    const data = loadTable(table);
    const filtered = data.filter((r) => r.id !== id);
    saveTable(table, filtered);
  },

  // Upsert（按指定字段判断冲突）
  upsert(table, record, conflictKey) {
    const data = loadTable(table);
    const idx = data.findIndex(
      (r) => r[conflictKey] === record[conflictKey]
    );
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...record, updated_at: new Date().toISOString() };
      saveTable(table, data);
      return data[idx];
    }
    return this.insert(table, record);
  },

  // 计数
  count(table) {
    return loadTable(table).length;
  },
};

export default db;

