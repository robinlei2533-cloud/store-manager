// Domain: profiles
// ============================================================

import { supabase } from '../supabase';
import localDb from '../db/localDb';
import seedData from '../db/seedData';
import { USE_LOCAL, ensureLocalInit } from './helpers';

// ============ 用户 ============

export async function getProfiles() {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.all('profiles').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateProfile(id, profile) {
  ensureLocalInit();
  if (USE_LOCAL) return localDb.update('profiles', id, profile);
  const { data, error } = await supabase.from('profiles').update(profile).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
