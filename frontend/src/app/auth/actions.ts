'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login Error:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup Error:', error.message)
    redirect(`/signup?message=${encodeURIComponent(error.message)}`)
  }

  // If user was created, insert profile data
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          name: name,
          email: email,
          is_subscribed: false,
          charity_percentage: 10
        }
      ])

    if (profileError) {
      console.error('Error inserting profile:', profileError)
    }
  }

  // Redirect to onboarding directly since email confirmation is disabled
  redirect('/onboarding/charity')
}

export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error logging out:', error)
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
