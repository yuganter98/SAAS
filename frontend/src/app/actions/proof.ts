'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadProof(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const file = formData.get('proof') as File
  const resultId = formData.get('resultId') as string

  if (!file || !resultId) {
    return { error: 'Missing file or result ID.' }
  }

  // 1. File Constraints
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type. Only JPG, JPEG, and PNG are allowed.' }
  }

  const maxSizeInBytes = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSizeInBytes) {
    return { error: 'File is too large. Maximum size is 2MB.' }
  }

  // 2. Validate Result Exists & Eligible
  const { data: result, error: resultError } = await supabase
    .from('draw_results')
    .select('id, match_count, proof_url')
    .eq('id', resultId)
    .eq('user_id', user.id)
    .single()

  if (resultError || !result) {
    return { error: 'Result not found or unauthorized.' }
  }

  if (result.match_count < 3) {
    return { error: 'You are not eligible to upload proof (requires 3+ matches).' }
  }

  if (result.proof_url) {
    return { error: 'Proof has already been uploaded for this draw.' }
  }

  // 3. Upload to Storage
  const fileExtension = file.name.split('.').pop()
  const filePath = `${user.id}/${resultId}.${fileExtension}`

  const { error: uploadError } = await supabase
    .storage
    .from('proofs')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return { error: 'Failed to upload file to secure storage.' }
  }

  // 4. Update Database
  const { error: updateError } = await supabase
    .from('draw_results')
    .update({ 
      proof_url: filePath,
      status: 'pending' // Just to be explicit
    })
    .eq('id', resultId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Database update error after upload:', updateError)
    return { error: 'File uploaded, but failed to link to result.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: 'Proof uploaded successfully! Awaiting admin verification.' }
}
