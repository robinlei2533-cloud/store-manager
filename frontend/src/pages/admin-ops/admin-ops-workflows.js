import localDb from '../../services/db/localDb';

const WAREHOUSE_ALIASES = {
  Riyadh: ['Riyadh', 'Riyadh Warehouse'],
  Dammam: ['Dammam', 'Dammam Warehouse'],
  Jeddah: ['Jeddah', 'Jeddah Warehouse'],
};

export function writeOpsAudit({ action, targetTable, targetId, before = null, after = null, note = '', actor = 'trial-admin' }) {
  return localDb.insert('audit_logs', {
    module: 'admin_ops',
    action,
    actor,
    target_table: targetTable,
    target_id: targetId,
    note,
    before,
    after,
    created_at: new Date().toISOString(),
  });
}

export function normalizeReviewStatus(value) {
  if (['open', 'pending', 'pending_review', 'review_pending'].includes(value)) return 'Pending';
  if (['need_more_info', 'changes_required', 'needs_update'].includes(value)) return 'Need More Info';
  if (['escalated', 'suspicious', 'duplicate'].includes(value)) return 'Escalated';
  if (value === 'approved') return 'Approved';
  if (value === 'rejected') return 'Rejected';
  return value || 'Pending';
}

export function buildReviewRows() {
  const campaigns = (localDb.all('campaigns') || [])
    .filter((item) => item.source === 'store_application' && !['approved', 'rejected'].includes(item.approval_status || item.review_status))
    .map((item) => ({
      key: `campaign-${item.id}`,
      sourceTable: 'campaigns',
      sourceId: item.id,
      category: 'Campaigns',
      type: 'Store-created campaign',
      target: item.name,
      owner: `Store: ${item.submitted_by_store_name || item.store_name || item.submitted_by_store_id}`,
      priority: item.uwell_support_requested ? 'High' : 'Medium',
      status: normalizeReviewStatus(item.review_status || item.approval_status),
      nextStep: 'Confirm store cost responsibility, requested points support, and fan visibility.',
    }));

  const materials = (localDb.all('material_requests') || [])
    .filter((item) => ['pending', 'need_more_info', 'escalated'].includes(item.status))
    .map((item) => ({
      key: `material-${item.id}`,
      sourceTable: 'material_requests',
      sourceId: item.id,
      category: 'Materials',
      type: 'Material request',
      target: `${item.material_name || item.material_id} x ${item.qty || 1}`,
      owner: `Store: ${item.store_name || item.store_id} / ${item.warehouse || item.region || 'Regional warehouse'}`,
      priority: item.priority === 'high' ? 'High' : 'Medium',
      status: normalizeReviewStatus(item.status),
      nextStep: 'Check regional warehouse stock, approve/reject, and write Audit Log.',
    }));

  const photos = (localDb.all('store_display_uploads') || [])
    .filter((item) => ['pending', 'needs_update', 'escalated'].includes(item.status))
    .map((item) => ({
      key: `photo-${item.id}`,
      sourceTable: 'store_display_uploads',
      sourceId: item.id,
      category: 'Photos',
      type: item.category === 'store_front_photo' ? 'Store Front Photo' : 'Display photo',
      target: item.store_name || item.store_id,
      owner: `Store: ${item.store_name || item.store_id}`,
      priority: item.category === 'store_front_photo' ? 'High' : 'Medium',
      status: normalizeReviewStatus(item.status),
      nextStep: item.category === 'store_front_photo'
        ? 'Check storefront/signboard clarity before showing it to fans on map.'
        : 'Check display quality for S/A/B/C level review.',
    }));

  const rewards = (localDb.all('mall_redemptions') || [])
    .filter((item) => ['pending_review', 'review_pending', 'need_more_info', 'escalated'].includes(item.review_status || item.status))
    .map((item) => ({
      key: `reward-${item.id}`,
      sourceTable: 'mall_redemptions',
      sourceId: item.id,
      category: 'Rewards',
      type: 'High-value reward',
      target: item.item_name || item.reward_name || item.item_id,
      owner: `Fan: ${item.fan_name || item.fan_id}`,
      priority: 'High',
      status: normalizeReviewStatus(item.review_status || item.status),
      nextStep: 'Validate fan level, available points, points source, and pickup method.',
    }));

  const storeLevels = (localDb.all('store_evaluations') || [])
    .filter((item) => !['reviewed', 'approved', 'rejected'].includes(item.review_status || item.status))
    .map((item) => ({
      key: `store-level-${item.id}`,
      sourceTable: 'store_evaluations',
      sourceId: item.id,
      category: 'Store Levels',
      type: 'Store rating review',
      target: item.stores?.name || item.store_name || item.store_id,
      owner: `Suggested: ${item.recommended_level || item.suggested_level || '-'} / Score: ${item.total_score || item.score || '-'}`,
      priority: ['S', 'A'].includes(item.recommended_level || item.suggested_level) ? 'High' : 'Medium',
      status: normalizeReviewStatus(item.review_status || item.status || 'pending'),
      nextStep: 'Manager reviews field score; Admin confirms final S/A/B/C level with reason.',
    }));

  const visits = (localDb.all('visits') || [])
    .filter((item) => (
      ['pending_review', 'submitted', 'submitted_for_review', 'manager_admin_review'].includes(item.status)
      || ['submitted_for_review', 'manager_admin_review'].includes(item.suggested_level_status)
      || (item.suggested_level && item.suggested_level !== item.final_level)
    ))
    .map((item) => ({
      key: `visit-${item.id}`,
      sourceTable: 'visits',
      sourceId: item.id,
      category: 'Visits',
      type: ['new', 'new_store'].includes(item.visit_type) || item.new_store_profile?.store_name ? 'New store visit' : 'Repeat visit',
      target: item.store_name || item.stores?.name || item.new_store_profile?.store_name || item.store_id,
      owner: `Rep: ${item.rep_name || item.profiles?.name || item.rep_id || '-'} / Suggested: ${item.suggested_level || item.suggested_store_level || '-'}`,
      priority: ['S', 'A'].includes(item.suggested_level || item.suggested_store_level) ? 'High' : 'Medium',
      status: normalizeReviewStatus(item.review_status || item.suggested_level_status || item.status || 'pending'),
      nextStep: 'Review evidence, suggested level, display data, and next action from the field visit.',
    }));

  const verificationRisks = (localDb.all('store_activity_verifications') || [])
    .filter((item) => item.status === 'duplicate' || item.requires_backend_review || ['pending', 'escalated'].includes(item.risk_review_status))
    .map((item) => ({
      key: `verification-${item.id}`,
      sourceTable: 'store_activity_verifications',
      sourceId: item.id,
      category: 'Scan Risks',
      type: 'Store verification risk',
      target: item.fan_identifier,
      owner: `Store: ${item.store_name || item.store_id}`,
      priority: 'High',
      status: normalizeReviewStatus(item.risk_review_status || item.status),
      nextStep: 'Review duplicate activity verification before points are released.',
    }));

  const community = (localDb.all('fan_complaints') || [])
    .filter((item) => ['open', 'pending', 'need_more_info', 'escalated'].includes(item.status))
    .map((item) => ({
      key: `community-${item.id}`,
      sourceTable: 'fan_complaints',
      sourceId: item.id,
      category: 'Community',
      type: 'Fan complaint / community report',
      target: item.fan_name || item.fan_id,
      owner: `Store: ${item.store_name || item.store_id || '-'} / ${item.content || 'Complaint waiting for reply'}`,
      priority: item.status === 'escalated' ? 'High' : 'Medium',
      status: normalizeReviewStatus(item.review_status || item.status || 'pending'),
      nextStep: 'Reply, request more information, escalate, or close the fan-facing issue.',
    }));

  return [...campaigns, ...materials, ...photos, ...rewards, ...storeLevels, ...visits, ...verificationRisks, ...community];
}

