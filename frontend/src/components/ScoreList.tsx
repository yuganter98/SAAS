import { createClient } from '@/utils/supabase/server'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

export default async function ScoreList() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching scores:', error)
    return <Card className="border-red-500/20"><p className="text-red-400">Failed to load scores.</p></Card>
  }

  if (!scores || scores.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-200/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-white font-semibold text-lg">No scores yet</p>
        <p className="text-indigo-200/40 mt-1 text-sm max-w-xs">Play games and record your scores to participate in the monthly draw.</p>
      </Card>
    )
  }

  return (
    <Card noPadding>
      <div className="p-6 border-b border-white/[0.06]">
        <h3 className="font-semibold text-lg text-white">Performance History</h3>
        <p className="text-xs text-indigo-200/30 mt-1">Your latest {scores.length} scores</p>
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {scores.map((score) => {
          const dateStr = new Date(score.played_at).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
          })
          
          return (
            <li key={score.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <span className="text-sm font-medium text-indigo-200/50">{dateStr}</span>
              <Badge variant="score" value={score.score} className="px-4 py-1.5 text-base">
                {score.score}
              </Badge>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
