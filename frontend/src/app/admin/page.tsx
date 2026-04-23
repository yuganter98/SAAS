import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminDrawButton from '@/components/AdminDrawButton'
import { verifyProof, rejectProof, markAsPaid } from '../actions/admin'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect('/dashboard')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')

  const { data: drawResults } = await supabase
    .from('draw_results')
    .select(`
      *,
      draws ( month )
    `)
    .order('created_at', { ascending: false })

  // Generate Signed URLs for all proofs
  const paths = drawResults?.map(r => r.proof_url).filter(Boolean) || [];
  let signedUrls: Record<string, string> = {};
  if (paths.length > 0) {
    const { data } = await supabase.storage.from('proofs').createSignedUrls(paths, 60 * 60);
    if (data) {
      data.forEach(item => {
        if (!item.error && item.signedUrl) {
          signedUrls[item.path!] = item.signedUrl;
        }
      });
    }
  }

  // Stats
  const totalUsers = users?.length || 0
  const totalWinners = drawResults?.filter(r => r.match_count >= 3).length || 0
  const totalPaid = drawResults?.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.prize), 0) || 0
  const pendingReview = drawResults?.filter(r => r.status === 'pending' && r.proof_url).length || 0

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-[#0a0a1a] min-h-screen">
      
      {/* Navbar */}
      <nav className="w-full flex justify-center border-b border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full max-w-7xl flex justify-between items-center px-6 py-4">
          <div className="font-extrabold text-xl flex items-center gap-3 text-white">
            <span className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            Admin Console
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-indigo-300/50 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-7xl px-4 sm:px-6 py-8 flex flex-col gap-8 animate-slide-up">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: totalUsers, icon: '👥', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
            { label: 'Winners', value: totalWinners, icon: '🏆', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/20' },
            { label: 'Paid Out', value: `$${totalPaid.toLocaleString()}`, icon: '💰', color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20' },
            { label: 'Pending Review', value: pendingReview, icon: '📋', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5 flex items-center gap-4`}>
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-indigo-200/40 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Draw Control */}
        <AdminDrawButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Winners Management */}
          <section className="lg:col-span-2">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Winners Management
                  </h2>
                  <p className="text-sm text-indigo-200/40 mt-1">Verify proofs and issue payouts</p>
                </div>
                <span className="text-xs font-bold text-indigo-200/30 bg-white/[0.04] px-3 py-1.5 rounded-lg">
                  {drawResults?.length || 0} results
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-indigo-200/30 text-xs uppercase border-b border-white/[0.04] bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Result</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Proof</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {drawResults?.map(result => {
                      const userProfile = users?.find(u => u.id === result.user_id)
                      const userName = userProfile?.name || 'Unknown'
                      const userEmail = userProfile?.email || ''
                      // @ts-ignore
                      const drawMonth = result.draws?.month || 'N/A'
                      const proofUrl = result.proof_url ? signedUrls[result.proof_url] : null

                      const statusStyles: Record<string, string> = {
                        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        verified: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
                      }

                      return (
                        <tr key={result.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{userName}</div>
                                <div className="text-xs text-indigo-200/30">{drawMonth}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-semibold">{result.match_count} Matches</div>
                            <div className="text-emerald-400 font-bold text-lg">${Number(result.prize).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border capitalize ${statusStyles[result.status] || ''}`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {proofUrl ? (
                              <a href={proofUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-sm font-medium transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                View
                              </a>
                            ) : (
                              <span className="text-indigo-200/20 text-xs italic">No proof</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {result.status === 'pending' && result.proof_url && (
                                <>
                                  <form action={verifyProof.bind(null, result.id)}>
                                    <button type="submit" className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                                      Approve
                                    </button>
                                  </form>
                                  <form action={rejectProof.bind(null, result.id)}>
                                    <button type="submit" className="text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                                      Reject
                                    </button>
                                  </form>
                                </>
                              )}
                              {result.status === 'verified' && (
                                <form action={markAsPaid.bind(null, result.id)}>
                                  <button type="submit" className="text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
                                    Mark Paid
                                  </button>
                                </form>
                              )}
                              {result.status === 'paid' && (
                                <span className="text-xs text-emerald-400/50 font-medium">✓ Complete</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {(!drawResults || drawResults.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-3xl">🎲</span>
                            <p className="text-indigo-200/30 font-medium">No draw results yet</p>
                            <p className="text-indigo-200/20 text-xs">Execute a monthly draw to see results here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Users Directory */}
          <section className="lg:col-span-1">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.06]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  User Directory
                </h2>
                <p className="text-sm text-indigo-200/40 mt-1">{totalUsers} registered users</p>
              </div>
              <ul className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto">
                {users?.map(u => (
                  <li key={u.id} className="p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                      {(u.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-sm truncate">{u.name}</span>
                        {u.is_subscribed ? (
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex-shrink-0">
                            PRO
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-white/[0.04] text-indigo-200/30 border border-white/[0.06] px-2 py-0.5 rounded-md flex-shrink-0">
                            FREE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-indigo-200/30 font-mono truncate block">{u.email}</span>
                    </div>
                  </li>
                ))}
                {(!users || users.length === 0) && (
                  <li className="p-8 text-center text-indigo-200/30 text-sm">No users found</li>
                )}
              </ul>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
