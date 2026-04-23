'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addScore } from '../app/actions/scores'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export default function ScoreForm() {
  const [state, formAction, isPending] = useActionState(addScore, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <Card>
      <h3 className="font-semibold text-lg mb-4 text-white">Record New Score</h3>
      
      <form ref={formRef} action={formAction} className="flex flex-col gap-5">
        <div>
          <label htmlFor="score" className="block text-sm font-medium text-indigo-200/60 mb-1.5">
            Score (1-45)
          </label>
          <input
            type="number"
            id="score"
            name="score"
            min="1"
            max="45"
            required
            className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 text-white placeholder-white/20 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
            placeholder="Enter score"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-indigo-200/60 mb-1.5">
            Date Played
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
            disabled={isPending}
          />
        </div>

        {state?.error && (
          <div className="p-3 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fade-in">
            {state.success}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isPending}
          fullWidth
          className="mt-2"
        >
          Save Score
        </Button>
      </form>
    </Card>
  )
}
