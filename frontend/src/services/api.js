// ============================================================
// API Layer — Barrel Re-export
// Auto-generated from api/*.js domain files
// ============================================================

export { getStores, getStoreById, createStore, updateStore, deleteStore } from './api/stores';
export { getVisits, getVisitById, createVisit, updateVisit, getVisitSales, upsertVisitSales, getVisitPhotos, uploadVisitPhoto, deleteVisitPhoto } from './api/visits';
export { getProducts, createProduct, updateProduct, deleteProduct } from './api/products';
export { getMaterials, createMaterial, updateMaterial, deleteMaterial, getMaterialStocks, updateMaterialStock, createInbound, getInbounds, createOutbound, getOutbounds, updateOutboundStatus } from './api/materials';
export { getFans, getFanById, getFanPointsLog, addFanPoints } from './api/fans';
export { getPointsRules, createPointsRule, updatePointsRule, deletePointsRule, getLevelRules, updateLevelRule } from './api/points';
export { getEvaluations, getEvaluationById, createEvaluation, updateEvaluation, deleteEvaluation } from './api/evaluations';
export { getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign, createCampaignTask, updateCampaignTask, deleteCampaignTask, createCampaignReport, updateCampaignReport } from './api/campaigns';
export { getQrCodes, createQrCode, updateQrCode, deleteQrCode, scanQrCode, getScanRecords } from './api/qrcodes';
export { getProfiles, updateProfile } from './api/profiles';
export { getDashboardStats, getVisitTrend, getStoreDistribution, getScanTrend, IS_LOCAL_MODE } from './api/dashboard';
