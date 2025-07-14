import { supabase } from '@/lib/customSupabaseClient';

/**
 * Fetches all users with `approved = false`.
 * @returns {Promise<{ data: any, error: any }>} Supabase response
 */
export const fetchPendingUsers = async () => {
  return await supabase
    .from('users')
    .select('id, username, email, created_at')
    .eq('approved', false);
};

/**
 * Marks a user as approved.
 * @param {string|number} userId - ID of the user to approve
 * @returns {Promise<{ data: any, error: any }>} Supabase response
 */
export const approveUser = async (userId) => {
  return await supabase
    .from('users')
    .update({ approved: true })
    .eq('id', userId);
};

/**
 * Deletes or rejects a pending user.
 * @param {string|number} userId - ID of the user to reject
 * @returns {Promise<{ data: any, error: any }>} Supabase response
 */
export const rejectUser = async (userId) => {
  return await supabase
    .from('users')
    .delete()
    .eq('id', userId);
};
