import { useGridStore } from '../store/useGridStore'
import { Tile } from './Tile'

interface GridProps {
  onClaim: (tileId: number) => void
}

export function Grid({ onClaim }: GridProps) {
  const tiles = useGridStore((s) => s.tiles)
  const recentlyClaimed = useGridStore((s) => s.recentlyClaimed)

  if (tiles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50 font-sans">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider animate-pulse">Establishing Connection...</span>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-6 flex items-start justify-center bg-slate-50">
      <div className="bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-5 rounded-2xl max-w-full overflow-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(40, 18px)',
            gap: '2px',
            backgroundColor: '#f1f5f9',
            padding: '2px',
            borderRadius: '8px',
            width: 'fit-content',
          }}
          className="overflow-hidden"
        >
          {tiles.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              isRecent={recentlyClaimed.has(tile.id)}
              onClick={() => onClaim(tile.id)}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-sans">
          <span>Board Size: 40 × 40</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300" />
            Unclaimed Tile
          </span>
        </div>
      </div>
    </main>
  )
}
