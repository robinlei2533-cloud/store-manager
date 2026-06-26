// ============================================================
// 统一 API 层 — 自动判断本地模式 or Supabase 模式
// 无 Supabase 配置时，自动使用 localStorage 本地数据库
// ============================================================

import { supabase } from './supabase';
import localDb from './db/localDb';
import seedData from './db/seedData';

// 判断是否使用本地模式
const USE_LOCAL = !import.meta.env.VITE_SUPABASE_URL;

// 确保本地数据库已初始化
function ensureLocalInit() {
  if (USE_LOCAL && localDb.needsInit()) {
    localDb.init(seedData);
  }
}

// ============ 辅助：本地模式关联查询 ============
function enrichVisit(visit) {
  const store = localDb.findById('stores', visit.store_id);
  const rep = localDb.findById('profiles', visit.rep_id);
  return {
    ...visit,
    stores: store ? { name: store.name } : null,
    profiles: rep ? { name: rep.name } : null,
  };
}

function enrichFan(fan) {
  const store = localDb.findById('stores', fan.store_id);
  const profile = fan.user_id ? localDb.findById('profiles', fan.user_id) : null;
  return {
    ...fan,
    stores: store ? { name: store.name } : null,
    profiles: profile ? { name: profile.name } : null,
  };
}

function enrichMaterialStock(stock) {
  const material = localDb.findById('materials', stock.material_id);
  return {
    ...stock,
    materials: material ? { name: material.name, sku: material.sku, unit: material.unit, unit_cost: material.unit_cost } : null,
  };
}

// ============ 门店 ============

export async function getStores(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('stores');
    if (filters.level) data = data.filter((s) => s.level === filters.level);
    if (filters.chain_id) data = data.filter((s) => s.chain_id === filters.chain_id);
    if (filters.search) data = data.filter((s) => s.name.includes(filters.search));
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  let query = supabase.from('stores').select('*');
  if (filters.level) query = query.eq('level', filters.level);
  if (filters.chain_id) query = query.eq('chain_id', filters.chain_id);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getStoreById(id) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.findById('stores', id);
  const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createStore(store) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('stores', store);
  const { data, error } = await supabase.from('stores').insert(store).select().single();
  if (error) throw error;
  return data;
}

export async function updateStore(id, store) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('stores', id, store);
  const { data, error } = await supabase.from('stores').update(store).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStore(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('stores', id); return; }
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) throw error;
}

// ============ 拜访 ============

export async function getVisits(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('visits');
    if (filters.store_id) data = data.filter((v) => v.store_id === filters.store_id);
    if (filters.rep_id) data = data.filter((v) => v.rep_id === filters.rep_id);
    if (filters.status) data = data.filter((v) => v.status === filters.status);
    if (filters.date_from) data = data.filter((v) => v.visit_date >= filters.date_from);
    if (filters.date_to) data = data.filter((v) => v.visit_date <= filters.date_to);
    data = data.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
    return data.map(enrichVisit);
  }

  let query = supabase.from('visits').select('*, stores(name), profiles!visits_rep_id_fkey(name)');
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  if (filters.rep_id) query = query.eq('rep_id', filters.rep_id);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.date_from) query = query.gte('visit_date', filters.date_from);
  if (filters.date_to) query = query.lte('visit_date', filters.date_to);
  const { data, error } = await query.order('visit_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getVisitById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const visit = localDb.findById('visits', id);
    if (!visit) return null;
    return enrichVisit(visit);
  }
  const { data, error } = await supabase.from('visits').select('*, stores(*), profiles!visits_rep_id_fkey(name)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createVisit(visit) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('visits', visit);
  const { data, error } = await supabase.from('visits').insert(visit).select().single();
  if (error) throw error;
  return data;
}

export async function updateVisit(id, visit) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('visits', id, visit);
  const { data, error } = await supabase.from('visits').update(visit).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============ 动销数据 ============

