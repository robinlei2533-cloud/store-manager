// Dashboard 实时更新 hook
// 订阅 visits, fans, scan_records 表的变更
// 自动刷新仪表盘数据

import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';

export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  // 订阅 visits 表的 INSERT 事件
  useRealtimeSubscription('visits', { event: 'INSERT' }, () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['visit-trend'] });
    queryClient.invalidateQueries({ queryKey: ['store-distribution'] });
    queryClient.invalidateQueries({ queryKey: ['recent-visits'] });
  });

  // 订阅 fans 表的 INSERT 事件
  useRealtimeSubscription('fans', { event: 'INSERT' }, () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['store-distribution'] });
  });

  // 订阅 scan_records 表的 INSERT 事件
  useRealtimeSubscription('scan_records', { event: 'INSERT' }, () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-scans'] });
    queryClient.invalidateQueries({ queryKey: ['scan-trend'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  });
}
