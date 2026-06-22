import { create } from 'zustand';
import { supabase } from '../services/supabase';
import localDb from '../services/db/localDb';
import seedData from '../services/db/seedData';
import { IS_LOCAL_MODE } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  // 本地模式：模拟登录
  signInLocal: async (email, password) => {
    // 本地模式下，用种子数据中的 profiles 模拟登录
    if (localDb.needsInit()) {
      localDb.init(seedData);
    }
    const profiles = localDb.all('profiles');
    // 简单匹配：取第一个 admin 或根据 email 前缀匹配
    let profile = profiles.find((p) => email && p.name && p.name.includes(email.split('@')[0]));
    if (!profile) {
      // 默认登录为管理员
      profile = profiles.find((p) => p.role === 'admin') || profiles[0];
    }
    if (profile) {
      const user = { id: profile.id, email: email || 'admin@local.com' };
      set({ user, profile, isAuthenticated: true });
      return { user, profile };
    }
    throw new Error('登录失败，请检查账号');
  },

  // Supabase 模式登录
  signInSupabase: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      set({ user: data.user, isAuthenticated: true });
      await get().fetchProfile(data.user.id);
    }
    return data;
  },

  signIn: async (email, password) => {
    if (IS_LOCAL_MODE) {
      return get().signInLocal(email, password);
    }
    return get().signInSupabase(email, password);
  },

  signUp: async (email, password, metadata) => {
    if (IS_LOCAL_MODE) {
      // 本地模式注册：添加到 profiles
      if (localDb.needsInit()) {
        localDb.init(seedData);
      }
      const profile = localDb.insert('profiles', {
        role: metadata?.role || 'rep',
        name: metadata?.name || email,
      });
      const user = { id: profile.id, email };
      set({ user, profile, isAuthenticated: true });
      return { user, profile };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    if (!IS_LOCAL_MODE) {
      await supabase.auth.signOut();
    }
    set({ user: null, profile: null, isAuthenticated: false });
  },

  initialize: async () => {
    set({ loading: true });
    if (IS_LOCAL_MODE) {
      // 本地模式：检查 localStorage 是否已有登录状态
      const savedProfileId = localStorage.getItem('store_manager_current_user');
      if (savedProfileId && localDb.needsInit()) {
        localDb.init(seedData);
      }
      if (savedProfileId) {
        const profile = localDb.findById('profiles', savedProfileId);
        if (profile) {
          set({ user: { id: profile.id }, profile, isAuthenticated: true });
        }
      }
      set({ loading: false });
      return;
    }

    // Supabase 模式
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      set({ user: data.session.user, isAuthenticated: true });
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      if (profileData) {
        set({ profile: profileData });
      }
    }
    set({ loading: false });
  },
}));

export default useAuthStore;
