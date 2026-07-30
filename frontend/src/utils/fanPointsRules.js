export function normalizeLevelRules(levelRules = []) {
  return [...levelRules].sort((a, b) => Number(b.min_points || 0) - Number(a.min_points || 0));
}

export function calculateFanPointUpdate({ fan = {}, points = 0, type = 'earn', levelRules = [] } = {}) {
  const pointDelta = Number(points) || 0;
  const currentAvailable = Number(fan.points || fan.available_points || 0);
  const currentLifetime = Number(fan.total_contribution || fan.lifetime_growth_points || fan.growth_points || currentAvailable);
  const nextAvailable = Math.max(0, currentAvailable + pointDelta);
  const nextLifetime = type === 'earn' ? Math.max(0, currentLifetime + pointDelta) : currentLifetime;
  const nextLevel = normalizeLevelRules(levelRules).find((rule) => nextLifetime >= Number(rule.min_points || 0));

  return {
    points: nextAvailable,
    available_points: nextAvailable,
    total_contribution: nextLifetime,
    lifetime_growth_points: nextLifetime,
    level: nextLevel?.level || fan.level,
  };
}