export async function getVisitSales(visitId) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const data = localDb.find('visit_sales', (s) => s.visit_id === visitId);
    return data.map((s) => ({
      ...s,
      products: localDb.findById('products', s.product_id),
    }));
  }
  const { data, error } = await supabase.from('visit_sales').select('*, products(name, sku, unit_price)').eq('visit_id', visitId);
  if (error) throw error;
  return data;
}

export async function upsertVisitSales(salesData) {
  ensureLocalInit();
  if (USE_LOCAL) {
    return salesData.map((s) => localDb.upsert('visit_sales', s, 'visit_id_product_id'));
  }
  const { data, error } = await supabase.from('visit_sales').upsert(salesData, { onConflict: 'visit_id,product_id' }).select();
  if (error) throw error;
  return data;
}

// ============ 拜访照片 ============

export async function getVisitPhotos(visitId) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.find('visit_photos', (p) => p.visit_id === visitId);
  const { data, error } = await supabase.from('visit_photos').select('*').eq('visit_id', visitId);
  if (error) throw error;
  return data;
}

export async function uploadVisitPhoto(visitId, file, photoType) {
  ensureLocalInit();

  if (USE_LOCAL) {
    // 本地模式：用 FileReader 转 base64 存储或用 URL.createObjectURL
    const photoUrl = URL.createObjectURL(file);
    return localDb.insert('visit_photos', {
      visit_id: visitId,
      photo_type: photoType,
      photo_url: photoUrl,
    });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${visitId}/${Date.now()}_${photoType}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('visit-photos').upload(fileName, file);
  if (uploadError) throw uploadError;
  const { data: publicUrl } = supabase.storage.from('visit-photos').getPublicUrl(fileName);
  const { data, error } = await supabase.from('visit_photos').insert({ visit_id: visitId, photo_type: photoType, photo_url: publicUrl.publicUrl }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteVisitPhoto(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('visit_photos', id); return; }
  const { error } = await supabase.from('visit_photos').delete().eq('id', id);
  if (error) throw error;
}

// ============ 产品 ============

export async function getProducts() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('products').sort((a, b) => a.name.localeCompare(b.name));
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('products', product);
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, product) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('products', id, product);
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('products', id); return; }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ============ 物料 ============

export async function getMaterials() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('materials').sort((a, b) => a.name.localeCompare(b.name));
  const { data, error } = await supabase.from('materials').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createMaterial(material) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const m = localDb.insert('materials', material);
    localDb.insert('material_stocks', { material_id: m.id, warehouse: '默认仓库', qty: 0, safety_stock: 10 });
    return m;
  }
  const { data, error } = await supabase.from('materials').insert(material).select().single();
  if (error) throw error;
  return data;
}

export async function updateMaterial(id, material) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('materials', id, material);
  const { data, error } = await supabase.from('materials').update(material).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('materials', id); return; }
  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) throw error;
}

