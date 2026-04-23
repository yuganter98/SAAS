import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '../auth/actions'
import ScoreForm from '@/components/ScoreForm'
import ScoreList from '@/components/ScoreList'
import LatestDrawResult from '@/components/LatestDrawResult'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`*, charities (name, image_url)`)
    .eq('id', user.id)
    .single()

  if (!profile?.is_subscribed) return redirect('/onboarding/charity')

  const { data: latestDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let userResult = null;
  if (latestDraw) {
    const { data } = await supabase
      .from('draw_results')
      .select('*')
      .eq('draw_id', latestDraw.id)
      .eq('user_id', user.id)
      .single()
    userResult = data;
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center pb-24 bg-[#0a0a1a] min-h-screen">
      
      {/* Top Navbar */}
      <nav className="w-full flex justify-center border-b border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="w-full max-w-6xl flex justify-between items-center px-6 py-4">
          <div className="font-extrabold text-xl flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            <svg className="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            SaaS Play
          </div>
          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <span className="text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer">
                  Admin Panel &rarr;
                </span>
              </Link>
            )}
            <form action={logout}>
              <Button variant="secondary" className="px-4 py-2 text-xs bg-white/[0.06] border border-white/[0.08] text-indigo-200/60 hover:text-white hover:bg-white/[0.1]">Sign Out</Button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content Grid */}
      <div className="animate-slide-up flex-1 flex flex-col gap-10 max-w-6xl px-4 sm:px-6 mt-12 w-full">
        
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-4xl text-white tracking-tight">
              Welcome back, {profile?.name || 'User'}!
            </h2>
            <p className="text-indigo-200/40 mt-2 font-medium">Here is a summary of your performance and impact.</p>
          </div>
        </header>

        {/* Draw Section */}
        <section>
          <LatestDrawResult latestDraw={latestDraw} userResult={userResult} />
        </section>

        {/* Info Cards Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Account Card */}
            <Card className="md:col-span-2 flex flex-col justify-between">
              <div className="mb-6 pb-4 border-b border-white/[0.06]">
                <h3 className="font-bold text-xl text-white">Account Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6 flex-1">
                <div>
                  <p className="text-xs font-semibold text-indigo-200/30 uppercase tracking-wider mb-1.5">Email</p>
                  <p className="font-medium text-white">{profile?.email || user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-200/30 uppercase tracking-wider mb-1.5">User ID</p>
                  <p className="font-mono text-xs text-indigo-200/40 bg-white/[0.04] px-2 py-1 rounded inline-block truncate max-w-[200px]">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-200/30 uppercase tracking-wider mb-1.5">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="font-semibold text-white capitalize">Active Subscription</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-200/30 uppercase tracking-wider mb-1.5">Plan</p>
                  <span className="text-sm font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg capitalize">
                    {profile?.subscription_type || 'None'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Charity Card */}
            {profile?.charities && (
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-md text-white overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="font-bold text-xl mb-6 relative z-10">Your Impact</h3>
                <div className="flex flex-col relative z-10 h-[calc(100%-48px)] justify-between">
                  <div>
                    <span className="text-5xl font-black drop-shadow-sm">{profile?.charity_percentage}%</span>
                    <p className="text-indigo-100/60 text-sm mt-2 font-medium">of your subscription goes to:</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center gap-3 mt-4">
                    {/* @ts-ignore */}
                    {profile.charities.image_url && <img src={profile.charities.image_url} alt="Charity" className="w-12 h-12 rounded-lg object-cover shadow-sm" />}
                    {/* @ts-ignore */}
                    <p className="font-bold text-sm leading-tight line-clamp-2">{profile.charities.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Gamified Scores Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-extrabold text-2xl text-white flex items-center gap-2">
              Performance Tracker
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 sticky top-24">
              <ScoreForm />
            </div>
            <div className="lg:col-span-2">
              <ScoreList />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
