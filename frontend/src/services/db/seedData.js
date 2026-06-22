// ============================================================
// 种子数据 — 让用户打开就能看到完整功能
// ============================================================

const now = new Date();
const daysAgo = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const dateAgo = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export const seedData = {
  // ============ 用户档案 ============
  profiles: [
    { id: 'u-admin', role: 'admin', name: '系统管理员', phone: '13800000001', avatar: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'u-manager', role: 'manager', name: '张经理', phone: '13800000002', avatar: '', created_at: daysAgo(80), updated_at: daysAgo(80) },
    { id: 'u-rep1', role: 'rep', name: '李业务', phone: '13800000003', avatar: '', created_at: daysAgo(70), updated_at: daysAgo(70) },
    { id: 'u-rep2', role: 'rep', name: '王业务', phone: '13800000004', avatar: '', created_at: daysAgo(65), updated_at: daysAgo(65) },
    { id: 'u-rep3', role: 'rep', name: '赵业务', phone: '13800000005', avatar: '', created_at: daysAgo(60), updated_at: daysAgo(60) },
  ],

  // ============ 产品库 ============
  products: [
    { id: 'p-001', name: '经典可乐 330ml', sku: 'BEV-COLA-330', category: '饮料', unit_price: 3.0, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-002', name: '橙汁饮料 500ml', sku: 'BEV-ORANGE-500', category: '饮料', unit_price: 5.5, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-003', name: '原味薯片 75g', sku: 'SNACK-CHIPS-75', category: '零食', unit_price: 6.0, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-004', name: '巧克力棒 40g', sku: 'SNACK-CHOC-40', category: '零食', unit_price: 4.5, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-005', name: '矿泉水 550ml', sku: 'BEV-WATER-550', category: '饮料', unit_price: 2.0, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-006', name: '方便面 红烧牛肉', sku: 'FOOD-NOODLE-RED', category: '速食', unit_price: 3.5, created_at: daysAgo(90), updated_at: daysAgo(90) },
  ],

  // ============ 门店 ============
  stores: [
    { id: 's-001', name: '好邻居便利店（朝阳店）', address: '北京市朝阳区建国路88号', lat: 39.9087, lng: 116.3974, level: 'A', chain_name: '好邻居', chain_id: 'c-001', chain_store_count: 120, contact: '刘老板', phone: '13901110001', created_at: daysAgo(80), updated_at: daysAgo(10) },
    { id: 's-002', name: '全家便利店（海淀店）', address: '北京市海淀区中关村大街1号', lat: 39.9847, lng: 116.3075, level: 'A', chain_name: '全家', chain_id: 'c-002', chain_store_count: 2500, contact: '陈老板', phone: '13901110002', created_at: daysAgo(75), updated_at: daysAgo(8) },
    { id: 's-003', name: '美宜佳（西城店）', address: '北京市西城区西单北大街', lat: 39.9135, lng: 116.3722, level: 'B', chain_name: '美宜佳', chain_id: 'c-003', chain_store_count: 8000, contact: '周老板', phone: '13901110003', created_at: daysAgo(70), updated_at: daysAgo(5) },
    { id: 's-004', name: '天天便利（东城店）', address: '北京市东城区王府井大街', lat: 39.9143, lng: 116.4119, level: 'B', chain_name: '天天便利', chain_id: 'c-004', chain_store_count: 350, contact: '吴老板', phone: '13901110004', created_at: daysAgo(60), updated_at: daysAgo(3) },
    { id: 's-005', name: '小卖部（丰台店）', address: '北京市丰台区南三环西路', lat: 39.8650, lng: 116.2867, level: 'C', chain_name: '独立门店', chain_id: null, chain_store_count: 1, contact: '孙老板', phone: '13901110005', created_at: daysAgo(50), updated_at: daysAgo(50) },
    { id: 's-006', name: '好邻居便利店（通州店）', address: '北京市通州区新华大街', lat: 39.9087, lng: 116.6569, level: 'B', chain_name: '好邻居', chain_id: 'c-001', chain_store_count: 120, contact: '钱老板', phone: '13901110006', created_at: daysAgo(40), updated_at: daysAgo(2) },
    { id: 's-007', name: '全家便利店（望京店）', address: '北京市朝阳区望京SOHO', lat: 39.9942, lng: 116.4716, level: 'A', chain_name: '全家', chain_id: 'c-002', chain_store_count: 2500, contact: '马老板', phone: '13901110007', created_at: daysAgo(30), updated_at: daysAgo(1) },
    { id: 's-008', name: '社区超市（大兴店）', address: '北京市大兴区兴华大街', lat: 39.7268, lng: 116.3417, level: 'C', chain_name: '独立门店', chain_id: null, chain_store_count: 1, contact: '胡老板', phone: '13901110008', created_at: daysAgo(20), updated_at: daysAgo(20) },
  ],

  // ============ 拜访记录 ============
  visits: [
    { id: 'v-001', store_id: 's-001', rep_id: 'u-rep1', visit_date: dateAgo(1), status: 'completed', notes: '门店陈列整齐，补货及时，建议增加促销陈列', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { id: 'v-002', store_id: 's-002', rep_id: 'u-rep2', visit_date: dateAgo(1), status: 'completed', notes: '新品上架情况良好，客流高峰期排队较多', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { id: 'v-003', store_id: 's-003', rep_id: 'u-rep1', visit_date: dateAgo(2), status: 'completed', notes: '部分产品临期，建议尽快促销处理', created_at: daysAgo(2), updated_at: daysAgo(2) },
    { id: 'v-004', store_id: 's-004', rep_id: 'u-rep3', visit_date: dateAgo(2), status: 'completed', notes: '老板反馈竞品促销力度大，建议跟进', created_at: daysAgo(2), updated_at: daysAgo(2) },
    { id: 'v-005', store_id: 's-005', rep_id: 'u-rep2', visit_date: dateAgo(3), status: 'completed', notes: '门店面积小，建议精简SKU聚焦畅销品', created_at: daysAgo(3), updated_at: daysAgo(3) },
    { id: 'v-006', store_id: 's-006', rep_id: 'u-rep1', visit_date: dateAgo(4), status: 'completed', notes: '新店开业活动效果不错，客流稳定', created_at: daysAgo(4), updated_at: daysAgo(4) },
    { id: 'v-007', store_id: 's-007', rep_id: 'u-rep3', visit_date: dateAgo(5), status: 'completed', notes: '高端社区客流好，建议增加进口商品', created_at: daysAgo(5), updated_at: daysAgo(5) },
    { id: 'v-008', store_id: 's-001', rep_id: 'u-rep1', visit_date: dateAgo(7), status: 'completed', notes: '常规巡店，库存充足', created_at: daysAgo(7), updated_at: daysAgo(7) },
    { id: 'v-009', store_id: 's-002', rep_id: 'u-rep2', visit_date: dateAgo(8), status: 'completed', notes: '节后补货，动销恢复', created_at: daysAgo(8), updated_at: daysAgo(8) },
    { id: 'v-010', store_id: 's-008', rep_id: 'u-rep3', visit_date: dateAgo(10), status: 'completed', notes: '社区店客流一般，建议做社区团购', created_at: daysAgo(10), updated_at: daysAgo(10) },
    { id: 'v-011', store_id: 's-003', rep_id: 'u-rep1', visit_date: dateAgo(12), status: 'cancelled', notes: '门店装修中，未营业', created_at: daysAgo(12), updated_at: daysAgo(12) },
    { id: 'v-012', store_id: 's-004', rep_id: 'u-rep3', visit_date: dateAgo(15), status: 'completed', notes: '竞品分析：对面新开一家便利店', created_at: daysAgo(15), updated_at: daysAgo(15) },
    { id: 'v-013', store_id: 's-006', rep_id: 'u-rep1', visit_date: dateAgo(0), status: 'draft', notes: '今日计划拜访', created_at: daysAgo(0), updated_at: daysAgo(0) },
  ],

  // ============ 动销数据 ============
  visit_sales: [
    { id: 'vs-001', visit_id: 'v-001', product_id: 'p-001', sales_qty: 48, sales_amount: 144, stock_qty: 120, created_at: daysAgo(1) },
    { id: 'vs-002', visit_id: 'v-001', product_id: 'p-002', sales_qty: 30, sales_amount: 165, stock_qty: 50, created_at: daysAgo(1) },
    { id: 'vs-003', visit_id: 'v-001', product_id: 'p-005', sales_qty: 60, sales_amount: 120, stock_qty: 200, created_at: daysAgo(1) },
    { id: 'vs-004', visit_id: 'v-002', product_id: 'p-003', sales_qty: 25, sales_amount: 150, stock_qty: 40, created_at: daysAgo(1) },
    { id: 'vs-005', visit_id: 'v-002', product_id: 'p-004', sales_qty: 35, sales_amount: 157.5, stock_qty: 60, created_at: daysAgo(1) },
    { id: 'vs-006', visit_id: 'v-003', product_id: 'p-001', sales_qty: 20, sales_amount: 60, stock_qty: 30, created_at: daysAgo(2) },
    { id: 'vs-007', visit_id: 'v-003', product_id: 'p-006', sales_qty: 40, sales_amount: 140, stock_qty: 80, created_at: daysAgo(2) },
    { id: 'vs-008', visit_id: 'v-004', product_id: 'p-002', sales_qty: 18, sales_amount: 99, stock_qty: 25, created_at: daysAgo(2) },
    { id: 'vs-009', visit_id: 'v-006', product_id: 'p-001', sales_qty: 55, sales_amount: 165, stock_qty: 100, created_at: daysAgo(4) },
    { id: 'vs-010', visit_id: 'v-007', product_id: 'p-005', sales_qty: 80, sales_amount: 160, stock_qty: 150, created_at: daysAgo(5) },
    { id: 'vs-011', visit_id: 'v-007', product_id: 'p-003', sales_qty: 30, sales_amount: 180, stock_qty: 45, created_at: daysAgo(5) },
  ],

  // ============ 拜访照片 ============
  visit_photos: [
    { id: 'vp-001', visit_id: 'v-001', photo_type: 'shelf', photo_url: 'https://images.unsplash.com/photo-1578916171728-297f8394d7b9?w=400', created_at: daysAgo(1) },
    { id: 'vp-002', visit_id: 'v-001', photo_type: 'display', photo_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400', created_at: daysAgo(1) },
    { id: 'vp-003', visit_id: 'v-002', photo_type: 'exterior', photo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', created_at: daysAgo(1) },
    { id: 'vp-004', visit_id: 'v-003', photo_type: 'product', photo_url: 'https://images.unsplash.com/photo-1626202378011-4b0bf3a99fcd?w=400', created_at: daysAgo(2) },
    { id: 'vp-005', visit_id: 'v-006', photo_type: 'shelf', photo_url: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400', created_at: daysAgo(4) },
  ],

  // ============ 粉丝档案 ============
  fans: [
    { id: 'f-001', store_id: 's-001', user_id: 'u-rep1', level: 'gold', points: 580, total_contribution: 580, created_at: daysAgo(70), updated_at: daysAgo(1) },
    { id: 'f-002', store_id: 's-002', user_id: null, level: 'platinum', points: 2300, total_contribution: 2300, created_at: daysAgo(65), updated_at: daysAgo(2) },
    { id: 'f-003', store_id: 's-003', user_id: null, level: 'silver', points: 150, total_contribution: 150, created_at: daysAgo(55), updated_at: daysAgo(5) },
    { id: 'f-004', store_id: 's-004', user_id: null, level: 'gold', points: 520, total_contribution: 520, created_at: daysAgo(45), updated_at: daysAgo(3) },
    { id: 'f-005', store_id: 's-005', user_id: null, level: 'bronze', points: 30, total_contribution: 30, created_at: daysAgo(35), updated_at: daysAgo(10) },
    { id: 'f-006', store_id: 's-006', user_id: null, level: 'silver', points: 120, total_contribution: 120, created_at: daysAgo(25), updated_at: daysAgo(4) },
    { id: 'f-007', store_id: 's-007', user_id: null, level: 'diamond', points: 5200, total_contribution: 5200, created_at: daysAgo(20), updated_at: daysAgo(1) },
    { id: 'f-008', store_id: 's-008', user_id: null, level: 'bronze', points: 15, total_contribution: 15, created_at: daysAgo(15), updated_at: daysAgo(15) },
  ],

  // ============ 积分流水 ============
  fan_points_log: [
    { id: 'fpl-001', fan_id: 'f-001', points: 10, type: 'earn', source: '完成拜访', description: '完成门店拜访 s-001', created_at: daysAgo(1) },
    { id: 'fpl-002', fan_id: 'f-001', points: 5, type: 'earn', source: '上传照片', description: '拜访上传货架照片', created_at: daysAgo(1) },
    { id: 'fpl-003', fan_id: 'f-001', points: 5, type: 'earn', source: '提交动销数据', description: '提交动销数据3条', created_at: daysAgo(1) },
    { id: 'fpl-004', fan_id: 'f-002', points: 10, type: 'earn', source: '完成拜访', description: '完成门店拜访 s-002', created_at: daysAgo(2) },
    { id: 'fpl-005', fan_id: 'f-002', points: 50, type: 'earn', source: '扫码积分', description: '消费者扫码 p-002 x10', created_at: daysAgo(2) },
    { id: 'fpl-006', fan_id: 'f-007', points: 100, type: 'earn', source: '扫码积分', description: '消费者扫码 p-001 x20', created_at: daysAgo(1) },
    { id: 'fpl-007', fan_id: 'f-007', points: 30, type: 'redeem', source: '兑换奖励', description: '兑换精美水杯一个', created_at: daysAgo(3) },
    { id: 'fpl-008', fan_id: 'f-004', points: 10, type: 'earn', source: '完成拜访', description: '完成门店拜访 s-004', created_at: daysAgo(3) },
  ],

  // ============ 积分规则 ============
  fan_points_rules: [
    { id: 'r-001', action_type: '完成拜访', points: 10, description: '每完成一次门店拜访', is_active: true, created_at: daysAgo(90) },
    { id: 'r-002', action_type: '上传照片', points: 5, description: '每次拜访上传产品照片', is_active: true, created_at: daysAgo(90) },
    { id: 'r-003', action_type: '提交动销数据', points: 5, description: '每次提交完整的动销数据', is_active: true, created_at: daysAgo(90) },
    { id: 'r-004', action_type: '新增门店', points: 20, description: '成功录入一个新门店', is_active: true, created_at: daysAgo(90) },
    { id: 'r-005', action_type: '扫码积分', points: 5, description: '消费者每扫一个产品码', is_active: true, created_at: daysAgo(90) },
    { id: 'r-006', action_type: '推荐新粉丝', points: 30, description: '每推荐一位新粉丝注册', is_active: true, created_at: daysAgo(90) },
  ],

  // ============ 等级规则 ============
  fan_level_rules: [
    { id: 'lr-001', level: 'bronze', min_points: 0, benefits: '基础权益', updated_at: daysAgo(90) },
    { id: 'lr-002', level: 'silver', min_points: 100, benefits: '享受95折优惠', updated_at: daysAgo(90) },
    { id: 'lr-003', level: 'gold', min_points: 500, benefits: '享受9折优惠 + 优先配送', updated_at: daysAgo(90) },
    { id: 'lr-004', level: 'platinum', min_points: 2000, benefits: '享受85折优惠 + 优先配送 + 新品试用', updated_at: daysAgo(90) },
    { id: 'lr-005', level: 'diamond', min_points: 5000, benefits: '享受8折优惠 + 优先配送 + 新品试用 + 专属客服', updated_at: daysAgo(90) },
  ],

  // ============ 物料 ============
  materials: [
    { id: 'm-001', name: '宣传海报 A2', sku: 'MT-POSTER-A2', category: '宣传物料', unit: '张', unit_cost: 2.0, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-002', name: '产品展架 双层', sku: 'MT-DISPLAY-2L', category: '陈列物料', unit: '个', unit_cost: 50.0, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-003', name: '试用装小样', sku: 'MT-SAMPLE-01', category: '试用物料', unit: '份', unit_cost: 1.5, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-004', name: '工服马甲 红色', sku: 'MT-VEST-RED', category: '服装物料', unit: '件', unit_cost: 30.0, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-005', name: '价格标签', sku: 'MT-TAG-PRICE', category: '门店物料', unit: '个', unit_cost: 0.5, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-006', name: '促销立牌', sku: 'MT-STAND-PROMO', category: '陈列物料', unit: '个', unit_cost: 15.0, created_at: daysAgo(90), updated_at: daysAgo(90) },
  ],

  // ============ 物料库存 ============
  material_stocks: [
    { id: 'ms-001', material_id: 'm-001', warehouse: '默认仓库', qty: 500, safety_stock: 100, created_at: daysAgo(90), updated_at: daysAgo(5) },
    { id: 'ms-002', material_id: 'm-002', warehouse: '默认仓库', qty: 15, safety_stock: 20, created_at: daysAgo(90), updated_at: daysAgo(8) },
    { id: 'ms-003', material_id: 'm-003', warehouse: '默认仓库', qty: 800, safety_stock: 200, created_at: daysAgo(90), updated_at: daysAgo(3) },
    { id: 'ms-004', material_id: 'm-004', warehouse: '默认仓库', qty: 45, safety_stock: 30, created_at: daysAgo(90), updated_at: daysAgo(10) },
    { id: 'ms-005', material_id: 'm-005', warehouse: '默认仓库', qty: 8, safety_stock: 50, created_at: daysAgo(90), updated_at: daysAgo(2) },
    { id: 'ms-006', material_id: 'm-006', warehouse: '默认仓库', qty: 60, safety_stock: 25, created_at: daysAgo(90), updated_at: daysAgo(7) },
  ],

  // ============ 入库记录 ============
  material_inbound: [
    { id: 'mi-001', material_id: 'm-001', qty: 500, operator_id: 'u-manager', notes: '首批海报印制', created_at: daysAgo(60) },
    { id: 'mi-002', material_id: 'm-002', qty: 30, operator_id: 'u-manager', notes: '展架采购入库', created_at: daysAgo(45) },
    { id: 'mi-003', material_id: 'm-003', qty: 1000, operator_id: 'u-admin', notes: '试用装大批量入库', created_at: daysAgo(30) },
    { id: 'mi-004', material_id: 'm-004', qty: 50, operator_id: 'u-manager', notes: '工服换季采购', created_at: daysAgo(20) },
  ],

  // ============ 出库记录 ============
  material_outbound: [
    { id: 'mo-001', material_id: 'm-001', qty: 50, applicant_id: 'u-rep1', store_id: 's-001', status: 'delivered', reason: '门店宣传海报更新', created_at: daysAgo(5), updated_at: daysAgo(4) },
    { id: 'mo-002', material_id: 'm-002', qty: 3, applicant_id: 'u-rep2', store_id: 's-002', status: 'delivered', reason: '产品展架更换', created_at: daysAgo(8), updated_at: daysAgo(7) },
    { id: 'mo-003', material_id: 'm-003', qty: 100, applicant_id: 'u-rep1', store_id: 's-001', status: 'approved', reason: '周末促销试用装', created_at: daysAgo(3), updated_at: daysAgo(2) },
    { id: 'mo-004', material_id: 'm-004', qty: 5, applicant_id: 'u-rep3', store_id: 's-005', status: 'pending', reason: '新员工工服', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { id: 'mo-005', material_id: 'm-006', qty: 10, applicant_id: 'u-rep2', store_id: 's-007', status: 'pending', reason: '高端社区促销立牌', created_at: daysAgo(0), updated_at: daysAgo(0) },
  ],

  // ============ 店铺评估 ============
  store_evaluations: [
    {
      id: 'se-001', store_id: 's-001', eval_date: dateAgo(5),
      score_sales: 9, score_display: 8, score_location: 9, score_cooperation: 8, score_expansion: 7, score_appearance: 8,
      total_score: 49, recommended_level: 'A',
      evaluator_id: 'u-manager', notes: '门店动销稳定，客流充足，陈列规范，是标杆门店',
      created_at: daysAgo(5), updated_at: daysAgo(5),
    },
    {
      id: 'se-002', store_id: 's-002', eval_date: dateAgo(5),
      score_sales: 8, score_display: 9, score_location: 9, score_cooperation: 9, score_expansion: 9, score_appearance: 9,
      total_score: 53, recommended_level: 'A',
      evaluator_id: 'u-manager', notes: '全家品牌优势明显，陈列标准高，合作意愿强',
      created_at: daysAgo(5), updated_at: daysAgo(5),
    },
    {
      id: 'se-003', store_id: 's-003', eval_date: dateAgo(4),
      score_sales: 6, score_display: 6, score_location: 7, score_cooperation: 7, score_expansion: 6, score_appearance: 6,
      total_score: 38, recommended_level: 'B',
      evaluator_id: 'u-rep1', notes: '中等水平门店，有提升空间，建议加强陈列指导',
      created_at: daysAgo(4), updated_at: daysAgo(4),
    },
    {
      id: 'se-004', store_id: 's-005', eval_date: dateAgo(3),
      score_sales: 4, score_display: 4, score_location: 5, score_cooperation: 6, score_expansion: 3, score_appearance: 4,
      total_score: 26, recommended_level: 'C',
      evaluator_id: 'u-rep2', notes: '小店经营困难，面积有限，建议精简SKU',
      created_at: daysAgo(3), updated_at: daysAgo(3),
    },
    {
      id: 'se-005', store_id: 's-007', eval_date: dateAgo(2),
      score_sales: 9, score_display: 9, score_location: 10, score_cooperation: 8, score_expansion: 8, score_appearance: 9,
      total_score: 53, recommended_level: 'A',
      evaluator_id: 'u-manager', notes: '望京高端社区，客流优质，消费力强',
      created_at: daysAgo(2), updated_at: daysAgo(2),
    },
  ],

  // ============ 活动 ============
  campaigns: [
    {
      id: 'ca-001', name: '夏季清凉饮品促销周', type: '促销活动',
      start_date: dateAgo(10), end_date: dateAgo(3),
      status: 'completed', description: '针对A/B级门店的夏季饮品促销活动，主推橙汁和矿泉水，配合展架陈列和试用装',
      target_stores: ['s-001', 's-002', 's-003', 's-006', 's-007'],
      budget: 5000, actual_cost: 4200,
      created_at: daysAgo(15), updated_at: daysAgo(3),
    },
    {
      id: 'ca-002', name: '新品薯片上市推广', type: '新品推广',
      start_date: dateAgo(2), end_date: dateAgo(0),
      status: 'ongoing', description: '新品薯片上市，在A级门店设置试吃台，配合买一送一活动',
      target_stores: ['s-001', 's-002', 's-007'],
      budget: 3000, actual_cost: 1500,
      created_at: daysAgo(7), updated_at: daysAgo(0),
    },
    {
      id: 'ca-003', name: '中秋礼盒预热活动', type: '节日营销',
      start_date: dateAgo(0), end_date: dateAgo(-15),
      status: 'planned', description: '中秋礼盒预售，覆盖全部门店，扫码领积分活动同步启动',
      target_stores: ['s-001', 's-002', 's-003', 's-004', 's-005', 's-006', 's-007', 's-008'],
      budget: 8000, actual_cost: 0,
      created_at: daysAgo(1), updated_at: daysAgo(0),
    },
  ],

  // ============ 活动任务 ============
  campaign_tasks: [
    { id: 'ct-001', campaign_id: 'ca-001', title: '制作夏季促销海报', assignee_id: 'u-rep1', due_date: dateAgo(12), status: 'done', created_at: daysAgo(15), updated_at: daysAgo(12) },
    { id: 'ct-002', campaign_id: 'ca-001', title: '门店展架布置', assignee_id: 'u-rep2', due_date: dateAgo(11), status: 'done', created_at: daysAgo(15), updated_at: daysAgo(10) },
    { id: 'ct-003', campaign_id: 'ca-001', title: '试用装分发', assignee_id: 'u-rep3', due_date: dateAgo(10), status: 'done', created_at: daysAgo(15), updated_at: daysAgo(9) },
    { id: 'ct-004', campaign_id: 'ca-002', title: '试吃台搭建', assignee_id: 'u-rep1', due_date: daysAgo(2), status: 'done', created_at: daysAgo(7), updated_at: daysAgo(2) },
    { id: 'ct-005', campaign_id: 'ca-002', title: '每日动销数据收集', assignee_id: 'u-rep3', due_date: dateAgo(0), status: 'ongoing', created_at: daysAgo(7), updated_at: daysAgo(1) },
    { id: 'ct-006', campaign_id: 'ca-003', title: '礼盒样品确认', assignee_id: 'u-manager', due_date: dateAgo(-3), status: 'pending', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { id: 'ct-007', campaign_id: 'ca-003', title: '扫码积分码库生成', assignee_id: 'u-admin', due_date: dateAgo(-2), status: 'pending', created_at: daysAgo(1), updated_at: daysAgo(1) },
  ],

  // ============ 活动复盘报告 ============
  campaign_reports: [
    {
      id: 'cr-001', campaign_id: 'ca-001',
      report_date: dateAgo(3),
      total_sales: 12500, total_visits: 45, total_scans: 320, total_participants: 5,
      achievement_rate: 105, cost_ratio: 84,
      summary: '夏季清凉饮品促销周圆满结束，5家门店参与，总销售额12500元，超额完成5%。橙汁和矿泉水动销最佳，展架陈列效果显著。建议后续类似活动继续采用试吃+买赠组合策略。',
      improvements: '1. 部分门店补货不够及时，下次需提前协调库存；2. 试用装消耗超预期，需增加备货；3. 可考虑增加线上扫码领券引流到店。',
      photos: ['https://images.unsplash.com/photo-1626202378011-4b0bf3a99fcd?w=400'],
      created_at: daysAgo(3), updated_at: daysAgo(3),
    },
  ],

  // ============ 二维码库 ============
  qr_codes: [
    { id: 'qr-001', product_id: 'p-001', code: 'QR-COLA-001', store_id: 's-001', points: 5, scan_count: 28, is_active: true, created_at: daysAgo(30), updated_at: daysAgo(1) },
    { id: 'qr-002', product_id: 'p-002', code: 'QR-ORANGE-001', store_id: 's-002', points: 5, scan_count: 52, is_active: true, created_at: daysAgo(30), updated_at: daysAgo(1) },
    { id: 'qr-003', product_id: 'p-003', code: 'QR-CHIPS-001', store_id: 's-007', points: 5, scan_count: 45, is_active: true, created_at: daysAgo(20), updated_at: daysAgo(1) },
    { id: 'qr-004', product_id: 'p-005', code: 'QR-WATER-001', store_id: 's-001', points: 5, scan_count: 33, is_active: true, created_at: daysAgo(30), updated_at: daysAgo(2) },
    { id: 'qr-005', product_id: 'p-004', code: 'QR-CHOC-001', store_id: 's-004', points: 5, scan_count: 12, is_active: true, created_at: daysAgo(15), updated_at: daysAgo(3) },
  ],

  // ============ 扫码记录 ============
  scan_records: [
    { id: 'sr-001', qr_code_id: 'qr-001', fan_id: 'f-001', product_id: 'p-001', store_id: 's-001', points_earned: 5, created_at: daysAgo(1) },
    { id: 'sr-002', qr_code_id: 'qr-002', fan_id: 'f-002', product_id: 'p-002', store_id: 's-002', points_earned: 5, created_at: daysAgo(1) },
    { id: 'sr-003', qr_code_id: 'qr-003', fan_id: 'f-007', product_id: 'p-003', store_id: 's-007', points_earned: 5, created_at: daysAgo(1) },
    { id: 'sr-004', qr_code_id: 'qr-001', fan_id: 'f-001', product_id: 'p-001', store_id: 's-001', points_earned: 5, created_at: daysAgo(2) },
    { id: 'sr-005', qr_code_id: 'qr-002', fan_id: 'f-002', product_id: 'p-002', store_id: 's-002', points_earned: 5, created_at: daysAgo(2) },
    { id: 'sr-006', qr_code_id: 'qr-004', fan_id: 'f-001', product_id: 'p-005', store_id: 's-001', points_earned: 5, created_at: daysAgo(2) },
    { id: 'sr-007', qr_code_id: 'qr-003', fan_id: 'f-007', product_id: 'p-003', store_id: 's-007', points_earned: 5, created_at: daysAgo(3) },
  ],
};

export default seedData;