export async function getMaterialStocks() {
  ensureLocalInit();
  if (USE_LOCAL) {
    const data = localDb.all('material_stocks');
    return data.map(enrichMaterialStock).sort((a, b) => a.qty - b.qty);
  }
  const { data, error } = await supabase.from('material_stocks').select('*, materials(name, sku, unit, unit_cost)').order('qty', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateMaterialStock(materialId, qty, safetyStock) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const stocks = localDb.find('material_stocks', (s) => s.material_id === materialId);
    if (stocks.length > 0) {
      return localDb.update('material_stocks', stocks[0].id, { qty, safety_stock: safetyStock });
    } else {
      return localDb.insert('material_stocks', { material_id: materialId, warehouse: 'Default', qty, safety_stock: safetyStock });
    }
  }
  const { data, error } = await supabase
    .from('material_stocks')
    .update({ qty, safety_stock: safetyStock })
    .eq('material_id', materialId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createInbound(record) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const inbound = localDb.insert('material_inbound', record);
    // 自动增加库存
    const stocks = localDb.find('material_stocks', (s) => s.material_id === record.material_id);
    if (stocks.length > 0) {
      localDb.update('material_stocks', stocks[0].id, { qty: stocks[0].qty + record.qty });
    } else {
      localDb.insert('material_stocks', { material_id: record.material_id, warehouse: '默认仓库', qty: record.qty, safety_stock: 10 });
    }
    return inbound;
  }
  const { data, error } = await supabase.from('material_inbound').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function getInbounds(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('material_inbound');
    if (filters.material_id) data = data.filter((r) => r.material_id === filters.material_id);
    return data.map((r) => ({
      ...r,
      materials: localDb.findById('materials', r.material_id),
      profiles: localDb.findById('profiles', r.operator_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  let query = supabase.from('material_inbound').select('*, materials(name, sku, unit), profiles!material_inbound_operator_id_fkey(name)');
  if (filters.material_id) query = query.eq('material_id', filters.material_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createOutbound(record) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('material_outbound', record);
  const { data, error } = await supabase.from('material_outbound').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function getOutbounds(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('material_outbound');
    if (filters.status) data = data.filter((r) => r.status === filters.status);
    if (filters.store_id) data = data.filter((r) => r.store_id === filters.store_id);
    return data.map((r) => ({
      ...r,
      materials: localDb.findById('materials', r.material_id),
      profiles: localDb.findById('profiles', r.applicant_id),
      stores: localDb.findById('stores', r.store_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  let query = supabase.from('material_outbound').select('*, materials(name, sku, unit), profiles!material_outbound_applicant_id_fkey(name), stores(name)');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateOutboundStatus(id, status) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const record = localDb.findById('material_outbound', id);
    // 审批通过时扣减库存
    if (status === 'approved' && record.status === 'pending') {
      const stocks = localDb.find('material_stocks', (s) => s.material_id === record.material_id);
      if (stocks.length > 0) {
        localDb.update('material_stocks', stocks[0].id, { qty: Math.max(0, stocks[0].qty - record.qty) });
      }
    }
    return localDb.update('material_outbound', id, { status });
  }
  const { data, error } = await supabase.from('material_outbound').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============ 粉丝 ============

export async function getFans(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('fans');
    if (filters.level) data = data.filter((f) => f.level === filters.level);
    if (filters.store_id) data = data.filter((f) => f.store_id === filters.store_id);
    return data.map(enrichFan).sort((a, b) => b.points - a.points);
  }
  let query = supabase.from('fans').select('*, stores(name), profiles!fans_user_id_fkey(name)').order('points', { ascending: false });
  if (filters.level) query = query.eq('level', filters.level);
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getFanById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const fan = localDb.findById('fans', id);
    if (!fan) return null;
    return enrichFan(fan);
  }
  const { data, error } = await supabase.from('fans').select('*, stores(*), profiles!fans_user_id_fkey(name)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getFanPointsLog(fanId) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.find('fan_points_log', (l) => l.fan_id === fanId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const { data, error } = await supabase.from('fan_points_log').select('*').eq('fan_id', fanId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addFanPoints(fanId, points, type, source, description) {
  ensureLocalInit();
  if (USE_LOCAL) {
    localDb.insert('fan_points_log', { fan_id: fanId, points, type, source, description });
    const fan = localDb.findById('fans', fanId);
    if (fan) {
      const newPoints = fan.points + points;
      // 自动升级
      const rules = localDb.all('fan_level_rules').sort((a, b) => b.min_points - a.min_points);
      const newLevel = rules.find((r) => newPoints >= r.min_points);
      localDb.update('fans', fanId, {
        points: newPoints,
        total_contribution: fan.total_contribution + (type === 'earn' ? points : 0),
        level: newLevel ? newLevel.level : fan.level,
      });
    }
    return localDb.findById('fans', fanId);
  }
  const { data, error } = await supabase.from('fan_points_log').insert({ fan_id: fanId, points, type, source, description }).select().single();
  if (error) throw error;
  return data;
}

// ============ 积分规则 ============

export async function getPointsRules() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('fan_points_rules').sort((a, b) => b.points - a.points);
  const { data, error } = await supabase.from('fan_points_rules').select('*').order('points', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPointsRule(rule) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('fan_points_rules', rule);
  const { data, error } = await supabase.from('fan_points_rules').insert(rule).select().single();
  if (error) throw error;
  return data;
}

export async function updatePointsRule(id, rule) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('fan_points_rules', id, rule);
  const { data, error } = await supabase.from('fan_points_rules').update(rule).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePointsRule(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('fan_points_rules', id); return; }
  const { error } = await supabase.from('fan_points_rules').delete().eq('id', id);
  if (error) throw error;
}

export async function getLevelRules() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('fan_level_rules').sort((a, b) => a.min_points - b.min_points);
  const { data, error } = await supabase.from('fan_level_rules').select('*').order('min_points', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateLevelRule(id, rule) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('fan_level_rules', id, rule);
  const { data, error } = await supabase.from('fan_level_rules').update(rule).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============ 店铺评估 ============

export async function getEvaluations(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('store_evaluations');
    if (filters.store_id) data = data.filter((e) => e.store_id === filters.store_id);
    if (filters.level) data = data.filter((e) => e.recommended_level === filters.level);
    return data.map((e) => ({
      ...e,
      stores: localDb.findById('stores', e.store_id),
      evaluator: localDb.findById('profiles', e.evaluator_id),
    })).sort((a, b) => new Date(b.eval_date) - new Date(a.eval_date));
  }
  let query = supabase.from('store_evaluations').select('*, stores(name, level), profiles!store_evaluations_evaluator_id_fkey(name)');
  if (filters.store_id) query = query.eq('store_id', filters.store_id);
  const { data, error } = await query.order('eval_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEvaluationById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const evalRecord = localDb.findById('store_evaluations', id);
    if (!evalRecord) return null;
    return {
      ...evalRecord,
      stores: localDb.findById('stores', evalRecord.store_id),
      evaluator: localDb.findById('profiles', evalRecord.evaluator_id),
    };
  }
  const { data, error } = await supabase.from('store_evaluations').select('*, stores(*), profiles!store_evaluations_evaluator_id_fkey(name)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createEvaluation(evalData) {
  ensureLocalInit();
  // 计算总分和推荐等级
  const total = evalData.score_sales + evalData.score_display + evalData.score_location +
    evalData.score_cooperation + evalData.score_expansion + evalData.score_appearance;
  const avg = total / 6;
  let level = 'C';
  if (avg >= 8) level = 'A';
  else if (avg >= 6) level = 'B';

  const record = { ...evalData, total_score: total, recommended_level: level };

  if (USE_LOCAL) {
    const result = localDb.insert('store_evaluations', record);
    // 同步更新门店等级
    localDb.update('stores', evalData.store_id, { level });
    return result;
  }
  const { data, error } = await supabase.from('store_evaluations').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvaluation(id, evalData) {
  ensureLocalInit();
  const total = evalData.score_sales + evalData.score_display + evalData.score_location +
    evalData.score_cooperation + evalData.score_expansion + evalData.score_appearance;
  const avg = total / 6;
  let level = 'C';
  if (avg >= 8) level = 'A';
  else if (avg >= 6) level = 'B';
  const record = { ...evalData, total_score: total, recommended_level: level };

  if (USE_LOCAL) {
    const result = localDb.update('store_evaluations', id, record);
    localDb.update('stores', evalData.store_id, { level });
    return result;
  }
  const { data, error } = await supabase.from('store_evaluations').update(record).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvaluation(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('store_evaluations', id); return; }
  const { error } = await supabase.from('store_evaluations').delete().eq('id', id);
  if (error) throw error;
}

// ============ 活动管理 ============

export async function getCampaigns(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('campaigns');
    if (filters.status) data = data.filter((c) => c.status === filters.status);
    if (filters.type) data = data.filter((c) => c.type === filters.type);
    return data.map((c) => ({
      ...c,
      store_count: c.target_stores?.length || 0,
      tasks: localDb.find('campaign_tasks', (t) => t.campaign_id === c.id),
      report: localDb.find('campaign_reports', (r) => r.campaign_id === c.id)[0] || null,
    })).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }
  let query = supabase.from('campaigns').select('*');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.type) query = query.eq('type', filters.type);
  const { data, error } = await query.order('start_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCampaignById(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const campaign = localDb.findById('campaigns', id);
    if (!campaign) return null;
    return {
      ...campaign,
      tasks: localDb.find('campaign_tasks', (t) => t.campaign_id === id),
      report: localDb.find('campaign_reports', (r) => r.campaign_id === id)[0] || null,
      target_store_details: (campaign.target_stores || []).map((sid) => localDb.findById('stores', sid)).filter(Boolean),
    };
  }
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createCampaign(campaign) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('campaigns', campaign);
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(id, campaign) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('campaigns', id, campaign);
  const { data, error } = await supabase.from('campaigns').update(campaign).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCampaign(id) {
  ensureLocalInit();
  if (USE_LOCAL) {
    localDb.remove('campaigns', id);
    localDb.find('campaign_tasks', (t) => t.campaign_id === id).forEach((t) => localDb.remove('campaign_tasks', t.id));
    localDb.find('campaign_reports', (r) => r.campaign_id === id).forEach((r) => localDb.remove('campaign_reports', r.id));
    return;
  }
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw error;
}

export async function createCampaignTask(task) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('campaign_tasks', task);
  const { data, error } = await supabase.from('campaign_tasks').insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaignTask(id, task) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('campaign_tasks', id, task);
  const { data, error } = await supabase.from('campaign_tasks').update(task).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCampaignTask(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('campaign_tasks', id); return; }
  const { error } = await supabase.from('campaign_tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function createCampaignReport(report) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('campaign_reports', report);
  const { data, error } = await supabase.from('campaign_reports').insert(report).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaignReport(id, report) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('campaign_reports', id, report);
  const { data, error } = await supabase.from('campaign_reports').update(report).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============ 扫码积分 ============

export async function getQrCodes(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('qr_codes');
    if (filters.product_id) data = data.filter((q) => q.product_id === filters.product_id);
    if (filters.store_id) data = data.filter((q) => q.store_id === filters.store_id);
    return data.map((q) => ({
      ...q,
      products: localDb.findById('products', q.product_id),
      stores: localDb.findById('stores', q.store_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  const { data, error } = await supabase.from('qr_codes').select('*, products(name, sku), stores(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createQrCode(qrData) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.insert('qr_codes', { ...qrData, scan_count: 0, is_active: true });
  const { data, error } = await supabase.from('qr_codes').insert(qrData).select().single();
  if (error) throw error;
  return data;
}

export async function updateQrCode(id, qrData) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('qr_codes', id, qrData);
  const { data, error } = await supabase.from('qr_codes').update(qrData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteQrCode(id) {
  ensureLocalInit();
  if (USE_LOCAL) { localDb.remove('qr_codes', id); return; }
  const { error } = await supabase.from('qr_codes').delete().eq('id', id);
  if (error) throw error;
}

export async function scanQrCode(qrCodeId) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const qr = localDb.findById('qr_codes', qrCodeId);
    if (!qr || !qr.is_active) throw new Error('二维码无效或已停用');

    // 获取门店对应的粉丝
    const fan = localDb.find('fans', (f) => f.store_id === qr.store_id)[0];
    if (!fan) throw new Error('该门店暂无粉丝账户');

    // 增加扫码次数
    localDb.update('qr_codes', qrCodeId, { scan_count: qr.scan_count + 1 });

    // 记录扫码
    localDb.insert('scan_records', {
      qr_code_id: qrCodeId,
      fan_id: fan.id,
      product_id: qr.product_id,
      store_id: qr.store_id,
      points_earned: qr.points,
    });

    // 增加积分
    const result = await addFanPoints(fan.id, qr.points, 'earn', '扫码积分', `消费者扫码 ${qr.code}`);

    return { success: true, points: qr.points, fan: result, product: localDb.findById('products', qr.product_id) };
  }
  // Supabase 模式通过 RPC 调用
  const { data, error } = await supabase.rpc('scan_qr_code', { qr_id: qrCodeId });
  if (error) throw error;
  return data;
}

export async function getScanRecords(filters = {}) {
  ensureLocalInit();
  if (USE_LOCAL) {
    let data = localDb.all('scan_records');
    if (filters.store_id) data = data.filter((r) => r.store_id === filters.store_id);
    if (filters.fan_id) data = data.filter((r) => r.fan_id === filters.fan_id);
    return data.map((r) => ({
      ...r,
      products: localDb.findById('products', r.product_id),
      stores: localDb.findById('stores', r.store_id),
      fans: localDb.findById('fans', r.fan_id),
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  const { data, error } = await supabase.from('scan_records').select('*, products(name), stores(name), fans(level, points)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ============ 用户 ============

export async function getProfiles() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('profiles').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateProfile(id, profile) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('profiles', id, profile);
  const { data, error } = await supabase.from('profiles').update(profile).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============ 数据看盘 ============

export async function getDashboardStats() {
  ensureLocalInit();
  if (USE_LOCAL) {
    const stores = localDb.all('stores');
    const visits = localDb.all('visits');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayVisits = visits.filter((v) => v.visit_date === todayStr);
    const fans = localDb.all('fans');
    const stocks = localDb.all('material_stocks');
    const lowStock = stocks.filter((s) => s.qty <= s.safety_stock);
    const campaigns = localDb.all('campaigns');
    const ongoingCampaigns = campaigns.filter((c) => c.status === 'ongoing');
    const scans = localDb.all('scan_records');

    return {
      storeCount: stores.length,
      visitCount: visits.length,
      todayVisits: todayVisits.length,
      fanCount: fans.length,
      materialCount: localDb.all('materials').length,
      lowStockCount: lowStock.length,
      campaignCount: campaigns.length,
      ongoingCampaignCount: ongoingCampaigns.length,
      scanCount: scans.length,
    };
  }

  const [storeCount, visitCount, todayVisits, fanCount, materialCount, lowStockCount] = await Promise.all([
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visit_date', new Date().toISOString().split('T')[0]),
    supabase.from('fans').select('*', { count: 'exact', head: true }),
    supabase.from('materials').select('*', { count: 'exact', head: true }),
    supabase.rpc('get_low_stock_count'),
  ]);
  return {
    storeCount: storeCount.count || 0,
    visitCount: visitCount.count || 0,
    todayVisits: todayVisits.count || 0,
    fanCount: fanCount.count || 0,
    materialCount: materialCount.count || 0,
    lowStockCount: lowStockCount.data || 0,
  };
}

export async function getVisitTrend(days = 30) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const visits = localDb.all('visits');
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = visits.filter((v) => v.visit_date === dateStr).length;
      if (count > 0) result.push({ visit_date: dateStr, count });
    }
    return result;
  }
  const { data, error } = await supabase.rpc('get_visit_trend', { days_count: days });
  if (error) throw error;
  return data;
}

export async function getStoreDistribution() {
  ensureLocalInit();
  if (USE_LOCAL) {
    return localDb.all('stores').map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, level: s.level }));
  }
  const { data, error } = await supabase.from('stores').select('id, name, lat, lng, level');
  if (error) throw error;
  return data;
}

export async function getScanTrend(days = 30) {
  ensureLocalInit();
  if (USE_LOCAL) {
    const scans = localDb.all('scan_records');
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = scans.filter((s) => s.created_at.startsWith(dateStr)).length;
      if (count > 0) result.push({ date: dateStr, count });
    }
    return result;
  }
  return [];
}

// 导出模式判断
export const IS_LOCAL_MODE = USE_LOCAL;
