'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to verify admin status
async function ensureAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (data?.role !== 'admin') {
    throw new Error('Unauthorized. Admin access required.');
  }
}

export async function updateResultStatus(resultId: string, newStatus: 'verified' | 'rejected' | 'paid') {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated.');

    // 1. Validate Admin
    await ensureAdmin(supabase, user.id);

    // 2. Validate Result Exists
    const { data: result, error: checkError } = await supabase
      .from('draw_results')
      .select('id')
      .eq('id', resultId)
      .single()

    if (checkError || !result) {
      throw new Error('Draw result not found.');
    }

    // 3. Update Status
    const { error: updateError } = await supabase
      .from('draw_results')
      .update({ status: newStatus })
      .eq('id', resultId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update status.');
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: `Successfully marked as ${newStatus}.` }

  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

// Convenience wrappers — must return void for Next.js form action compatibility
export async function verifyProof(id: string): Promise<void> { await updateResultStatus(id, 'verified'); }
export async function rejectProof(id: string): Promise<void> { await updateResultStatus(id, 'rejected'); }
export async function markAsPaid(id: string): Promise<void> { await updateResultStatus(id, 'paid'); }
