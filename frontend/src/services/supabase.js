import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
} else {
  // 本地模式空壳 — 使用 Proxy 兜底所有调用
  client = new Proxy({}, {
    get() {
      // 返回一个自递归的函数/对象，任何调用都不会报错
      const noop = () => noop;
      noop.data = null;
      noop.error = null;
      return noop;
    },
  });
}

export const supabase = client;
export default supabase;
