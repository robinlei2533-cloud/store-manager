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

  signInLocal: async (email, password) => {
    if (localDb.needsInit()) {
      localDb.init(seedData);
    }
    const profiles = localDb.all('profiles');
    let profile = profiles.find((p) => email && p.name && p.name.includes(email.split('@')[0]));
    if (!profile) {
      profile = profiles.find((p) => p.role === 'admin') || profiles[0];
    }
    if (profile) {
      const user = { id: profile.id, email: email || 'admin@local.com' };
      set({ user, profile, isAuthenticated: true });
      return { user, profile };
    }
    throw new Error('Login failed');
  },

  signInSupabase: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      set({ user: data.user, isAuthenticated: true });
      // Fetch profile with error handling — don't hang if it fails
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (!profileError && profileData) {
          set({ profile: profileData });
        } else {
          // Profile might not exist yet — create a fallback profile
          const fallbackProfile = {
            id: data.user.id,
            role: 'fan',
            name: data.user.email?.split('@')[0] || 'User',
            phone: '',
            avatar: '',
          };
          set({ profile: fallbackProfile });
        }
      } catch (err) {
        // If profile fetch fails, use fallback so UI doesn't hang
        const fallbackProfile = {
          id: data.user.id,
          role: 'fan',
          name: data.user.email?.split('@')[0] || 'User',
          phone: '',
          avatar: '',
        };
        set({ profile: fallbackProfile });
      }
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
      try { await supabase.auth.signOut(); } catch(e) { console.error('SignOut error:', e); }
    }
    set({ user: null, profile: null, isAuthenticated: false });
  },

  initialize: async () => {
    set({ loading: true });
    if (IS_LOCAL_MODE) {
      const savedProfileId = localStorage.getItem('store_manager_current_user');
      if (savedProfileId && localDb.needsInit()) {
        localDb.init(seedData);
      }
      if (savedProfileId) {
        const profile = localDb.findById('profiles', savedProfileId);
        if (profile) {
          set({ user: { id: profile.id }, profile, isAuthenticated: true });
          } else {
            // Fan login from static HTML fan-entry page
            // Ensure fan record exists in localDb
          if (!localDb.findById('fans', savedProfileId)) {
            localDb.insert('fans', {
              id: savedProfileId,
              store_id: null,
              user_id: savedProfileId,
              level: 'bronze',
              points: 100,
              total_contribution: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          const fallbackFan = { id: savedProfileId, role: 'fan', name: '粉丝用户', phone: '', avatar: '' };
            set({ user: { id: savedProfileId }, profile: fallbackFan, isAuthenticated: true });
          }
      }
      // Fan login from fan-entry.html - set up a fan session
      if (localStorage.getItem('fan_logged_in') === 'true') {
        if (localDb.needsInit()) { localDb.init(seedData); }
        const fans = localDb.all('fans');
        if (fans.length > 0 && !localStorage.getItem('store_manager_current_user')) {
          const fanProfile = { id: fans[0].id, role: 'fan', name: fans[0].id, phone: '', avatar: '' };
          localStorage.setItem('store_manager_current_user', fans[0].id);
          localStorage.removeItem('fan_logged_in');
          set({ user: { id: fans[0].id }, profile: fanProfile, isAuthenticated: true });
        }
      }
      set({ loading: false });
      return;
    }

    // Supabase mode
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        set({ user: data.session.user, isAuthenticated: true });
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          if (profileData) {
            set({ profile: profileData });
          } else {
            set({ profile: { id: data.session.user.id, role: 'fan', name: data.session.user.email?.split('@')[0] || 'User' } });
          }
        } catch {
          set({ profile: { id: data.session.user.id, role: 'fan', name: data.session.user.email?.split('@')[0] || 'User' } });
        }
      }
    } catch(e) { console.error('Init error:', e); }
    set({ loading: false });
  },
}));

export default useAuthStore;


