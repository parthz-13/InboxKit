import { useState } from 'react'
import { saveIdentity } from '../lib/session'
import type { StoredIdentity } from '../lib/session'

const PALETTE = [
  '#AA9183',
  '#3b82f6',
  '#06b6d4',
  '#14b8a6',
  '#10b981',
  '#f59e0b',
  '#f97316',
  '#f43f5e',
  '#ec4899',
  '#8b5cf6',
]

interface UserSetupModalProps {
  onComplete: (identity: StoredIdentity) => void
  onCancel?: () => void
}

export function UserSetupModal({ onComplete, onCancel }: UserSetupModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[Math.floor(Math.random() * PALETTE.length)])
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a name.')
      return
    }
    if (trimmed.length > 24) {
      setError('Name must be 24 characters or fewer.')
      return
    }
    const identity = saveIdentity(trimmed, color)
    onComplete(identity)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-200/80 shadow-2xl p-8 rounded-2xl w-full max-w-sm transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          
          <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">Gridy</h1>
        </div>
        <p className="text-slate-500 text-sm mb-6 font-sans">
          Pick a name and your color to enter the battle for the grid.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-sans">
              Player Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="e.g. Tyler Durden"
              maxLength={24}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all font-sans"
            />
            {error && <p className="text-rose-500 text-xs mt-1.5 font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 font-sans">
              Choose Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-xl transition-all duration-200 hover:scale-105 active:scale-95`}
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px #ffffff, 0 0 0 4px ${c}` : 'none',
                    transform: color === c ? 'scale(1.05)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/60 active:scale-98 transition-all cursor-pointer font-sans"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-2 py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:brightness-105 active:scale-98 cursor-pointer font-sans"
              style={{
                backgroundColor: color,
                boxShadow: `0 4px 14px -4px ${color}`,
              }}
            >
              Join Game
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
