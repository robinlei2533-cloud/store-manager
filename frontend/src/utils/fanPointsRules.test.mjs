import { describe, expect, test } from 'vitest';
import { calculateFanPointUpdate } from './fanPointsRules.js';

describe('calculateFanPointUpdate', () => {
  const levelRules = [
    { level: 'diamond', min_points: 5000 },
    { level: 'gold', min_points: 1000 },
    { level: 'silver', min_points: 300 },
    { level: 'bronze', min_points: 0 },
  ];

  test('redeeming rewards deducts available points without reducing lifetime growth or level', () => {
    const result = calculateFanPointUpdate({
      fan: { points: 5200, total_contribution: 5200, level: 'diamond' },
      points: -5000,
      type: 'redeem',
      levelRules,
    });

    expect(result.points).toBe(200);
    expect(result.total_contribution).toBe(5200);
    expect(result.level).toBe('diamond');
  });

  test('earning points increases available points lifetime growth and level', () => {
    const result = calculateFanPointUpdate({
      fan: { points: 290, total_contribution: 290, level: 'bronze' },
      points: 20,
      type: 'earn',
      levelRules,
    });

    expect(result.points).toBe(310);
    expect(result.total_contribution).toBe(310);
    expect(result.level).toBe('silver');
  });
});