export function getReviewCounters(rows = buildReviewRows()) {
  return {
    pending: rows.filter((row) => row.status === 'Pending').length,
    highPriority: rows.filter((row) => row.priority === 'High').length,
    needMoreInfo: rows.filter((row) => row.status === 'Need More Info').length,
    escalated: rows.filter((row) => row.status === 'Escalated').length,
  };
}

export function applyReviewAction(row, action, note = '') {
  const record = localDb.findById(row.sourceTable, row.sourceId);
  if (!record) throw new Error('Review record not found');

  const patchByAction = {
    approve: { review_status: 'approved', approved_at: new Date().toISOString(), reviewed_by: 'trial-admin' },
    reject: { review_status: 'rejected', rejected_at: new Date().toISOString(), reviewed_by: 'trial-admin' },
    need_more_info: { review_status: 'need_more_info', info_requested_at: new Date().toISOString(), reviewed_by: 'trial-admin' },
    escalate: { review_status: 'escalated', escalated_at: new Date().toISOString(), reviewed_by: 'trial-admin' },
    note: { review_note: note || 'Admin note added', reviewed_by: 'trial-admin' },
  }[action];

  let patch = { ...patchByAction, review_note: note || record.review_note || '' };

  if (row.sourceTable === 'campaigns') {
    patch = {
      ...patch,
      approval_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : record.approval_status || 'pending',
      fan_visible: action === 'approve' ? true : action === 'reject' ? false : record.fan_visible,
      status: action === 'approve' ? 'ongoing' : record.status,
    };
  }

  if (row.sourceTable === 'material_requests') {
    patch = {
      ...patch,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'need_more_info' ? 'need_more_info' : action === 'escalate' ? 'escalated' : record.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'trial-admin',
    };
  }

  if (row.sourceTable === 'store_display_uploads') {
    patch = {
      ...patch,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'need_more_info' ? 'needs_update' : action === 'escalate' ? 'escalated' : record.status,
      fan_map_eligible: action === 'approve' && record.category === 'store_front_photo',
    };
  }

  if (row.sourceTable === 'mall_redemptions') {
    patch = {
      ...patch,
      review_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : patch.review_status,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : record.status,
    };
  }

  if (row.sourceTable === 'store_activity_verifications') {
    patch = {
      ...patch,
      risk_review_status: action === 'approve' ? 'cleared' : action === 'reject' ? 'rejected' : patch.review_status,
      points_award_status: action === 'approve' ? 'ready_for_release' : action === 'reject' ? 'blocked' : record.points_award_status,
      requires_backend_review: !['approve', 'reject'].includes(action),
    };
  }

  if (row.sourceTable === 'store_evaluations') {
    const finalLevel = record.recommended_level || record.suggested_level || record.final_level || 'C';
    patch = {
      ...patch,
      review_status: action === 'approve' ? 'reviewed' : action === 'reject' ? 'rejected' : action === 'need_more_info' ? 'needs_more_evidence' : patch.review_status,
      backend_final_level: action === 'approve' ? finalLevel : record.backend_final_level,
      final_level: action === 'approve' ? finalLevel : record.final_level,
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'trial-admin',
    };
    if (action === 'approve' && record.store_id && localDb.findById('stores', record.store_id)) {
      localDb.update('stores', record.store_id, {
        level: finalLevel,
        rating_status: 'reviewed',
        rating_reviewed_at: new Date().toISOString(),
        rating_reviewer_id: 'trial-admin',
      });
    }
  }

  if (row.sourceTable === 'visits') {
    patch = {
      ...patch,
      review_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : patch.review_status,
      level_review_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : record.level_review_status,
      suggested_level_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'need_more_info' ? 'needs_more_evidence' : action === 'escalate' ? 'escalated' : record.suggested_level_status,
      final_level: action === 'approve' ? (record.suggested_level || record.suggested_store_level || record.final_level) : record.final_level,
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'trial-admin',
    };
  }

  if (row.sourceTable === 'fan_complaints') {
    patch = {
      ...patch,
      status: action === 'approve' ? 'resolved' : action === 'reject' ? 'rejected' : action === 'need_more_info' ? 'need_more_info' : action === 'escalate' ? 'escalated' : record.status,
      reply: action === 'note' ? (note || record.reply || 'Admin note added') : record.reply,
      replied_at: ['approve', 'reject', 'note'].includes(action) ? new Date().toISOString() : record.replied_at,
      replied_by: 'trial-admin',
    };
  }

  const updated = localDb.update(row.sourceTable, row.sourceId, patch);
  writeOpsAudit({
    action: `review_${action}`,
    targetTable: row.sourceTable,
    targetId: row.sourceId,
    before: record,
    after: updated,
    note,
  });
  return updated;
}

