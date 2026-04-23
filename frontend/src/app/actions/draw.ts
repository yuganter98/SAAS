'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Generates 5 unique random numbers between 1 and 45
function generateDrawNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export async function executeMonthlyDraw() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated.' };
  }

  // 1. Admin Check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' };
  }

  // YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7);

  // 2. Duplicate Check
  const { data: existingDraw } = await supabase
    .from('draws')
    .select('id')
    .eq('month', currentMonth)
    .single();

  if (existingDraw) {
    return { error: 'A draw has already been executed for this month.' };
  }

  // 3. Generate Numbers
  const drawNumbers = generateDrawNumbers();

  // 4. Create Pending Draw (Transaction-like start)
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .insert({
      month: currentMonth,
      numbers: drawNumbers,
      status: 'pending'
    })
    .select()
    .single();

  if (drawError || !draw) {
    console.error('Error creating draw:', drawError);
    return { error: 'Failed to initiate draw.' };
  }

  try {
    // 5. Fetch all eligible users (exactly 5 scores)
    // Supabase RPC is best here, but we can do it via REST by fetching all scores and grouping in memory.
    // For large datasets, this should be done in PostgreSQL via a function. 
    // Since we are limited to REST for now, we fetch all scores.
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select('user_id, score');

    if (scoresError) throw scoresError;

    // Group scores by user
    const userScores: Record<string, number[]> = {};
    allScores?.forEach(row => {
      if (!userScores[row.user_id]) userScores[row.user_id] = [];
      userScores[row.user_id].push(row.score);
    });

    // Filter users with EXACTLY 5 scores
    const eligibleUsers = Object.entries(userScores).filter(([_, scores]) => scores.length === 5);

    // 6. Matching Logic
    const winners: { user_id: string; match_count: number; prize: number }[] = [];
    const matchCounts = { 5: 0, 4: 0, 3: 0 };

    eligibleUsers.forEach(([userId, scores]) => {
      let matches = 0;
      scores.forEach(score => {
        if (drawNumbers.includes(score)) matches++;
      });

      if (matches >= 3) {
        winners.push({ user_id: userId, match_count: matches, prize: 0 });
        matchCounts[matches as keyof typeof matchCounts]++;
      }
    });

    // 7. Prize Calculation
    const POOL = 10000;
    const prizeTiers = {
      5: POOL * 0.40, // 4000
      4: POOL * 0.35, // 3500
      3: POOL * 0.25  // 2500
    };

    // Distribute prizes
    winners.forEach(winner => {
      if (winner.match_count === 5) {
        winner.prize = prizeTiers[5] / matchCounts[5];
      } else if (winner.match_count === 4) {
        winner.prize = prizeTiers[4] / matchCounts[4];
      } else if (winner.match_count === 3) {
        winner.prize = prizeTiers[3] / matchCounts[3];
      }
    });

    // 8. Insert Results Batch
    if (winners.length > 0) {
      const resultsToInsert = winners.map(w => ({
        draw_id: draw.id,
        user_id: w.user_id,
        match_count: w.match_count,
        prize: Math.round(w.prize * 100) / 100 // Round to 2 decimal places
      }));

      const { error: resultsError } = await supabase
        .from('draw_results')
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;
    }

    // 9. Mark Draw as Completed
    const { error: updateError } = await supabase
      .from('draws')
      .update({ status: 'completed' })
      .eq('id', draw.id);

    if (updateError) throw updateError;

    revalidatePath('/dashboard');
    return { success: 'Draw executed successfully!', numbers: drawNumbers };

  } catch (err) {
    console.error('Execution failed, cleaning up pending draw...', err);
    // Rollback by deleting the pending draw
    await supabase.from('draws').delete().eq('id', draw.id);
    return { error: 'Failed to process draw results. Rolled back.' };
  }
}
