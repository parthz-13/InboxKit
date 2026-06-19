import { motion } from 'framer-motion'
import type { TileState } from '../types'

interface TileProps {
  tile: TileState
  isRecent: boolean
  onClick: () => void
}

export function Tile({ tile, isRecent, onClick }: TileProps) {
  const bg = tile.owner_color ?? '#ffffff'
  const initials = tile.owner_name ? tile.owner_name.slice(0, 2).toUpperCase() : ''

  return (
    <motion.div
      key={isRecent ? `${tile.id}-claimed` : String(tile.id)}
      initial={isRecent ? { scale: 1.4, zIndex: 10 } : false}
      animate={{ scale: 1, zIndex: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      onClick={onClick}
      title={tile.owner_name ? `Claimed by ${tile.owner_name}` : 'Unclaimed Tile'}
      style={{
        backgroundColor: bg,
        width: 18,
        height: 18,
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        borderRadius: '3px',
      }}
      className={`select-none transition-all hover:scale-[1.15] hover:z-20 duration-100 ${
        tile.owner_name 
          ? 'hover:brightness-105 shadow-[0_1px_3px_rgba(0,0,0,0.1)]' 
          : 'hover:bg-slate-50 border border-slate-200/20'
      }`}
    >
      {initials && (
        <span
          className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[6px] tracking-tighter text-white pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
          style={{ lineHeight: 1 }}
        >
          {initials}
        </span>
      )}
    </motion.div>
  )
}