export function generateScanCodeBatch({ count = 20, prefix = 'UWELL-G5', productId = 'p-004', codeType = 'product_unique', points = 5 } = {}) {
  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const records = Array.from({ length: count }, (_, index) => ({
    code_id: `${prefix}-${today}-${String(index + 1).padStart(4, '0')}`,
    product_id: productId,
    code: `${prefix}-${today}-${String(index + 1).padStart(4, '0')}-${localDb.uuid().slice(0, 6).toUpperCase()}`,
    code_signature: `trial-sig-${localDb.uuid().slice(0, 12)}`,
    code_type: codeType,
    status: 'unused',
    points,
    scan_count: 0,
    is_active: true,
    batch_no: `${prefix}-${today}`,
    batch_id: `${prefix}-${today}`,
    validator_source: 'admin_generated_trial_batch',
    decision_reason: 'Generated by backend Scan Codes module for trial validation.',
    anti_fraud_rule: 'Global one-time product claim; max 3 counted product scans per fan per day.',
  }));
  const created = localDb.insertBatch('qr_codes', records);
  writeOpsAudit({
    action: 'scan_code_batch_generated',
    targetTable: 'qr_codes',
    targetId: created[0]?.batch_id,
    after: { count: created.length, prefix, productId, codeType },
  });
  return created;
}

