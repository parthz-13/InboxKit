import { Trophy } from 'lucide-react'
import { useGridStore } from '../store/useGridStore'

export function Leaderboard() {
  const leaderboard = useGridStore((s) => s.leaderboard)

  return (
    <div className="font-sans">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
        <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
        Leaderboard
      </p>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-400 italic">No tiles claimed yet</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {leaderboard.map((entry, i) => (
            <li 
              key={entry.name} 
              className="flex items-center gap-2.5 text-sm py-1 border-b border-slate-100/50 last:border-b-0"
            >
              <span className={`w-4 font-mono font-bold text-xs text-right ${
                i === 0 ? 'text-amber-500 font-extrabold' : 
                i === 1 ? 'text-slate-400' : 
                i === 2 ? 'text-amber-700' : 
                'text-slate-400'
              }`}>
                {i + 1}
              </span>
              <span
                className="w-3 h-3 rounded-md flex-shrink-0 shadow-sm border border-white"
                style={{ 
                  backgroundColor: entry.color,
                  boxShadow: `0 2px 4px ${entry.color}40`,
                }}
              />
              <span className="flex-1 truncate font-medium text-slate-700">{entry.name}</span>
              <span className="text-slate-900 font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                {entry.count}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
