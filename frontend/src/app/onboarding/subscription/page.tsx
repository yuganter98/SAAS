import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { selectSubscription } from '../actions'

export default async function SubscriptionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Ensure they selected a charity first
  const { data: profile } = await supabase
    .from('profiles')
    .select('charity_id')
    .eq('id', user.id)
    .single()

  if (!profile?.charity_id) {
    return redirect('/onboarding/charity')
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center py-20 px-4">
      <div className="max-w-4xl w-full flex flex-col gap-8 items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            10% of your subscription goes directly to your selected charity. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-3xl">
          {/* Monthly Plan */}
          <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Monthly</h3>
            <p className="text-gray-500 mb-6">Billed every month.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold">$19</span>
              <span className="text-gray-500 font-medium">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Full Access to Dashboard
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                10% Charity Contribution
              </li>
            </ul>
            <form action={selectSubscription.bind(null, 'monthly')}>
              <button 
                type="submit"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-semibold rounded-xl py-3 px-6 transition-colors"
              >
                Select Monthly
              </button>
            </form>
          </div>

          {/* Yearly Plan (Highlighted) */}
          <div className="relative bg-blue-600 border-2 border-blue-600 rounded-3xl p-8 shadow-xl flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                Best Value
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Yearly</h3>
            <p className="text-blue-100 mb-6">Save 20% compared to monthly.</p>
            <div className="mb-6 text-white">
              <span className="text-4xl font-extrabold">$180</span>
              <span className="text-blue-200 font-medium">/year</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-blue-200 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Everything in Monthly
              </li>
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-blue-200 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Save $48 annually
              </li>
              <li className="flex items-center text-white">
                <svg className="w-5 h-5 text-blue-200 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Greater impact for your charity
              </li>
            </ul>
            <form action={selectSubscription.bind(null, 'yearly')}>
              <button 
                type="submit"
                className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold rounded-xl py-3 px-6 transition-colors shadow-sm"
              >
                Select Yearly
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
