import { useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { IS_LOCAL_MODE } from '../services/api';

export function useRealtimeSubscription(table, options = {}, callback) {
  const callbackRef = useRef(callback);
  const optionsKey = useMemo(() => JSON.stringify(options || {}), [options]);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (IS_LOCAL_MODE) return;

    const realtimeOptions = JSON.parse(optionsKey || '{}');
    const { event = '*', schema = 'public', filter } = realtimeOptions;

    // Build channel name
    const channelName = `${table}-changes-${Date.now()}`;
    
    const channelConfig = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event, schema, table, filter },
        (payload) => {
          if (callbackRef.current) callbackRef.current(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelConfig);
    };
  }, [table, optionsKey]);
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