export function setScanCodeStatus(id, status, note = '') {
  const record = localDb.findById('qr_codes', id);
  if (!record) throw new Error('Scan code not found');
  const updated = localDb.update('qr_codes', id, {
    status,
    is_active: !['blocked', 'expired'].includes(status),
    blocked_reason: status === 'blocked' ? note || 'Blocked by backend review' : '',
  });
  writeOpsAudit({
    action: `scan_code_${status}`,
    targetTable: 'qr_codes',
    targetId: id,
    before: record,
    after: updated,
    note,
  });
  return updated;
}

export function reviewScanRecord(id, reviewStatus, note = '') {
  const record = localDb.findById('scan_records', id);
  if (!record) throw new Error('Scan record not found');
  const updated = localDb.update('scan_records', id, {
    review_status: reviewStatus,
    risk_status: reviewStatus === 'rejected' ? 'confirmed_fraud' : reviewStatus === 'cleared' ? 'cleared' : 'under_review',
    reviewed_by: 'trial-admin',
    reviewed_at: new Date().toISOString(),
    review_note: note,
  });
  writeOpsAudit({
    action: `scan_record_${reviewStatus}`,
    targetTable: 'scan_records',
    targetId: id,
    before: record,
    after: updated,
    note,
  });
  return updated;
}

