'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addScore(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const scoreStr = formData.get('score') as string
  const dateStr = formData.get('date') as string

  if (!scoreStr || !dateStr) {
    return { error: 'Please provide both score and date.' }
  }

  const score = parseInt(scoreStr, 10)

  // Validation
  if (isNaN(score) || score < 1 || score > 45) {
    return { error: 'Score must be between 1 and 45.' }
  }

  // Step 1: Check duplicate date
  const { data: existingScoreForDate, error: checkError } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('played_at', dateStr)
    .single()

  if (existingScoreForDate) {
    return { error: 'A score for this date already exists.' }
  }

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 is "No rows found", which is what we want.
    // Any other error is an actual database error.
    console.error('Error checking duplicate:', checkError)
    return { error: 'Error checking duplicate score.' }
  }

  // Step 2: Fetch existing scores
  const { data: allScores, error: fetchError } = await supabase
    .from('scores')
    .select('id, played_at')
    .eq('user_id', user.id)
    .order('played_at', { ascending: true }) // We need to identify the oldest if we have too many

  if (fetchError) {
    console.error('Error fetching scores:', fetchError)
    return { error: 'Error retrieving existing scores.' }
  }

  // Step 3: Handle rolling logic
  if (allScores && allScores.length >= 5) {
    // Delete ONLY the single oldest score (which is the first one since we ordered ASC)
    const oldestScoreId = allScores[0].id
    
    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('id', oldestScoreId)

    if (deleteError) {
      console.error('Error deleting oldest score:', deleteError)
      return { error: 'Error processing rolling score history.' }
    }
  }

  // Step 4: Insert new score
  const { error: insertError } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score: score,
      played_at: dateStr,
    })

  if (insertError) {
    console.error('Error inserting score:', insertError)
    
    // Fallback error if the unique constraint was hit despite our check
    if (insertError.code === '23505') {
       return { error: 'A score for this date already exists.' }
    }
    
    return { error: 'Failed to save new score.' }
  }

  revalidatePath('/dashboard')
  return { success: 'Score added successfully!' }
}
