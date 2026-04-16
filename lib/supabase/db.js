// All helpers accept a supabase client as the first argument.

// ─── PROFILES ────────────────────────────────────────────────

export async function getProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(supabase, userId, fields) {
  // fields: { display_name?, mobile?, email?, photo_url?, discoverable? }
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function findProfileByMobile(supabase, mobile) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, mobile, photo_url')
    .eq('mobile', mobile)
    .maybeSingle();
  if (error) throw error;
  return data; // null if not found
}

export async function findProfileByEmail(supabase, email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, mobile, photo_url')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data; // null if not found
}

export async function findProfile(supabase, query) {
  // Accepts mobile number or email address
  const isEmail = query.includes('@');
  return isEmail
    ? findProfileByEmail(supabase, query)
    : findProfileByMobile(supabase, query);
}

// ─── QR CODES ────────────────────────────────────────────────

export async function getQrCodes(supabase, userId) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data; // [{ id, user_id, slot, storage_path, created_at }]
}

export async function upsertQrCode(supabase, userId, slot, storagePath) {
  const { data, error } = await supabase
    .from('qr_codes')
    .upsert(
      { user_id: userId, slot, storage_path: storagePath },
      { onConflict: 'user_id,slot' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getQrSignedUrl(supabase, storagePath) {
  const { data, error } = await supabase.storage
    .from('qr-codes')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadQrCode(supabase, userId, slot, file) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${slot}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('qr-codes')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  await upsertQrCode(supabase, userId, slot, path);
  return path;
}

// ─── TRANSACTIONS ─────────────────────────────────────────────

export async function getTransactions(supabase, userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      payer:profiles!payer_id(id, display_name, photo_url),
      recipient:profiles!recipient_id(id, display_name, photo_url),
      receipts(id, storage_path)
    `)
    .or(`payer_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTransaction(supabase, fields) {
  // fields: { payer_id, recipient_id, group_id?, amount, description?, category }
  const { data, error } = await supabase
    .from('transactions')
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markTransactionPending(supabase, txId) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'pending', paid_at: new Date().toISOString() })
    .eq('id', txId)
    .eq('status', 'unpaid')
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function settleTransaction(supabase, txId) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'settled', verified_at: new Date().toISOString() })
    .eq('id', txId)
    .eq('status', 'pending')
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── RECEIPTS ─────────────────────────────────────────────────

export async function uploadReceipt(supabase, txId, file) {
  const ext = file.name.split('.').pop();
  const path = `${txId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('receipts')
    .insert({ transaction_id: txId, uploaded_by: user.id, storage_path: path })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReceiptSignedUrl(supabase, storagePath) {
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(storagePath, 60 * 60); // 1 hour
  if (error) throw error;
  return data.signedUrl;
}

// ─── GROUPS ───────────────────────────────────────────────────

export async function getGroups(supabase) {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members(
        user_id,
        profiles(id, display_name, photo_url, mobile)
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createGroup(supabase, name, userId, isPublic = true) {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name, created_by: userId, is_public: isPublic })
    .select()
    .single();
  if (groupError) throw groupError;

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId });
  if (memberError) throw memberError;

  return group;
}

export async function renameGroup(supabase, groupId, name) {
  const { data, error } = await supabase
    .from('groups')
    .update({ name })
    .eq('id', groupId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addGroupMember(supabase, groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId });
  if (error) throw error;
}

export async function removeGroupMember(supabase, groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
}

// ─── BALANCES ─────────────────────────────────────────────────

/**
 * Compute net balances between the current user and all counterparties.
 * Only unpaid and pending transactions are included; settled ones are excluded.
 *
 * @param {Array} transactions - the transactions array from state (with joined payer/recipient profiles)
 * @param {string} userId - the current user's id
 * @returns {Array<{ profile: object, netAmount: number, direction: 'they_owe'|'you_owe' }>}
 */
export function computeBalances(transactions, userId) {
  const map = {};

  transactions.forEach(tx => {
    if (tx.status === 'settled') return;

    const isDebtor = tx.payer_id === userId;
    const counterpartyId = isDebtor ? tx.recipient_id : tx.payer_id;
    const profile = isDebtor ? tx.recipient : tx.payer;

    if (!map[counterpartyId]) {
      map[counterpartyId] = { profile, youOwe: 0, theyOwe: 0 };
    }

    if (isDebtor) {
      map[counterpartyId].youOwe += Number(tx.amount);
    } else {
      map[counterpartyId].theyOwe += Number(tx.amount);
    }
  });

  return Object.values(map)
    .map(({ profile, youOwe, theyOwe }) => {
      const net = theyOwe - youOwe;
      if (net === 0) return null;
      return {
        profile,
        netAmount: Math.abs(net),
        direction: net > 0 ? 'they_owe' : 'you_owe',
      };
    })
    .filter(Boolean);
}

// ─── GROUP DISCOVERY ──────────────────────────────────────────

export async function getPublicGroups(supabase) {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, is_public, total_settled, created_by, created_at, group_members(user_id)')
    .order('total_settled', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function applyToGroup(supabase, groupId, message) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('group_join_requests')
    .insert({ group_id: groupId, user_id: user.id, message: message || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getJoinRequests(supabase) {
  const { data, error } = await supabase
    .from('group_join_requests')
    .select(`
      *,
      profiles!user_id(id, display_name, photo_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function approveJoinRequest(supabase, requestId, groupId, applicantId) {
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: applicantId });
  if (memberError) throw memberError;

  const { error: updateError } = await supabase
    .from('group_join_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
  if (updateError) throw updateError;
}

export async function declineJoinRequest(supabase, requestId) {
  const { error } = await supabase
    .from('group_join_requests')
    .update({ status: 'declined' })
    .eq('id', requestId);
  if (error) throw error;
}