export function findWarehouseStock(materialId, warehouse) {
  const stocks = localDb.all('material_stocks') || [];
  const normalizedWarehouse = warehouse || 'Riyadh Warehouse';
  const aliases = Object.values(WAREHOUSE_ALIASES).find((items) => items.includes(normalizedWarehouse)) || [normalizedWarehouse];
  return stocks.find((item) => item.material_id === materialId && aliases.includes(item.warehouse))
    || stocks.find((item) => item.material_id === materialId && item.warehouse === normalizedWarehouse)
    || stocks.find((item) => item.material_id === materialId && item.warehouse === 'Default');
}

export function approveMaterialRequest(requestId, action = 'approve', note = '') {
  const request = localDb.findById('material_requests', requestId);
  if (!request) throw new Error('Material request not found');

  if (action === 'reject') {
    const rejected = localDb.update('material_requests', requestId, {
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'trial-admin',
      review_note: note,
    });
    writeOpsAudit({ action: 'material_request_rejected', targetTable: 'material_requests', targetId: requestId, before: request, after: rejected, note });
    return rejected;
  }

  if (action === 'need_more_info') {
    const updated = localDb.update('material_requests', requestId, {
      status: 'need_more_info',
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'trial-admin',
      review_note: note || 'Please clarify the campaign/store display reason.',
    });
    writeOpsAudit({ action: 'material_request_need_more_info', targetTable: 'material_requests', targetId: requestId, before: request, after: updated, note });
    return updated;
  }

  if (['packed', 'shipped', 'delivered'].includes(action)) {
    const updated = localDb.update('material_requests', requestId, {
      status: action,
      logistics_status: action,
      reviewed_at: request.reviewed_at || new Date().toISOString(),
      reviewed_by: request.reviewed_by || 'trial-admin',
      review_note: note || request.review_note || '',
    });
    writeOpsAudit({ action: `material_request_${action}`, targetTable: 'material_requests', targetId: requestId, before: request, after: updated, note });
    return updated;
  }

  const alreadyReserved = request.status === 'approved'
    && ['reserved', 'packed', 'shipped', 'delivered'].includes(request.logistics_status);
  const existingOutbound = (localDb.all('material_outbound') || [])
    .find((item) => item.material_request_id === requestId);
  if (alreadyReserved || existingOutbound) {
    return request;
  }

  const stock = findWarehouseStock(request.material_id, request.warehouse);
  if (!stock) throw new Error('No warehouse stock record found for this material');
  if ((stock.qty || 0) < (request.qty || 0)) throw new Error(`Insufficient ${request.warehouse || stock.warehouse} stock`);

  return localDb.transaction((txnDb) => {
    const updatedStock = txnDb.update('material_stocks', stock.id, {
      qty: (stock.qty || 0) - (request.qty || 0),
    });
    const approved = txnDb.update('material_requests', requestId, {
      status: 'approved',
      logistics_status: 'reserved',
      stock_deducted_at: request.stock_deducted_at || new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'trial-admin',
      review_note: note,
    });
    const outbound = txnDb.insert('material_outbound', {
      material_id: request.material_id,
      qty: request.qty,
      applicant_id: request.requester_id || request.store_id,
      store_id: request.store_id,
      warehouse: request.warehouse || stock.warehouse,
      region: request.region,
      status: 'approved',
      reason: request.reason,
      material_request_id: request.id,
    });

    if ((updatedStock.qty || 0) <= (updatedStock.safety_stock || 0)) {
      txnDb.insert('warehouse_inventory_alerts', {
        material_id: request.material_id,
        warehouse: request.warehouse || stock.warehouse,
        region: request.region,
        qty: updatedStock.qty,
        safety_stock: updatedStock.safety_stock,
        status: 'open',
        message: `${request.material_name || request.material_id} is low in ${request.warehouse || stock.warehouse}.`,
      });
    }

    writeOpsAudit({
      action: 'material_request_approved_stock_reserved',
      targetTable: 'material_requests',
      targetId: requestId,
      before: request,
      after: { request: approved, stock: updatedStock, outbound },
      note,
    });
    return approved;
  });
}
