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
    { id: 'p-001', name: 'UWELL G4 PRO', sku: 'UW-G4PRO', category: 'Device', unit_price: 80, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-002', name: 'UWELL G4 PRO COCO', sku: 'UW-G4PRO-COCO', category: 'Device', unit_price: 80, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-003', name: 'UWELL G4', sku: 'UW-G4', category: 'Device', unit_price: 65, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-004', name: 'UWELL G5', sku: 'UW-G5', category: 'Device', unit_price: 120, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-005', name: 'UWELL KOKO', sku: 'UW-KOKO', category: 'Device', unit_price: 50, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-006', name: 'UWELL Pod (G4)', sku: 'UW-POD-G4', category: 'Pod', unit_price: 15, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-007', name: 'UWELL Pod (G5)', sku: 'UW-POD-G5', category: 'Pod', unit_price: 18, created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'p-008', name: 'UWELL Pod (KOKO)', sku: 'UW-POD-KOKO', category: 'Pod', unit_price: 12, created_at: daysAgo(90), updated_at: daysAgo(90) },
  ],

  // ============ 门店 ============
  stores: [
    { id: "s-real-001", name: "rabie alkayf lilshiyshat walmueasal", address: "https://maps.app.goo.gl/CAjbgREW4dTdtpbm9?g_st=ic", lat: 24.7136, lng: 46.6753, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "504875886", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-002", name: "muteat lilshiyshat waleasalat", address: "https://maps.app.goo.gl/KgKdp1dGqiKcbefk9?g_st=ic", lat: 24.7436, lng: 46.6553, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "598589221", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-003", name: "mizaj almashhur lilshiysh walmueasalat", address: "https://maps.app.goo.gl/KgKdp1dGqiKcbefk9?g_st=ic", lat: 24.7236, lng: 46.7153, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 4, contact: "", phone: "575122442", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-004", name: "atayb almizaj", address: "https://maps.app.goo.gl/oZhHiCUHdPsaj23TA?g_st=ic", lat: 24.7536, lng: 46.6353, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 4, contact: "", phone: "534174221", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-005", name: "rihlat zaman lilshiysh walmueasalat", address: "https://maps.app.goo.gl/4eftR9RjeGG419VKA?g_st=ic", lat: 24.6836, lng: 46.6953, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "550957743", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-006", name: "alruwqan aleali lilshiysh walmueasalat", address: "https://maps.app.goo.gl/dRWhYEcQXdrEFkdH7?g_st=ic", lat: 24.7036, lng: 46.7453, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "576259390", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-007", name: "Amwaj Oasis for shisha", address: "https://maps.app.goo.gl/c1rW6b5GyQN1Zisu5?g_st=ic", lat: 24.7636, lng: 46.6153, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "558667142", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-008", name: "Asl Al Tabkhir Company for Shisha and Molasses", address: "https://maps.app.goo.gl/hEftKyex8hiq4p988?g_st=ic", lat: 24.7336, lng: 46.6853, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "501218512", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-009", name: "musaasat hiwar alkayf", address: "https://maps.app.goo.gl/4ubpceFs9Tc7WpNx7?g_st=ic", lat: 24.6936, lng: 46.7253, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 6, contact: "", phone: "552052662", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-010", name: "muasasat \'aemidat alnakhil lilshiyshat waldibs", address: "https://maps.app.goo.gl/rbukQcqYmXpoLs9E6?g_st=ic", lat: 24.7736, lng: 46.6453, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "553521136", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-011", name: "eamduh alnakhlah lilshiyshat walmueasalat", address: "https://maps.app.goo.gl/ENT5HZTqEdgxNwyF9?g_st=ic", lat: 24.6636, lng: 46.6653, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "500298408", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-012", name: "bayt almueasal fare aleazizia", address: "https://maps.app.goo.gl/FHn43d3paKvsZupr6?g_st=ic", lat: 24.7436, lng: 46.7053, level: "S", chain_name: "UWELL Store", chain_id: null, chain_store_count: 12, contact: "", phone: "569864771", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-013", name: "abraj alkhalij aldhahabia", address: "https://maps.app.goo.gl/rc7FBBd8nkGJ4xts6?g_st=ic", lat: 24.7136, lng: 46.6353, level: "A", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "599406520", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-014", name: "eunwan almizaj lilshiysh walmueasalat", address: "https://maps.app.goo.gl/nMV3UVJp4XMTs8LN7?g_st=ic", lat: 24.7236, lng: 46.7553, level: "S", chain_name: "UWELL Store", chain_id: null, chain_store_count: 11, contact: "", phone: "510909145", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-015", name: "muasisuh milha\' alshamri lilshiysh w almueasalat", address: "https://maps.app.goo.gl/wytqyY4613hN7s2GA?g_st=ic", lat: 24.7536, lng: 46.6753, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "534350514", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-016", name: "mueasalat \'ajwa\' almizaj", address: "https://maps.app.goo.gl/EhCLLHcHb8DkDUN97?g_st=ic", lat: 24.6886, lng: 46.7103, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "502747027", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-017", name: "lawazim aljawi lishish w almueasalat", address: "https://maps.app.goo.gl/ieKqwCFh3wmAn74W7?g_st=ic", lat: 24.7686, lng: 46.6903, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 5, contact: "", phone: "572114738", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-018", name: "mueasalat kayf aldiywani", address: "https://maps.app.goo.gl/CcN8pAn47Lda3rQ88?g_st=ic", lat: 24.6586, lng: 46.7203, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "544306770", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-019", name: "mizaj altuwt lilshiysh walmueasalat Vip", address: "https://maps.app.goo.gl/eDkVf5cVa7M2Tsmr6?g_st=ic", lat: 24.7786, lng: 46.6603, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "575091200", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-020", name: "sharakuh alrimal alfakhiruh altijarih lishish walmueasalat", address: "https://maps.app.goo.gl/dbdiR46LxgS23ANV8?g_st=ic", lat: 24.6986, lng: 46.7403, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "511462979", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-021", name: "mizaj almasa\' fare aleazizih", address: "https://maps.app.goo.gl/dwgs6yXvEgTJxiDs9?g_st=ic", lat: 0, lng: 0, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "566742820", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-022", name: "mueasalat \'adwa\' layalina", address: "https://maps.app.goo.gl/CVwzRUMZXQrkGDrm8?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "508467658", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-023", name: "jawiyun lilmueasalat", address: "https://maps.app.goo.gl/cCfaqEEXwuw48ReM8?g_st=ic", lat: 0, lng: 0, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "568624101", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-024", name: "eunwan altabkhir lilshiysh walmueasalat aleazizia", address: "https://maps.app.goo.gl/L9EriEwVX3Fj7ZeK8?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "509042457", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-025", name: "Mood house", address: "https://maps.app.goo.gl/bLsUzuKSqtfrtytV8?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "553123556", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-026", name: "mueasal fakhr almizaj lilshiysh walmueasalat raqm 2", address: "https://maps.app.goo.gl/a2Rsd3wN4STcquw9A?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "510841182", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-027", name: "mizaj eali lilshiysh walmueasalat", address: "https://maps.app.goo.gl/U54YoURstoCJtwsWA?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 4, contact: "", phone: "511241404", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-028", name: "mueasalat washish amwaj almuthanaa", address: "https://maps.app.goo.gl/QAidFNENtYZfiV8w9?g_st=ic", lat: 0, lng: 0, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "555036949", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-029", name: "shish wamueasalat basti sumuk", address: "https://maps.app.goo.gl/wtcerTnQCcyCfRWo9?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "533896474", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-030", name: "mizaj almashhur lilshiysh walmueasalat", address: "https://maps.app.goo.gl/DyPtfG3oUo99SabU8?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "598589921", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-031", name: "shish wamueasalat jamrat layali", address: "https://maps.app.goo.gl/a6RuqeGwybaXGG7s6?g_st=ic", lat: 0, lng: 0, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "556338583", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-032", name: "Just Smoke Vape and Shisha", address: "https://maps.app.goo.gl/LqQhFyzyiRkhX5reA?g_st=ic", lat: 0, lng: 0, level: "A", chain_name: "UWELL Store", chain_id: null, chain_store_count: 8, contact: "", phone: "536997022", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-033", name: "masa\' alfakhir lilshiysh walmueasalat", address: "https://maps.app.goo.gl/WMZQm9Nomvi39Mv7A?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 5, contact: "", phone: "558199796", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-034", name: "mahala shishih wa mueasalat khalatat alkhalikh jayid", address: "https://maps.app.goo.gl/YtFYzChHVnwuPnFx7?g_st=ic", lat: 0, lng: 0, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "564349262", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-035", name: "Shish Ma\'asalat Fata Najd 4", address: "https://maps.app.goo.gl/6K8PQ14KvaZbNjyv8?g_st=ic", lat: 0, lng: 0, level: "A", chain_name: "UWELL Store", chain_id: null, chain_store_count: 6, contact: "", phone: "531526657", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-036", name: "shish mueasal lilshiysh almulaz husam", address: "https://maps.app.goo.gl/9NVeL2gHYWxEWtbv7?g_st=ic", lat: 0, lng: 0, level: "A", chain_name: "UWELL Store", chain_id: null, chain_store_count: 6, contact: "", phone: "502002854", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-037", name: "shish mueasalat sahbat khayal", address: "https://maps.app.goo.gl/931pxG7J92b7LrYo6?g_st=ic", lat: 0, lng: 0, level: "C", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "530670536", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-038", name: "shish mueasalat albahrini2", address: "https://maps.app.goo.gl/1rmJ8VQUeFmdaA9Z9?g_st=ic", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "545739814", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-039", name: "Al-kaif al-fakhir", address: "https://maps.app.goo.gl/kd7cK1AKV2CWRmQ37?g_st=aw", lat: 0, lng: 0, level: "A", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "559956069", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-040", name: "Nasmat al-masa lish-sheesh", address: "https://maps.app.goo.gl/Ebr2gPt1d2Y7Ymzh6?g_st=ipc", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "540475655", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-041", name: "Mazaj Al-Naseem for Hookah", address: "", lat: 0, lng: 0, level: "B", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "538524039", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-042", name: "Bayt al-moasal", address: "https://maps.app.goo.gl/LPXTvU4zTgXBX119A?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 7, contact: "", phone: "548104829", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-043", name: "Nahkat al-tamayoz lil-moasalat", address: "https://maps.app.goo.gl/iNjkd4WuFYczZ7qV9?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "558943081", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-044", name: "Atheer al-kaif lil-moasalat", address: "https://maps.app.goo.gl/MDtxdEd6rYQSTyuz6?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "505046909", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-045", name: "Mazaj al-sa\'adah lish-sheesh wal-moasalat", address: "https://maps.app.goo.gl/51iDxpG1PcC7Sd5P8?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "555354621", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-046", name: "Mr. Mazaj", address: "https://maps.app.goo.gl/trF18H5X4pxdFJS19?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "554616590", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-047", name: "Mazaj al-riyadh lish-sheesh", address: "https://maps.app.goo.gl/tPTkpHgCkZ2B8HGx6?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "574254060", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-048", name: "Mazaj al-qaisar", address: "", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 10, contact: "", phone: "503506065", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-049", name: "Rawa\'e al-modhesh lil-moasalat", address: "https://maps.app.goo.gl/XynwwSuGw8iZ3gW88?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "563833825", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-050", name: "Walle\' Kaif", address: "", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "581816750", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-051", name: "Kaif al-sulay lil-moasalat", address: "https://maps.app.goo.gl/N1t6aXycKHbk6STM9?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "556799712", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-052", name: "Rawaq al-rawabi lil-moasalat", address: "https://maps.app.goo.gl/EpXkomWQjTNvxCEi6?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "567273410", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-053", name: "Rawa\'e lil-moasalat", address: "https://maps.app.goo.gl/qbVJgYDgHTfHrQtDA?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "533390030", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-054", name: "Mazaj Al-Asimah", address: "https://maps.app.goo.gl/C4beDA5DRJ1HaFWq5?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "541813334", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-055", name: "Hawa al-mazaj", address: "https://maps.app.goo.gl/7FqdauB3g54Bv5oV9?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "575101856", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-056", name: "Nokhbat al-nakhah lish-sheesh walmoasalat", address: "https://maps.app.goo.gl/WfU9T5rL6fKsjKZM6?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "539659097", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-057", name: "sheesh wal-moasalat", address: "https://maps.app.goo.gl/Ti2b6uCgzkviUpAt8?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "565300282", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-058", name: "Mood Plus", address: "https://maps.app.goo.gl/e5o8zgLf4XfBzAUT8?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "541509630", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-059", name: "Layali toffahati", address: "https://maps.app.goo.gl/eP5rDJ7fAJDEasGo7?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "550996352", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-060", name: "Mazaj lubnan", address: "https://maps.app.goo.gl/phUEc49uxiY1bP8v5?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "561954228", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-061", name: "Dhaw\' al-ilham", address: "https://maps.app.goo.gl/rgzVJWh823CN4w3W8?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "57905583", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-062", name: "Tooti beiruti", address: "https://maps.app.goo.gl/x1JXg5SehjBBPu4N6?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "531637116", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-063", name: "Vape, cigar wa ghalyoun", address: "https://maps.app.goo.gl/dNhj7PxgCJLAye3A8?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 4, contact: "", phone: "583250160", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-064", name: "Tobacco house", address: "https://maps.app.goo.gl/CagkKRTuhgvYt8jj6?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "558586639", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-065", name: "Bida vape", address: "https://maps.app.goo.gl/GXHpnwmLC5i2yP9q8?g_st=ic", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "503262087", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-066", name: "Al-musafer lish-sheesh wal-moasalat", address: "https://maps.app.goo.gl/FbempiM5tJcyFc9a8?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "503250666", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-067", name: "Smook pls", address: "https://maps.app.goo.gl/3SYfhHQ7nTHyPmnT8?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "565579445", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-068", name: "Al-musafer lish-sheesh", address: "https://maps.app.goo.gl/HVFoPEcEygBsLwdM6?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "500949513", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-069", name: "Sultan lish-sheesh wal-moasalat", address: "https://maps.app.goo.gl/ypjzd5ivjPYQ5NkC7?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "582683270", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-070", name: "Sharikat shumookh al-fakhir", address: "https://maps.app.goo.gl/6ejHHXiozeRuecf36?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "539310938", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-071", name: "Al-musafer", address: "https://maps.app.goo.gl/s49U7YJDPFeDy4NU9?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "506584666", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-072", name: "Sharikat shumookh al-fakhir", address: "https://maps.app.goo.gl/MjanbAyKBPxfu6F78?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 4, contact: "", phone: "539310938", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-073", name: "Dhaw\' al-ilham lil-moasalat", address: "https://maps.app.goo.gl/Bqd8qyjKnDWgxi3m7?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "544878912", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-074", name: "Smok plus lil-vape wal-moasalat", address: "https://maps.app.goo.gl/FLXb7mf5LtjY8Gwh6?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 3, contact: "", phone: "543903337", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-075", name: "Oustorat al-atwal lil-moasalat", address: "https://maps.app.goo.gl/MVgGR44i6t4oNjgo7?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 2, contact: "", phone: "503413206", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-076", name: "Smok plus", address: "https://maps.app.goo.gl/yvrpHHtMBYgvFDcR9?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "532477285", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-077", name: "ALMOSAFR TO TRADE", address: "https://maps.app.goo.gl/PVEfLdYzGQsWj6UH9?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "571800860", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-078", name: "Hadith al-masa", address: "https://maps.app.goo.gl/nqNLpPoSKggb9zyv7?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "535226877", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-079", name: "Nisr al-keif", address: "https://maps.app.goo.gl/rU7oSXiJhiQDaAVa6?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "507976579", created_at: daysAgo(90), updated_at: daysAgo(1) },
    { id: "s-real-080", name: "Sharikat joud al-keif", address: "https://maps.app.goo.gl/8uT1iqPGWXvnvWWD8?g_st=aw", lat: 0, lng: 0, level: "", chain_name: "UWELL Store", chain_id: null, chain_store_count: 1, contact: "", phone: "508307689", created_at: daysAgo(90), updated_at: daysAgo(1) }
  ],

  // ============ 拜访记录 ============
  visits: [
    { id: 'v-real-001', store_id: 's-real-001', rep_id: 'u-rep1', visit_date: dateAgo(1), status: 'completed', notes: 'G4 PRO display looks great, 15 units in stock. Competitor Xlim Pro has poster on door. Placed UWELL door panel sticker and added store to WhatsApp group.', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { id: 'v-real-002', store_id: 's-real-002', rep_id: 'u-rep2', visit_date: dateAgo(1), status: 'completed', notes: 'G4 pods out of stock, customer asking for restock urgently. Need to coordinate distributor resupply this week.', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { id: 'v-real-003', store_id: 's-real-003', rep_id: 'u-rep3', visit_date: dateAgo(1), status: 'completed', notes: 'UWELL G4 PRO selling 8-12 units/month, pods selling 30-50 units/month. Strong shelf presence, staff knowledgeable about pod systems.', created_at: daysAgo(1), updated_at: daysAgo(1) },
    { id: 'v-real-004', store_id: 's-real-004', rep_id: 'u-rep1', visit_date: dateAgo(2), status: 'completed', notes: 'OXVA gaining shelf space, need more POSM. Demonstrated G5 features to staff, strong interest in coil advantage.', created_at: daysAgo(2), updated_at: daysAgo(2) },
    { id: 'v-real-005', store_id: 's-real-005', rep_id: 'u-rep2', visit_date: dateAgo(2), status: 'completed', notes: 'Vaporesso pushing hard with new XROS display. UWELL shelf reduced. Scheduled display reset for next visit.', created_at: daysAgo(2), updated_at: daysAgo(2) },
    { id: 'v-real-006', store_id: 's-real-006', rep_id: 'u-rep3', visit_date: dateAgo(2), status: 'completed', notes: 'G4 PRO best seller here. Added store owner to UWELL WhatsApp group. 20 G4 pods in stock, healthy inventory.', created_at: daysAgo(2), updated_at: daysAgo(2) },
    { id: 'v-real-007', store_id: 's-real-007', rep_id: 'u-rep1', visit_date: dateAgo(3), status: 'completed', notes: 'New fan registered from QR scan! Welcome. UWELL lightbox installed and looks great, drawing customer attention.', created_at: daysAgo(3), updated_at: daysAgo(3) },
    { id: 'v-real-008', store_id: 's-real-008', rep_id: 'u-rep2', visit_date: dateAgo(3), status: 'completed', notes: 'Chain store with 3 locations. G4 pods moving fast, restock 50 units requested. Manager very cooperative.', created_at: daysAgo(3), updated_at: daysAgo(3) },
    { id: 'v-real-009', store_id: 's-real-009', rep_id: 'u-rep3', visit_date: dateAgo(3), status: 'completed', notes: 'Small store, limited display. Suggested focusing on KOKO entry-level device to attract budget customers.', created_at: daysAgo(3), updated_at: daysAgo(3) },
    { id: 'v-real-010', store_id: 's-real-010', rep_id: 'u-rep1', visit_date: dateAgo(4), status: 'completed', notes: 'G5 demo done, owner impressed by flavor. 5 units ordered on spot. Ramadan promo materials placed on counter.', created_at: daysAgo(4), updated_at: daysAgo(4) },
    { id: 'v-real-011', store_id: 's-real-011', rep_id: 'u-rep2', visit_date: dateAgo(4), status: 'completed', notes: 'Strong UWELL shelf presence, G4 PRO best seller. Staff trained on pod replacement. Sales up 15% this month.', created_at: daysAgo(4), updated_at: daysAgo(4) },
    { id: 'v-real-012', store_id: 's-real-012', rep_id: 'u-rep3', visit_date: dateAgo(4), status: 'completed', notes: 'A-level store, premium location. G5 selling 10+ units/month. Recommended adding KOKO for entry segment.', created_at: daysAgo(4), updated_at: daysAgo(4) },
    { id: 'v-real-013', store_id: 's-real-013', rep_id: 'u-rep1', visit_date: dateAgo(5), status: 'completed', notes: 'Competitor watch: Vaporesso XROS 4 launched. Pushed G4 PRO\'s superior coil life as key differentiator.', created_at: daysAgo(5), updated_at: daysAgo(5) },
    { id: 'v-real-014', store_id: 's-real-014', rep_id: 'u-rep2', visit_date: dateAgo(5), status: 'completed', notes: 'Store display upgraded with UWELL lightbox and acrylic stand. Looks premium. Expect sales lift of 30%.', created_at: daysAgo(5), updated_at: daysAgo(5) },
    { id: 'v-real-015', store_id: 's-real-015', rep_id: 'u-rep3', visit_date: dateAgo(5), status: 'completed', notes: 'C-level store struggling. Owner only stocks competitor pods. Left samples and catalog, follow up next week.', created_at: daysAgo(5), updated_at: daysAgo(5) },
    { id: 'v-real-016', store_id: 's-real-016', rep_id: 'u-rep1', visit_date: dateAgo(6), status: 'completed', notes: 'Ramadan promo live: buy 2 G4 get 1 pod free. POSM placed. Early sales strong, 8 units sold in 2 days.', created_at: daysAgo(6), updated_at: daysAgo(6) },
    { id: 'v-real-017', store_id: 's-real-017', rep_id: 'u-rep2', visit_date: dateAgo(6), status: 'completed', notes: 'G4 pods restocked 60 units. Owner happy with margin. Suggested bundling pods with KOKO device.', created_at: daysAgo(6), updated_at: daysAgo(6) },
    { id: 'v-real-018', store_id: 's-real-018', rep_id: 'u-rep3', visit_date: dateAgo(6), status: 'completed', notes: 'WhatsApp community growing - added 3 store staff today. Sharing daily G5 tips and coil care guides.', created_at: daysAgo(6), updated_at: daysAgo(6) },
    { id: 'v-real-019', store_id: 's-real-019', rep_id: 'u-rep1', visit_date: dateAgo(7), status: 'completed', notes: 'Store check: G4 PRO 12 units in stock, G5 5 units, pods 40. Display tidy. Placed new A2 poster.', created_at: daysAgo(7), updated_at: daysAgo(7) },
    { id: 'v-real-020', store_id: 's-real-020', rep_id: 'u-rep2', visit_date: dateAgo(7), status: 'completed', notes: 'Customer feedback: G4 PRO flavor better than Xlim Pro. Captured testimonial for marketing. Sales steady.', created_at: daysAgo(7), updated_at: daysAgo(7) },
    { id: 'v-real-021', store_id: 's-real-021', rep_id: 'u-rep3', visit_date: dateAgo(7), status: 'completed', notes: 'POSM installation complete: door panel + lightbox. Store now looks like flagship UWELL partner.', created_at: daysAgo(7), updated_at: daysAgo(7) },
    { id: 'v-real-022', store_id: 's-real-022', rep_id: 'u-rep1', visit_date: dateAgo(8), status: 'completed', notes: 'B-level store improving. After training, staff now recommend UWELL first. Pod attach rate up to 60%.', created_at: daysAgo(8), updated_at: daysAgo(8) },
    { id: 'v-real-023', store_id: 's-real-023', rep_id: 'u-rep2', visit_date: dateAgo(8), status: 'completed', notes: 'Stock alert: G5 running low (3 units left). Placed urgent order. G4 PRO healthy at 18 units.', created_at: daysAgo(8), updated_at: daysAgo(8) },
    { id: 'v-real-024', store_id: 's-real-024', rep_id: 'u-rep3', visit_date: dateAgo(8), status: 'completed', notes: 'Just Smoke Vape flagship visit. G5 demo event planned for next week. 20+ customers expected.', created_at: daysAgo(8), updated_at: daysAgo(8) },
    { id: 'v-real-025', store_id: 's-real-025', rep_id: 'u-rep1', visit_date: dateAgo(9), status: 'completed', notes: 'Holiday foot traffic strong. G4 PRO 9 units sold this week. Ramadan giveaway driving scan registrations.', created_at: daysAgo(9), updated_at: daysAgo(9) },
    { id: 'v-real-026', store_id: 's-real-026', rep_id: 'u-rep2', visit_date: dateAgo(9), status: 'completed', notes: 'New competitor poster on window (OXVA Xlim Pro). Replaced with UWELL G5 banner. Maintained visibility.', created_at: daysAgo(9), updated_at: daysAgo(9) },
    { id: 'v-real-027', store_id: 's-real-027', rep_id: 'u-rep3', visit_date: dateAgo(9), status: 'completed', notes: 'C-level store. Limited budget. Suggested KOKO + pod bundle as low-risk entry. Owner considering.', created_at: daysAgo(9), updated_at: daysAgo(9) },
    { id: 'v-real-028', store_id: 's-real-028', rep_id: 'u-rep1', visit_date: dateAgo(10), status: 'completed', notes: 'A-level store, top performer. G5 15 units/month, G4 PRO 20 units/month. Recommended for VIP program.', created_at: daysAgo(10), updated_at: daysAgo(10) },
    { id: 'v-real-029', store_id: 's-real-029', rep_id: 'u-rep2', visit_date: dateAgo(10), status: 'completed', notes: 'Store owner joined WhatsApp group, already asking about G5 restock. Engagement building well.', created_at: daysAgo(10), updated_at: daysAgo(10) },
    { id: 'v-real-030', store_id: 's-real-030', rep_id: 'u-rep3', visit_date: dateAgo(10), status: 'completed', notes: 'Monthly visit complete. Sales data collected: 12 G4 PRO, 45 pods sold. Display photos uploaded.', created_at: daysAgo(10), updated_at: daysAgo(10) }
  ],

  // ============ 动销数据 ============
  visit_sales: [
    { id: 'vs-real-001', visit_id: 'v-real-001', product_id: 'p-001', sales_qty: 12, sales_amount: 960, stock_qty: 15, created_at: daysAgo(1) },
    { id: 'vs-real-002', visit_id: 'v-real-001', product_id: 'p-006', sales_qty: 45, sales_amount: 675, stock_qty: 50, created_at: daysAgo(1) },
    { id: 'vs-real-003', visit_id: 'v-real-002', product_id: 'p-001', sales_qty: 8, sales_amount: 640, stock_qty: 5, created_at: daysAgo(1) },
    { id: 'vs-real-004', visit_id: 'v-real-002', product_id: 'p-006', sales_qty: 30, sales_amount: 450, stock_qty: 10, created_at: daysAgo(1) },
    { id: 'vs-real-005', visit_id: 'v-real-003', product_id: 'p-001', sales_qty: 10, sales_amount: 800, stock_qty: 20, created_at: daysAgo(1) },
    { id: 'vs-real-006', visit_id: 'v-real-003', product_id: 'p-006', sales_qty: 50, sales_amount: 750, stock_qty: 60, created_at: daysAgo(1) },
    { id: 'vs-real-007', visit_id: 'v-real-004', product_id: 'p-004', sales_qty: 6, sales_amount: 720, stock_qty: 8, created_at: daysAgo(2) },
    { id: 'vs-real-008', visit_id: 'v-real-004', product_id: 'p-007', sales_qty: 25, sales_amount: 450, stock_qty: 30, created_at: daysAgo(2) },
    { id: 'vs-real-009', visit_id: 'v-real-004', product_id: 'p-001', sales_qty: 9, sales_amount: 720, stock_qty: 12, created_at: daysAgo(2) },
    { id: 'vs-real-010', visit_id: 'v-real-005', product_id: 'p-003', sales_qty: 15, sales_amount: 975, stock_qty: 20, created_at: daysAgo(2) },
    { id: 'vs-real-011', visit_id: 'v-real-005', product_id: 'p-006', sales_qty: 35, sales_amount: 525, stock_qty: 15, created_at: daysAgo(2) },
    { id: 'vs-real-012', visit_id: 'v-real-006', product_id: 'p-001', sales_qty: 11, sales_amount: 880, stock_qty: 18, created_at: daysAgo(2) },
    { id: 'vs-real-013', visit_id: 'v-real-006', product_id: 'p-006', sales_qty: 40, sales_amount: 600, stock_qty: 45, created_at: daysAgo(2) },
    { id: 'vs-real-014', visit_id: 'v-real-007', product_id: 'p-005', sales_qty: 14, sales_amount: 700, stock_qty: 16, created_at: daysAgo(3) },
    { id: 'vs-real-015', visit_id: 'v-real-007', product_id: 'p-008', sales_qty: 38, sales_amount: 456, stock_qty: 40, created_at: daysAgo(3) },
    { id: 'vs-real-016', visit_id: 'v-real-008', product_id: 'p-001', sales_qty: 9, sales_amount: 720, stock_qty: 10, created_at: daysAgo(3) },
    { id: 'vs-real-017', visit_id: 'v-real-008', product_id: 'p-006', sales_qty: 42, sales_amount: 630, stock_qty: 20, created_at: daysAgo(3) },
    { id: 'vs-real-018', visit_id: 'v-real-008', product_id: 'p-004', sales_qty: 4, sales_amount: 480, stock_qty: 6, created_at: daysAgo(3) },
    { id: 'vs-real-019', visit_id: 'v-real-009', product_id: 'p-005', sales_qty: 8, sales_amount: 400, stock_qty: 12, created_at: daysAgo(3) },
    { id: 'vs-real-020', visit_id: 'v-real-009', product_id: 'p-008', sales_qty: 25, sales_amount: 300, stock_qty: 30, created_at: daysAgo(3) },
    { id: 'vs-real-021', visit_id: 'v-real-010', product_id: 'p-004', sales_qty: 5, sales_amount: 600, stock_qty: 8, created_at: daysAgo(4) },
    { id: 'vs-real-022', visit_id: 'v-real-010', product_id: 'p-007', sales_qty: 20, sales_amount: 360, stock_qty: 25, created_at: daysAgo(4) },
    { id: 'vs-real-023', visit_id: 'v-real-011', product_id: 'p-001', sales_qty: 13, sales_amount: 1040, stock_qty: 16, created_at: daysAgo(4) },
    { id: 'vs-real-024', visit_id: 'v-real-011', product_id: 'p-006', sales_qty: 48, sales_amount: 720, stock_qty: 50, created_at: daysAgo(4) },
    { id: 'vs-real-025', visit_id: 'v-real-012', product_id: 'p-004', sales_qty: 11, sales_amount: 1320, stock_qty: 9, created_at: daysAgo(4) },
    { id: 'vs-real-026', visit_id: 'v-real-012', product_id: 'p-007', sales_qty: 30, sales_amount: 540, stock_qty: 35, created_at: daysAgo(4) },
    { id: 'vs-real-027', visit_id: 'v-real-012', product_id: 'p-005', sales_qty: 7, sales_amount: 350, stock_qty: 10, created_at: daysAgo(4) },
    { id: 'vs-real-028', visit_id: 'v-real-013', product_id: 'p-001', sales_qty: 10, sales_amount: 800, stock_qty: 14, created_at: daysAgo(5) },
    { id: 'vs-real-029', visit_id: 'v-real-013', product_id: 'p-006', sales_qty: 38, sales_amount: 570, stock_qty: 40, created_at: daysAgo(5) },
    { id: 'vs-real-030', visit_id: 'v-real-014', product_id: 'p-001', sales_qty: 12, sales_amount: 960, stock_qty: 18, created_at: daysAgo(5) },
    { id: 'vs-real-031', visit_id: 'v-real-014', product_id: 'p-004', sales_qty: 6, sales_amount: 720, stock_qty: 8, created_at: daysAgo(5) },
    { id: 'vs-real-032', visit_id: 'v-real-014', product_id: 'p-006', sales_qty: 45, sales_amount: 675, stock_qty: 50, created_at: daysAgo(5) },
    { id: 'vs-real-033', visit_id: 'v-real-015', product_id: 'p-005', sales_qty: 5, sales_amount: 250, stock_qty: 8, created_at: daysAgo(5) },
    { id: 'vs-real-034', visit_id: 'v-real-015', product_id: 'p-008', sales_qty: 18, sales_amount: 216, stock_qty: 20, created_at: daysAgo(5) },
    { id: 'vs-real-035', visit_id: 'v-real-016', product_id: 'p-003', sales_qty: 14, sales_amount: 910, stock_qty: 16, created_at: daysAgo(6) },
    { id: 'vs-real-036', visit_id: 'v-real-016', product_id: 'p-006', sales_qty: 50, sales_amount: 750, stock_qty: 55, created_at: daysAgo(6) },
    { id: 'vs-real-037', visit_id: 'v-real-017', product_id: 'p-001', sales_qty: 9, sales_amount: 720, stock_qty: 22, created_at: daysAgo(6) },
    { id: 'vs-real-038', visit_id: 'v-real-017', product_id: 'p-006', sales_qty: 55, sales_amount: 825, stock_qty: 60, created_at: daysAgo(6) },
    { id: 'vs-real-039', visit_id: 'v-real-017', product_id: 'p-008', sales_qty: 20, sales_amount: 240, stock_qty: 25, created_at: daysAgo(6) },
    { id: 'vs-real-040', visit_id: 'v-real-018', product_id: 'p-005', sales_qty: 10, sales_amount: 500, stock_qty: 14, created_at: daysAgo(6) },
    { id: 'vs-real-041', visit_id: 'v-real-018', product_id: 'p-008', sales_qty: 30, sales_amount: 360, stock_qty: 35, created_at: daysAgo(6) },
    { id: 'vs-real-042', visit_id: 'v-real-019', product_id: 'p-001', sales_qty: 12, sales_amount: 960, stock_qty: 18, created_at: daysAgo(7) },
    { id: 'vs-real-043', visit_id: 'v-real-019', product_id: 'p-006', sales_qty: 42, sales_amount: 630, stock_qty: 45, created_at: daysAgo(7) },
    { id: 'vs-real-044', visit_id: 'v-real-020', product_id: 'p-004', sales_qty: 7, sales_amount: 840, stock_qty: 10, created_at: daysAgo(7) },
    { id: 'vs-real-045', visit_id: 'v-real-020', product_id: 'p-007', sales_qty: 28, sales_amount: 504, stock_qty: 30, created_at: daysAgo(7) },
    { id: 'vs-real-046', visit_id: 'v-real-021', product_id: 'p-001', sales_qty: 11, sales_amount: 880, stock_qty: 15, created_at: daysAgo(7) },
    { id: 'vs-real-047', visit_id: 'v-real-021', product_id: 'p-006', sales_qty: 44, sales_amount: 660, stock_qty: 48, created_at: daysAgo(7) },
    { id: 'vs-real-048', visit_id: 'v-real-021', product_id: 'p-004', sales_qty: 5, sales_amount: 600, stock_qty: 7, created_at: daysAgo(7) },
    { id: 'vs-real-049', visit_id: 'v-real-022', product_id: 'p-001', sales_qty: 10, sales_amount: 800, stock_qty: 16, created_at: daysAgo(8) },
    { id: 'vs-real-050', visit_id: 'v-real-022', product_id: 'p-006', sales_qty: 40, sales_amount: 600, stock_qty: 42, created_at: daysAgo(8) },
    { id: 'vs-real-051', visit_id: 'v-real-023', product_id: 'p-004', sales_qty: 3, sales_amount: 360, stock_qty: 5, created_at: daysAgo(8) },
    { id: 'vs-real-052', visit_id: 'v-real-023', product_id: 'p-007', sales_qty: 22, sales_amount: 396, stock_qty: 25, created_at: daysAgo(8) },
    { id: 'vs-real-053', visit_id: 'v-real-023', product_id: 'p-001', sales_qty: 8, sales_amount: 640, stock_qty: 12, created_at: daysAgo(8) },
    { id: 'vs-real-054', visit_id: 'v-real-024', product_id: 'p-004', sales_qty: 12, sales_amount: 1440, stock_qty: 14, created_at: daysAgo(8) },
    { id: 'vs-real-055', visit_id: 'v-real-024', product_id: 'p-007', sales_qty: 35, sales_amount: 630, stock_qty: 40, created_at: daysAgo(8) },
    { id: 'vs-real-056', visit_id: 'v-real-024', product_id: 'p-001', sales_qty: 14, sales_amount: 1120, stock_qty: 18, created_at: daysAgo(8) },
    { id: 'vs-real-057', visit_id: 'v-real-025', product_id: 'p-001', sales_qty: 9, sales_amount: 720, stock_qty: 13, created_at: daysAgo(9) },
    { id: 'vs-real-058', visit_id: 'v-real-025', product_id: 'p-006', sales_qty: 38, sales_amount: 570, stock_qty: 40, created_at: daysAgo(9) },
    { id: 'vs-real-059', visit_id: 'v-real-026', product_id: 'p-003', sales_qty: 12, sales_amount: 780, stock_qty: 18, created_at: daysAgo(9) },
    { id: 'vs-real-060', visit_id: 'v-real-026', product_id: 'p-006', sales_qty: 36, sales_amount: 540, stock_qty: 38, created_at: daysAgo(9) },
    { id: 'vs-real-061', visit_id: 'v-real-027', product_id: 'p-005', sales_qty: 6, sales_amount: 300, stock_qty: 10, created_at: daysAgo(9) },
    { id: 'vs-real-062', visit_id: 'v-real-027', product_id: 'p-008', sales_qty: 22, sales_amount: 264, stock_qty: 28, created_at: daysAgo(9) },
    { id: 'vs-real-063', visit_id: 'v-real-028', product_id: 'p-004', sales_qty: 15, sales_amount: 1800, stock_qty: 12, created_at: daysAgo(10) },
    { id: 'vs-real-064', visit_id: 'v-real-028', product_id: 'p-007', sales_qty: 40, sales_amount: 720, stock_qty: 45, created_at: daysAgo(10) },
    { id: 'vs-real-065', visit_id: 'v-real-028', product_id: 'p-001', sales_qty: 20, sales_amount: 1600, stock_qty: 22, created_at: daysAgo(10) },
    { id: 'vs-real-066', visit_id: 'v-real-029', product_id: 'p-003', sales_qty: 11, sales_amount: 715, stock_qty: 15, created_at: daysAgo(10) },
    { id: 'vs-real-067', visit_id: 'v-real-029', product_id: 'p-006', sales_qty: 42, sales_amount: 630, stock_qty: 48, created_at: daysAgo(10) },
    { id: 'vs-real-068', visit_id: 'v-real-030', product_id: 'p-001', sales_qty: 12, sales_amount: 960, stock_qty: 16, created_at: daysAgo(10) },
    { id: 'vs-real-069', visit_id: 'v-real-030', product_id: 'p-006', sales_qty: 45, sales_amount: 675, stock_qty: 50, created_at: daysAgo(10) },
    { id: 'vs-real-070', visit_id: 'v-real-030', product_id: 'p-004', sales_qty: 6, sales_amount: 720, stock_qty: 8, created_at: daysAgo(10) }
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
    { id: 'f-001', store_id: 's-001', user_id: 'u-rep1', name: 'Ahmed', phone: '+966501234001', level: 'gold', points: 580, total_contribution: 580, created_at: daysAgo(70), updated_at: daysAgo(1) },
    { id: 'f-002', store_id: 's-002', user_id: null, name: 'Fatima', phone: '+966551234002', level: 'platinum', points: 2300, total_contribution: 2300, created_at: daysAgo(65), updated_at: daysAgo(2) },
    { id: 'f-003', store_id: 's-003', user_id: null, name: 'Mohammed', phone: '+966501234003', level: 'silver', points: 150, total_contribution: 150, created_at: daysAgo(55), updated_at: daysAgo(5) },
    { id: 'f-004', store_id: 's-004', user_id: null, name: 'Layla', phone: '+966541234004', level: 'gold', points: 520, total_contribution: 520, created_at: daysAgo(45), updated_at: daysAgo(3) },
    { id: 'f-005', store_id: 's-005', user_id: null, name: 'Omar', phone: '+966531234005', level: 'bronze', points: 30, total_contribution: 30, created_at: daysAgo(35), updated_at: daysAgo(10) },
    { id: 'f-006', store_id: 's-006', user_id: null, name: 'Aisha', phone: '+966561234006', level: 'silver', points: 120, total_contribution: 120, created_at: daysAgo(25), updated_at: daysAgo(4) },
    { id: 'f-007', store_id: 's-007', user_id: null, name: 'Khalid', phone: '+966551234007', level: 'diamond', points: 5200, total_contribution: 5200, created_at: daysAgo(20), updated_at: daysAgo(1) },
    { id: 'f-008', store_id: 's-008', user_id: null, name: 'Noor', phone: '+966501234008', level: 'bronze', points: 15, total_contribution: 15, created_at: daysAgo(15), updated_at: daysAgo(15) },
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
    { id: 'fpl-real-001', fan_id: 'f-001', points: 10, type: 'earn', source: '完成拜访', description: '完成门店拜访 s-real-001 (rabie alkayf)', created_at: daysAgo(1) },
    { id: 'fpl-real-002', fan_id: 'f-001', points: 5, type: 'earn', source: '扫码积分', description: '消费者扫码 G4 PRO x10', created_at: daysAgo(1) },
    { id: 'fpl-real-003', fan_id: 'f-001', points: 5, type: 'earn', source: '签到奖励', description: '每日签到 +5', created_at: daysAgo(1) },
    { id: 'fpl-real-004', fan_id: 'f-002', points: 10, type: 'earn', source: '完成拜访', description: '完成门店拜访 s-real-002 (muteat)', created_at: daysAgo(2) },
    { id: 'fpl-real-005', fan_id: 'f-002', points: 30, type: 'earn', source: '推荐新粉丝', description: '推荐 Amwaj Oasis 店主注册', created_at: daysAgo(2) },
    { id: 'fpl-real-006', fan_id: 'f-007', points: 50, type: 'earn', source: '扫码积分', description: 'G5 demo event 扫码 x10', created_at: daysAgo(1) },
    { id: 'fpl-real-007', fan_id: 'f-007', points: 10, type: 'earn', source: '完成拜访', description: '完成 Just Smoke Vape 拜访', created_at: daysAgo(2) },
    { id: 'fpl-real-008', fan_id: 'f-007', points: 5, type: 'earn', source: '签到奖励', description: '连续签到7天 +5', created_at: daysAgo(3) },
    { id: 'fpl-real-009', fan_id: 'f-004', points: 30, type: 'earn', source: '推荐新粉丝', description: '推荐 3 位新粉丝注册', created_at: daysAgo(3) },
    { id: 'fpl-real-010', fan_id: 'f-004', points: 5, type: 'earn', source: '扫码积分', description: 'KOKO 扫码 x5', created_at: daysAgo(4) },
    { id: 'fpl-real-011', fan_id: 'f-001', points: 30, type: 'earn', source: '推荐新粉丝', description: '推荐 rabie alkayf 升级为 A 级门店', created_at: daysAgo(5) },
    { id: 'fpl-real-012', fan_id: 'f-003', points: 10, type: 'earn', source: '完成拜访', description: '完成门店拜访 s-real-003', created_at: daysAgo(4) },
    { id: 'fpl-real-013', fan_id: 'f-003', points: 5, type: 'earn', source: '签到奖励', description: '每日签到 +5', created_at: daysAgo(5) },
    { id: 'fpl-real-014', fan_id: 'f-006', points: 5, type: 'earn', source: '扫码积分', description: 'G4 Pod 扫码 x3', created_at: daysAgo(6) },
    { id: 'fpl-real-015', fan_id: 'f-007', points: 30, type: 'redeem', source: '兑换奖励', description: '兑换 UWELLCare 礼品包', created_at: daysAgo(7) },
    { id: 'fpl-real-016', fan_id: 'f-002', points: 5, type: 'earn', source: '签到奖励', description: '每日签到 +5', created_at: daysAgo(7) }
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
    { id: 'm-001', name: 'UWELL Door Panel', sku: 'MT-DOOR-PANEL', category: 'Display', unit: 'pcs', unit_cost: 5.0, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-002', name: 'UWELL Sticker', sku: 'MT-STICKER', category: 'Promotional', unit: 'pcs', unit_cost: 0.5, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-003', name: 'UWELL Lightbox', sku: 'MT-LIGHTBOX', category: 'Display', unit: 'pcs', unit_cost: 50.0, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-004', name: 'UWELL Acrylic Stand', sku: 'MT-ACRYLIC-STAND', category: 'Display', unit: 'pcs', unit_cost: 30.0, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-005', name: 'UWELL Poster A2', sku: 'MT-POSTER-A2', category: 'Promotional', unit: 'pcs', unit_cost: 2.0, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-006', name: 'UWELL Product Catalog', sku: 'MT-CATALOG', category: 'Promotional', unit: 'pcs', unit_cost: 1.5, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-007', name: 'UWELL Staff Vest', sku: 'MT-VEST', category: 'Uniform', unit: 'pcs', unit_cost: 25.0, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
    { id: 'm-008', name: 'UWELL Sample Pod', sku: 'MT-SAMPLE-POD', category: 'Sample', unit: 'pcs', unit_cost: 3.0, image_url: '', created_at: daysAgo(90), updated_at: daysAgo(90) },
  ],

  // ============ 物料库存 ============
  material_stocks: [
    { id: 'ms-001', material_id: 'm-001', warehouse: 'Default', qty: 350, safety_stock: 100, created_at: daysAgo(90), updated_at: daysAgo(5) },
    { id: 'ms-002', material_id: 'm-002', warehouse: 'Default', qty: 1200, safety_stock: 500, created_at: daysAgo(90), updated_at: daysAgo(8) },
    { id: 'ms-003', material_id: 'm-003', warehouse: 'Default', qty: 12, safety_stock: 20, created_at: daysAgo(90), updated_at: daysAgo(8) },
    { id: 'ms-004', material_id: 'm-004', warehouse: 'Default', qty: 25, safety_stock: 15, created_at: daysAgo(90), updated_at: daysAgo(10) },
    { id: 'ms-005', material_id: 'm-005', warehouse: 'Default', qty: 800, safety_stock: 200, created_at: daysAgo(90), updated_at: daysAgo(3) },
    { id: 'ms-006', material_id: 'm-006', warehouse: 'Default', qty: 8, safety_stock: 50, created_at: daysAgo(90), updated_at: daysAgo(2) },
    { id: 'ms-007', material_id: 'm-007', warehouse: 'Default', qty: 45, safety_stock: 30, created_at: daysAgo(90), updated_at: daysAgo(10) },
    { id: 'ms-008', material_id: 'm-008', warehouse: 'Default', qty: 300, safety_stock: 100, created_at: daysAgo(90), updated_at: daysAgo(3) },
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
    { id: 'se-real-001', store_id: 's-real-012', eval_date: dateAgo(2), score_sales: 9, score_display: 9, score_location: 9, score_cooperation: 8, score_expansion: 8, score_appearance: 9, total_score: 52, recommended_level: 'A', evaluator_id: 'u-manager', notes: 'A-level flagship. Strong UWELL shelf presence, G4 PRO best seller, staff knowledgeable about pod systems. Premium location in Azizia.', created_at: daysAgo(2), updated_at: daysAgo(2) },
    { id: 'se-real-002', store_id: 's-real-013', eval_date: dateAgo(3), score_sales: 8, score_display: 9, score_location: 8, score_cooperation: 9, score_expansion: 7, score_appearance: 8, total_score: 49, recommended_level: 'A', evaluator_id: 'u-manager', notes: 'A-level store. Abraj Alkhalij - great display, cooperative owner. G5 moving 10+ units/month.', created_at: daysAgo(3), updated_at: daysAgo(3) },
    { id: 'se-real-003', store_id: 's-real-014', eval_date: dateAgo(4), score_sales: 9, score_display: 8, score_location: 9, score_cooperation: 8, score_expansion: 8, score_appearance: 9, total_score: 51, recommended_level: 'A', evaluator_id: 'u-manager', notes: 'A-level. Eunwan Almizaj - high foot traffic, strong UWELL presence. Staff well trained on G4 PRO.', created_at: daysAgo(4), updated_at: daysAgo(4) },
    { id: 'se-real-004', store_id: 's-real-032', eval_date: dateAgo(5), score_sales: 10, score_display: 9, score_location: 10, score_cooperation: 9, score_expansion: 9, score_appearance: 9, total_score: 56, recommended_level: 'A', evaluator_id: 'u-manager', notes: 'A-level flagship. Just Smoke Vape - top performer. G5 demo events drive sales. Premium vape destination.', created_at: daysAgo(5), updated_at: daysAgo(5) },
    { id: 'se-real-005', store_id: 's-real-035', eval_date: dateAgo(6), score_sales: 9, score_display: 9, score_location: 9, score_cooperation: 8, score_expansion: 8, score_appearance: 8, total_score: 51, recommended_level: 'A', evaluator_id: 'u-manager', notes: 'A-level. Fata Najd 4 - strong sales, excellent display. KOKO and G4 PRO both moving well.', created_at: daysAgo(6), updated_at: daysAgo(6) },
    { id: 'se-real-006', store_id: 's-real-036', eval_date: dateAgo(7), score_sales: 8, score_display: 8, score_location: 9, score_cooperation: 9, score_expansion: 7, score_appearance: 8, total_score: 49, recommended_level: 'A', evaluator_id: 'u-manager', notes: 'A-level. Husam - very cooperative owner, UWELL-first policy. Pod attach rate 65%.', created_at: daysAgo(7), updated_at: daysAgo(7) },
    { id: 'se-real-007', store_id: 's-real-039', eval_date: dateAgo(8), score_sales: 9, score_display: 9, score_location: 8, score_cooperation: 8, score_expansion: 8, score_appearance: 9, total_score: 51, recommended_level: 'A', evaluator_id: 'u-manager', notes: 'A-level. Al-kaif al-fakhir - premium store, lightbox installed, G5 best seller.', created_at: daysAgo(8), updated_at: daysAgo(8) },
    { id: 'se-real-008', store_id: 's-real-001', eval_date: dateAgo(9), score_sales: 6, score_display: 7, score_location: 7, score_cooperation: 7, score_expansion: 6, score_appearance: 7, total_score: 40, recommended_level: 'B', evaluator_id: 'u-rep2', notes: 'B-level. Rabie Alkayf - improving after display makeover. G4 PRO 8-12 units/month. Upgraded to A next quarter target.', created_at: daysAgo(9), updated_at: daysAgo(9) },
    { id: 'se-real-009', store_id: 's-real-003', eval_date: dateAgo(10), score_sales: 7, score_display: 6, score_location: 7, score_cooperation: 6, score_expansion: 6, score_appearance: 6, total_score: 38, recommended_level: 'B', evaluator_id: 'u-rep3', notes: 'B-level. Mizaj Almashhur - steady performer. Pods selling 30-50/month. Display needs refresh.', created_at: daysAgo(10), updated_at: daysAgo(10) },
    { id: 'se-real-010', store_id: 's-real-007', eval_date: dateAgo(11), score_sales: 6, score_display: 7, score_location: 7, score_cooperation: 7, score_expansion: 6, score_appearance: 7, total_score: 40, recommended_level: 'B', evaluator_id: 'u-rep1', notes: 'B-level. Amwaj Oasis - lightbox installed, new fan registered. Growing community presence.', created_at: daysAgo(11), updated_at: daysAgo(11) },
    { id: 'se-real-011', store_id: 's-real-010', eval_date: dateAgo(12), score_sales: 6, score_display: 6, score_location: 6, score_cooperation: 7, score_expansion: 5, score_appearance: 6, total_score: 36, recommended_level: 'B', evaluator_id: 'u-rep2', notes: 'B-level. Aemidat Alnakhil - G5 demo well received. Owner interested in upgrade program.', created_at: daysAgo(12), updated_at: daysAgo(12) },
    { id: 'se-real-012', store_id: 's-real-025', eval_date: dateAgo(13), score_sales: 5, score_display: 6, score_location: 6, score_cooperation: 6, score_expansion: 5, score_appearance: 6, total_score: 34, recommended_level: 'B', evaluator_id: 'u-rep3', notes: 'B-level. Mood House - decent sales, needs more POSM. KOKO gaining traction.', created_at: daysAgo(13), updated_at: daysAgo(13) },
    { id: 'se-real-013', store_id: 's-real-027', eval_date: dateAgo(14), score_sales: 6, score_display: 5, score_location: 6, score_cooperation: 6, score_expansion: 5, score_appearance: 5, total_score: 33, recommended_level: 'B', evaluator_id: 'u-rep1', notes: 'B-level. Mizaj Eali - average performer. Suggested lightbox to boost visibility.', created_at: daysAgo(14), updated_at: daysAgo(14) },
    { id: 'se-real-014', store_id: 's-real-002', eval_date: dateAgo(15), score_sales: 4, score_display: 4, score_location: 5, score_cooperation: 5, score_expansion: 3, score_appearance: 4, total_score: 25, recommended_level: 'C', evaluator_id: 'u-rep2', notes: 'C-level. Muteat - small store, G4 pods often out of stock. Needs inventory support.', created_at: daysAgo(15), updated_at: daysAgo(15) },
    { id: 'se-real-015', store_id: 's-real-005', eval_date: dateAgo(16), score_sales: 3, score_display: 4, score_location: 4, score_cooperation: 5, score_expansion: 3, score_appearance: 4, total_score: 23, recommended_level: 'C', evaluator_id: 'u-rep3', notes: 'C-level. Rihlat Zaman - competitor heavy. Vaporesso dominating shelf. Needs display reset.', created_at: daysAgo(16), updated_at: daysAgo(16) }
  ],

  // ============ 活动 ============
  campaigns: [
    { id: 'ca-real-001', name: 'G5 Launch Promotion', type: '新品上市', start_date: dateAgo(20), end_date: dateAgo(5), status: 'completed', description: 'G5 flagship device launch campaign targeting A-level stores. Demo events, staff training, and POSM rollout. Goal: establish G5 as premium pod system in market.', target_stores: ['s-real-012', 's-real-013', 's-real-014', 's-real-032', 's-real-035', 's-real-036', 's-real-039'], budget: 25000, actual_cost: 21800, created_at: daysAgo(25), updated_at: daysAgo(5) },
    { id: 'ca-real-002', name: 'Ramadan Vape Giveaway', type: '节日营销', start_date: dateAgo(15), end_date: dateAgo(2), status: 'completed', description: 'Ramadan holiday promotion: buy 2 G4 devices get 1 pod free. QR scan earns double points. Covered A and B level stores across Riyadh.', target_stores: ['s-real-012', 's-real-013', 's-real-014', 's-real-032', 's-real-035', 's-real-036', 's-real-039', 's-real-001', 's-real-003', 's-real-004', 's-real-006', 's-real-007', 's-real-008', 's-real-010', 's-real-011'], budget: 18000, actual_cost: 16500, created_at: daysAgo(20), updated_at: daysAgo(2) },
    { id: 'ca-real-003', name: 'Store Display Upgrade Program', type: '渠道建设', start_date: dateAgo(10), end_date: dateAgo(-20), status: 'ongoing', description: 'Provide UWELL lightbox + acrylic stand to top 20 stores. Goal: increase shelf visibility and brand presence. Stores with lightbox sell 2.3x more.', target_stores: ['s-real-012', 's-real-013', 's-real-014', 's-real-032', 's-real-035', 's-real-036', 's-real-039', 's-real-001', 's-real-003', 's-real-004', 's-real-006', 's-real-007', 's-real-008', 's-real-010', 's-real-011', 's-real-016', 's-real-020', 's-real-022', 's-real-024', 's-real-025'], budget: 30000, actual_cost: 14200, created_at: daysAgo(15), updated_at: daysAgo(1) },
    { id: 'ca-real-004', name: 'WhatsApp Community Build', type: '社群运营', start_date: dateAgo(30), end_date: dateAgo(-60), status: 'ongoing', description: 'Add all store owners and key staff to UWELL WhatsApp groups. Daily G5 tips, coil care guides, and competitor intel sharing. Build loyal community.', target_stores: ['s-real-012', 's-real-013', 's-real-014', 's-real-032', 's-real-035', 's-real-036', 's-real-039', 's-real-001', 's-real-003', 's-real-004', 's-real-006', 's-real-007', 's-real-008', 's-real-010', 's-real-011', 's-real-016', 's-real-020', 's-real-022', 's-real-024', 's-real-025', 's-real-026', 's-real-027', 's-real-029', 's-real-030', 's-real-002', 's-real-005', 's-real-009', 's-real-015', 's-real-017'], budget: 5000, actual_cost: 1200, created_at: daysAgo(35), updated_at: daysAgo(0) },
    { id: 'ca-real-005', name: 'Summer Pod Promotion', type: '促销活动', start_date: dateAgo(3), end_date: dateAgo(-25), status: 'ongoing', description: 'Discount on G4 pods (12 SAR instead of 15) targeting B/C stores. Drive pod attach rate and recruit new UWELL users. Bundle KOKO device with pod multipack.', target_stores: ['s-real-001', 's-real-003', 's-real-004', 's-real-006', 's-real-007', 's-real-008', 's-real-010', 's-real-011', 's-real-016', 's-real-020', 's-real-022', 's-real-024', 's-real-025', 's-real-026', 's-real-027', 's-real-029', 's-real-030', 's-real-002', 's-real-005', 's-real-009', 's-real-015', 's-real-017', 's-real-018', 's-real-019', 's-real-021', 's-real-023', 's-real-028'], budget: 12000, actual_cost: 3200, created_at: daysAgo(8), updated_at: daysAgo(1) }
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
  campaign_claims: [
    { id: "cc-001", store_id: "s-real-001", campaign_id: "ca-real-001", status: "completed", materials_used: 25, effect: "good", feedback: "Customer engagement increased significantly", claimed_at: daysAgo(30), reviewed_at: daysAgo(28) },
    { id: "cc-002", store_id: "s-real-005", campaign_id: "ca-real-002", status: "pending", materials_used: 0, effect: "pending", feedback: "", claimed_at: daysAgo(5), reviewed_at: null },
    { id: "cc-003", store_id: "s-real-012", campaign_id: "ca-real-002", status: "in_progress", materials_used: 10, effect: "good", feedback: "Products are selling well", claimed_at: daysAgo(15), reviewed_at: null },
    { id: "cc-004", store_id: "s-real-020", campaign_id: "ca-real-003", status: "completed", materials_used: 50, effect: "great", feedback: "Best campaign so far, sold out in 3 days", claimed_at: daysAgo(45), reviewed_at: daysAgo(42) },
    { id: "cc-005", store_id: "s-real-008", campaign_id: "ca-real-001", status: "cancelled", materials_used: 0, effect: "none", feedback: "Store declined participation", claimed_at: daysAgo(20), reviewed_at: daysAgo(18) },
  ],
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
    { id: 'qr-real-001', product_id: 'p-001', code: 'QR-G4PRO-001', store_id: 's-real-012', points: 5, scan_count: 86, is_active: true, created_at: daysAgo(45), updated_at: daysAgo(1) },
    { id: 'qr-real-002', product_id: 'p-004', code: 'QR-G5-001', store_id: 's-real-032', points: 5, scan_count: 64, is_active: true, created_at: daysAgo(40), updated_at: daysAgo(1) },
    { id: 'qr-real-003', product_id: 'p-003', code: 'QR-G4-001', store_id: 's-real-001', points: 5, scan_count: 52, is_active: true, created_at: daysAgo(38), updated_at: daysAgo(2) },
    { id: 'qr-real-004', product_id: 'p-005', code: 'QR-KOKO-001', store_id: 's-real-007', points: 5, scan_count: 41, is_active: true, created_at: daysAgo(35), updated_at: daysAgo(2) },
    { id: 'qr-real-005', product_id: 'p-006', code: 'QR-PODG4-001', store_id: 's-real-014', points: 5, scan_count: 73, is_active: true, created_at: daysAgo(30), updated_at: daysAgo(1) },
    { id: 'qr-real-006', product_id: 'p-007', code: 'QR-PODG5-001', store_id: 's-real-035', points: 5, scan_count: 38, is_active: true, created_at: daysAgo(28), updated_at: daysAgo(3) },
    { id: 'qr-real-007', product_id: 'p-008', code: 'QR-PODKOKO-001', store_id: 's-real-025', points: 5, scan_count: 29, is_active: true, created_at: daysAgo(25), updated_at: daysAgo(2) },
    { id: 'qr-real-008', product_id: 'p-001', code: 'QR-G4PRO-002', store_id: 's-real-039', points: 5, scan_count: 47, is_active: true, created_at: daysAgo(22), updated_at: daysAgo(1) },
    { id: 'qr-real-009', product_id: 'p-004', code: 'QR-G5-002', store_id: 's-real-013', points: 5, scan_count: 33, is_active: true, created_at: daysAgo(20), updated_at: daysAgo(2) },
    { id: 'qr-real-010', product_id: 'p-003', code: 'QR-G4-002', store_id: 's-real-027', points: 5, scan_count: 21, is_active: true, created_at: daysAgo(18), updated_at: daysAgo(3) },
    { id: 'qr-real-011', product_id: 'p-005', code: 'QR-KOKO-002', store_id: 's-real-009', points: 5, scan_count: 18, is_active: true, created_at: daysAgo(15), updated_at: daysAgo(4) },
    { id: 'qr-real-012', product_id: 'p-006', code: 'QR-PODG4-002', store_id: 's-real-036', points: 5, scan_count: 55, is_active: true, created_at: daysAgo(12), updated_at: daysAgo(1) }
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

  // ============ 社区动态 ============
  community_posts: [
    { id: 'cp-real-001', author_name: 'Robin C.', content: 'Just completed G5 training for 5 store owners in Riyadh! Great engagement 🚀', category: 'Event', likes: 24, created_at: daysAgo(1) },
    { id: 'cp-real-002', author_name: 'Ahmed K.', content: 'Competitor watch: OXVA Xlim Pro launching new colors next week. We need to push G4 PRO\'s coil advantage.', category: 'Discussion', likes: 18, created_at: daysAgo(2) },
    { id: 'cp-real-003', author_name: 'Salem M.', content: 'Store upgrade: rabie alkayf went from B to A after display makeover! Sales up 40% 🎉', category: 'Event', likes: 31, created_at: daysAgo(3) },
    { id: 'cp-real-004', author_name: 'Khalid R.', content: 'Ramadan campaign results: 320 devices sold, 85 stores participated, 15 new fans registered. Great team effort! 💪', category: 'Share', likes: 42, created_at: daysAgo(4) },
    { id: 'cp-real-005', author_name: 'Fatima A.', content: 'Pod shortage alert: G4 pods running low at 12 stores. Need urgent restock from distributor.', category: 'Discussion', likes: 12, created_at: daysAgo(5) },
    { id: 'cp-real-006', author_name: 'Robin C.', content: 'Best practice: Stores with UWELL lightbox sell 2.3x more than stores without. Push POSM installation! 💡', category: 'Share', likes: 28, created_at: daysAgo(6) },
    { id: 'cp-real-007', author_name: 'Ahmed K.', content: 'Question: What\'s the best way to handle stores that only stock competitor products?', category: 'Question', likes: 9, created_at: daysAgo(7) },
    { id: 'cp-real-008', author_name: 'Salem M.', content: 'G5 demo event at Just Smoke Vape was a hit! 20+ customers tried the device, 8 purchased on spot. 🔥', category: 'Event', likes: 35, created_at: daysAgo(8) },
    { id: 'cp-real-009', author_name: 'Khalid R.', content: 'Welcome our newest fan from Amwaj Oasis! First scan earned 5 points 🎉', category: 'Event', likes: 15, created_at: daysAgo(10) },
    { id: 'cp-real-010', author_name: 'Fatima A.', content: 'Monthly KPI review: 80 stores covered, 41 active, 7 VIP (A-level). Need to push 10 more to A-level by Q3.', category: 'Discussion', likes: 22, created_at: daysAgo(12) },
    { id: 'cp-real-011', author_name: 'Robin C.', content: 'Tip: When demonstrating G5, always highlight the Pro-FOCS flavor tech. Customers feel the difference instantly.', category: 'Share', likes: 19, created_at: daysAgo(14) },
    { id: 'cp-real-012', author_name: 'Ahmed K.', content: 'WhatsApp community now has 60+ store owners! Daily engagement is paying off - restock requests coming in proactively.', category: 'Discussion', likes: 26, created_at: daysAgo(16) }
  ],

  // ============ 动态评论 ============
  community_comments: [
    { id: 'cc-real-001', post_id: 'cp-real-001', author_name: 'Ahmed K.', content: 'Amazing! Which stores? I want to follow up with demo units.', created_at: daysAgo(1) },
    { id: 'cc-real-002', post_id: 'cp-real-001', author_name: 'Khalid R.', content: 'Great work team 💪 G5 will be a game changer.', created_at: daysAgo(1) },
    { id: 'cc-real-003', post_id: 'cp-real-002', author_name: 'Salem M.', content: 'Agreed. G4 PRO coil lasts 30% longer. That\'s our key talking point.', created_at: daysAgo(2) },
    { id: 'cc-real-004', post_id: 'cp-real-002', author_name: 'Fatima A.', content: 'I will update the competitor matrix and share with all reps.', created_at: daysAgo(2) },
    { id: 'cc-real-005', post_id: 'cp-real-003', author_name: 'Robin C.', content: 'This is the model! Lightbox + training = results.', created_at: daysAgo(3) },
    { id: 'cc-real-006', post_id: 'cp-real-003', author_name: 'Khalid R.', content: 'Can we replicate this at 5 more B-level stores?', created_at: daysAgo(3) },
    { id: 'cc-real-007', post_id: 'cp-real-004', author_name: 'Ahmed K.', content: 'Exceeded target by 15%. Ramadan timing was perfect.', created_at: daysAgo(4) },
    { id: 'cc-real-008', post_id: 'cp-real-004', author_name: 'Salem M.', content: '15 new fans in one campaign - community is growing!', created_at: daysAgo(4) },
    { id: 'cc-real-009', post_id: 'cp-real-005', author_name: 'Robin C.', content: 'On it. Coordinating with distributor today, delivery Thursday.', created_at: daysAgo(5) },
    { id: 'cc-real-010', post_id: 'cp-real-006', author_name: 'Fatima A.', content: 'Data speaks! Adding lightbox to Q3 budget request.', created_at: daysAgo(6) },
    { id: 'cc-real-011', post_id: 'cp-real-006', author_name: 'Khalid R.', content: 'Just installed 3 more this week. Owners love the premium look.', created_at: daysAgo(6) },
    { id: 'cc-real-012', post_id: 'cp-real-007', author_name: 'Salem M.', content: 'Leave samples + catalog, then follow up weekly. Patience wins.', created_at: daysAgo(7) },
    { id: 'cc-real-013', post_id: 'cp-real-007', author_name: 'Robin C.', content: 'Offer consignment stock for first month - lowers their risk.', created_at: daysAgo(7) },
    { id: 'cc-real-014', post_id: 'cp-real-008', author_name: 'Ahmed K.', content: '8 on-spot purchases! Conversion rate is solid.', created_at: daysAgo(8) },
    { id: 'cc-real-015', post_id: 'cp-real-008', author_name: 'Fatima A.', content: 'Planning 3 more demo events at A-level stores next month.', created_at: daysAgo(8) },
    { id: 'cc-real-016', post_id: 'cp-real-009', author_name: 'Khalid R.', content: 'Welcome to the UWELL family! 🎉', created_at: daysAgo(10) },
    { id: 'cc-real-017', post_id: 'cp-real-010', author_name: 'Salem M.', content: '10 to A-level is ambitious but doable. Focus on display upgrades.', created_at: daysAgo(12) },
    { id: 'cc-real-018', post_id: 'cp-real-010', author_name: 'Robin C.', content: 'I have 3 B-level stores ready to upgrade. Will push hard this quarter.', created_at: daysAgo(12) },
    { id: 'cc-real-019', post_id: 'cp-real-011', author_name: 'Ahmed K.', content: 'Pro-FOCS is our secret weapon. Customers notice instantly.', created_at: daysAgo(14) },
    { id: 'cc-real-020', post_id: 'cp-real-012', author_name: 'Fatima A.', content: '60+ owners! The daily tips are really driving engagement.', created_at: daysAgo(16) }
  ],
};

export default seedData;
