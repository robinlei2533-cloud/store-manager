import { beforeEach, describe, expect, test } from 'vitest';
import localDb from '../../services/db/localDb.js';
import { approveMaterialRequest } from './admin-ops-workflows.js';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('admin ops material request workflow', () => {
  beforeEach(() => {
    globalThis.localStorage = createMemoryStorage();
    localDb.reset({
      material_stocks: [
        {
          id: 'stock-riyadh-posters',
          material_id: 'poster-kit',
          material_name: 'Poster kit',
          warehouse: 'Riyadh Warehouse',
          region: 'Riyadh',
          qty: 5,
          safety_stock: 2,
        },
      ],
      material_requests: [
        {
          id: 'request-001',
          material_id: 'poster-kit',
          material_name: 'Poster kit',
          warehouse: 'Riyadh Warehouse',
          region: 'Riyadh',
          store_id: 'store-001',
          requester_id: 'store-owner-001',
          qty: 2,
          status: 'pending',
          reason: 'Campaign display setup',
        },
      ],
    });
  });

  test('approving an already reserved request does not deduct warehouse stock twice', () => {
    approveMaterialRequest('request-001', 'approve', 'Initial approval');
    approveMaterialRequest('request-001', 'approve', 'Duplicate click');

    const stock = localDb.findById('material_stocks', 'stock-riyadh-posters');
    const outbounds = localDb.find('material_outbound', (item) => item.material_request_id === 'request-001');
    const request = localDb.findById('material_requests', 'request-001');

    expect(stock.qty).toBe(3);
    expect(outbounds).toHaveLength(1);
    expect(request.status).toBe('approved');
    expect(request.logistics_status).toBe('reserved');
  });
});
