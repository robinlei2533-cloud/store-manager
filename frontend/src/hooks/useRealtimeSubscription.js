import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { IS_LOCAL_MODE } from '../services/api';

export function useRealtimeSubscription(table, filter, callback) {
  useEffect(() => {
    if (IS_LOCAL_MODE) return;
    
    // Build channel name
    const channelName = `${table}-changes-${Date.now()}`;
    
    let channelConfig = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          if (callback) callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelConfig);
    };
  }, [table, JSON.stringify(filter)]);
}

export function useRealtimeAwareQuery(options) {
  // Wrapper around useQuery that auto-refreshes on realtime changes
  const { queryKey, queryFn, table, filter, ...rest } = options;
  const queryClient = useQueryClient();
  
  useRealtimeSubscription(table, filter, () => {
    queryClient.invalidateQueries({ queryKey });
  });
  
  return { queryKey, queryFn, ...rest };
}
