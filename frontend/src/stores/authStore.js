import { create } from 'zustand';
import { supabase } from '../services/supabase';
import localDb from '../services/db/localDb';
import seedData from '../services/db/seedData';
import { isLocalMode } from '../services/api';
import { ensureLocalInit, setLocalMode } from '../services/api/helpers';

const isLocalPreviewHost = () => {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

export const isLocalAuthFallbackEnabled = () => (
  isLocalMode() ||
  Boolean(import.meta.env?.DEV) ||
  import.meta.env?.VITE_ALLOW_LOCAL_AUTH_FALLBACK === 'true' ||
  isLocalPreviewHost()
);

const getFallbackProfile = (user) => ({
  id: user.id,
  role: 'fan',
  name: user.email?.split('@')[0] || 'User',
  phone: '',
  avatar: '',
});

const DEMO_LOCAL_EMAILS = new Set([
  'admin@uwell.com',
  'manager@uwell.com',
  'rep1@uwell.com',
  'rep2@uwell.com',
  'rep3@uwell.com',
  'fan.preview@uwell.com',
  'store.owner@uwell.com',
]);

const isDemoLocalEmail = (email) => DEMO_LOCAL_EMAILS.has(String(email || '').toLowerCase());

const getFanProfileFromLocalAccount = (localAccount) => {
  const fanId = localAccount.fan_id || localAccount.profile_id || localAccount.id;
  const fan = localDb.findById('fans', fanId);
  if (!fan) return null;
  return {
    id: fan.id,
    role: 'fan',
    name: fan.name || localAccount.name || localAccount.email,
    phone: fan.phone || '',
    avatar: '',
  };
};

const getFanProfileFromLocalFan = (fan) => {
  if (!fan) return null;
  return {
    id: fan.id,
    role: 'fan',
    name: fan.name || fan.email || fan.id,
    phone: fan.phone || '',
    avatar: '',
  };
};

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  signInLocal: async (email, password) => {
    setLocalMode(true);
    if (localDb.needsInit()) {
      localDb.init(seedData);
    }
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const localAccount = (localDb.all('auth') || []).find((account) => (
      String(account.email || '').toLowerCase() === normalizedEmail &&
      String(account.password || '') === String(password || '')
    ));
    if (!localAccount) {
      throw new Error('Invalid trial account or password');
    }

    const profiles = localDb.all('profiles');
    let profile = profiles.find((p) => p.id === localAccount.profile_id);
    if (!profile && localAccount.role === 'fan') {
      profile = getFanProfileFromLocalAccount(localAccount);
    }
    if (profile) {
      const user = { id: profile.id, email: localAccount.email };
      set({ user, profile, isAuthenticated: true });
      return { user, profile };
    }
    throw new Error('Login failed');
  },

  signInSupabase: async (email, password) => {
    setLocalMode(false);
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
          set({ profile: getFallbackProfile(data.user) });
        }
      } catch (_err) {
        // If profile fetch fails, use fallback so UI doesn't hang
        set({ profile: getFallbackProfile(data.user) });
      }
    }
    return data;
  },

  signIn: async (email, password) => {
    if (isLocalMode() || (isLocalAuthFallbackEnabled() && isDemoLocalEmail(email))) {
      return get().signInLocal(email, password);
    }
    try {
      return await get().signInSupabase(email, password);
    } catch (e) {
      if (isLocalAuthFallbackEnabled()) {
        console.warn("[Auth] Supabase error, falling back to local demo mode:", e.message);
        return get().signInLocal(email, password);
      }
      throw e;
    }
  },

  signUp: async (email, password, metadata) => {
    if (isLocalMode()) {
      setLocalMode(true);
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
    setLocalMode(isLocalMode());
    if (!isLocalMode()) {
      try { await supabase.auth.signOut(); } catch(e) { console.error('SignOut error:', e); }
    }
    localStorage.removeItem('store_manager_current_user');
    localStorage.removeItem('fan_logged_in');
    localStorage.removeItem('store_owner_logged_in');
    localStorage.removeItem('store_owner_store_id');
    set({ user: null, profile: null, isAuthenticated: false });
  },

  initialize: async () => {
    const canUseLocalFallback = isLocalAuthFallbackEnabled();
    if (canUseLocalFallback) ensureLocalInit();
    set({ loading: true });
    if (!isLocalMode()) {
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
            set({ profile: profileData || getFallbackProfile(data.session.user) });
          } catch {
            set({ profile: getFallbackProfile(data.session.user) });
          }
          set({ loading: false });
          return;
        }
      } catch (e) {
        if (!canUseLocalFallback) {
          console.error('Init error:', e);
          set({ loading: false });
          return;
        }
        console.warn('[Auth] Supabase session unavailable, using local demo fallback:', e.message);
      }
    }

    if (canUseLocalFallback) {
      const savedProfileId = localStorage.getItem('store_manager_current_user');
      if (savedProfileId && localDb.needsInit()) {
        localDb.init(seedData);
      }
      if (savedProfileId) {
        const profile = localDb.findById('profiles', savedProfileId);
        if (profile) {
          setLocalMode(true);
          set({ user: { id: profile.id }, profile, isAuthenticated: true });
        } else {
          setLocalMode(true);
          // Fan login from static HTML fan-entry page.
          if (!localDb.findById('fans', savedProfileId)) {
            localDb.insert('fans', {
              id: savedProfileId,
              store_id: null,
              user_id: savedProfileId,
              level: 'bronze',
              points: 100,
              total_contribution: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
          const fallbackFan = { id: savedProfileId, role: 'fan', name: 'UWELL Fan', phone: '', avatar: '' };
          set({ user: { id: savedProfileId }, profile: fallbackFan, isAuthenticated: true });
        }
      }
      // Fan login from fan-entry.html - set up a fan session
      if (localStorage.getItem('fan_logged_in') === 'true') {
        if (localDb.needsInit()) { localDb.init(seedData); }
        const savedFanId = localStorage.getItem('store_manager_current_user');
        const savedFan = savedFanId ? localDb.findById('fans', savedFanId) : null;
        const fanProfile = getFanProfileFromLocalFan(savedFan);
        if (fanProfile) {
          setLocalMode(true);
          localStorage.setItem('store_manager_current_user', fanProfile.id);
          localStorage.removeItem('fan_logged_in');
          set({ user: { id: fanProfile.id }, profile: fanProfile, isAuthenticated: true });
        } else if (!savedFanId) {
          localStorage.removeItem('fan_logged_in');
        }
      }
      set({ loading: false });
      return;
    }

    set({ loading: false });
  },
}));

export default useAuthStore;


