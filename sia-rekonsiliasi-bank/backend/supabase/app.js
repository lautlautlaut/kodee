import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL  = 'https://cgkramlvesaevbslniik.supabase.co';   // GANTI
const SUPABASE_ANON = 'sb_publishable_B00cPAzTwW6hOcc3tDqEGg_VfbEol4c';               // GANTI

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export const api = {
  /* ---------- MASTER ---------- */
  async getAccounts() {
    const { data, error } = await supabase
      .from('bank_accounts').select('*').order('id_account');
    if (error) throw error;
    return data;
  },
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
  },

  /* ---------- INTERNAL ---------- */
  async getInternal(id_account, status = null) {
    let q = supabase.from('buku_besar_kas').select('*').eq('id_account', id_account);
    if (status) q = q.eq('status_rekonsiliasi', status);
    const { data, error } = await q.order('tanggal');
    if (error) throw error;
    return data;
  },
  async insertInternal(payload) {
    const { data, error } = await supabase
      .from('buku_besar_kas').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  /* ---------- BANK ---------- */
  async getBank(id_account, status = null) {
    let q = supabase.from('rekening_koran_bank').select('*').eq('id_account', id_account);
    if (status) q = q.eq('status_rekonsiliasi', status);
    const { data, error } = await q.order('tanggal_bank');
    if (error) throw error;
    return data;
  },
  async insertBankBulk(rows) {
    const { data, error } = await supabase
      .from('rekening_koran_bank').insert(rows).select();
    if (error) throw error;
    return data;
  },

  /* ---------- REKONSILIASI ---------- */
  async getRekonsiliasi(id_account) {
    const { data, error } = await supabase
      .from('hasil_rekonsiliasi')
      .select(`
        *,
        buku_besar_kas!inner(id_internal, id_account, tanggal, keterangan, nominal),
        rekening_koran_bank!inner(id_bank, id_account, tanggal_bank, keterangan_bank, nominal_bank)
      `)
      .eq('buku_besar_kas.id_account', id_account);
    if (error) throw error;
    return data;
  },
  async insertRekon(payload) {
    const { data, error } = await supabase
      .from('hasil_rekonsiliasi').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  /* ---------- JURNAL ---------- */
  async insertJurnalBulk(rows) {
    const { data, error } = await supabase
      .from('jurnal_penyesuaian').insert(rows).select();
    if (error) throw error;
    return data;
  },
  async getJurnal(id_rekon) {
    const { data, error } = await supabase
      .from('jurnal_penyesuaian').select('*').eq('id_rekon', id_rekon);
    if (error) throw error;
    return data;
  }
};