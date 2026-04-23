'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function selectCharity(charityId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ charity_id: charityId })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating charity:', error)
    throw new Error('Failed to update charity')
  }

  redirect('/onboarding/subscription')
}

export async function selectSubscription(type: 'monthly' | 'yearly') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Calculate start/end dates
  const startDate = new Date()
  const endDate = new Date()
  if (type === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1)
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }

  // 1. Update Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      is_subscribed: true,
      subscription_type: type
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('Error updating profile subscription:', profileError)
    throw new Error('Failed to update subscription status')
  }

  // 2. Insert Subscription Record
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert([
      {
        user_id: user.id,
        type: type,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }
    ])

  if (subError) {
    console.error('Error inserting subscription:', subError)
    throw new Error('Failed to create subscription record')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
