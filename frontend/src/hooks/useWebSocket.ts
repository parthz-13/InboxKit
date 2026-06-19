import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import type { StoredIdentity } from '../lib/session'
import { useGridStore } from '../store/useGridStore'
import type { TileState, LeaderboardEntry } from '../types'

const WS_BASE = import.meta.env.VITE_WS_URL ?? ''

export function useWebSocket(identity: StoredIdentity | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const { initState, claimTile, setOnlineCount, setCooldown, setConnected, setMatchOver, resetMatch } = useGridStore()

  useEffect(() => {
    if (!identity) return
    mountedRef.current = true

    const { session_id, name, color } = identity

    function connect() {
      if (!mountedRef.current) return

      const params = new URLSearchParams({ name, color })
      const url = `${WS_BASE}/ws/${session_id}?${params}`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current)
          reconnectRef.current = null
        }
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
        }, 30_000)
      }

      ws.onclose = () => {
        setConnected(false)
        if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null }
        if (mountedRef.current) {
          reconnectRef.current = setTimeout(connect, 2000)
        }
      }

      ws.onerror = () => ws.close()

      ws.onmessage = (event) => {
        let msg: Record<string, unknown>
        try {
          msg = JSON.parse(event.data as string) as Record<string, unknown>
        } catch {
          return
        }

        const type = msg.type as string

        if (type === 'init') {
          initState(
            msg.tiles as TileState[],
            msg.leaderboard as LeaderboardEntry[],
            msg.user as Parameters<typeof initState>[2],
            msg.online_count as number,
            msg.match_ends_at as string,
            msg.cooldown_ms as number,
          )
          return
        }

        if (type === 'tile_claimed') {
          const { currentUser, cooldownMs } = useGridStore.getState()
          claimTile(
            {
              id: msg.tile_id as number,
              row: msg.row as number,
              col: msg.col as number,
              owner_name: msg.owner_name as string,
              owner_color: msg.owner_color as string,
              claimed_at: msg.claimed_at as string,
            },
            msg.leaderboard as LeaderboardEntry[],
          )
          if (msg.owner_name === currentUser?.name) {
            setCooldown(Date.now() + cooldownMs)
          } else {
            toast(`${msg.owner_name as string} claimed a tile!`, {
              icon: '⚡',
              style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' },
              duration: 2000,
            })
          }
          return
        }

        if (type === 'claim_rejected') {
          if (msg.reason === 'cooldown') {
            const remaining = (msg.cooldown_remaining_ms as number) ?? 0
            setCooldown(Date.now() + remaining)
            toast.error(`Cooldown! Wait ${(remaining / 1000).toFixed(1)}s`, {
              style: { background: '#fff5f5', color: '#e11d48', border: '1px solid #fecdd3' },
              duration: 2000,
            })
          } else {
            toast('That tile is already yours!', {
              style: { background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' },
              duration: 1500,
            })
          }
          return
        }

        if (type === 'presence') {
          setOnlineCount(msg.online_count as number)
          return
        }

        if (type === 'match_end') {
          setMatchOver(true, msg.leaderboard as LeaderboardEntry[])
          return
        }

        if (type === 'match_reset') {
          resetMatch(msg.tiles as TileState[], msg.match_ends_at as string)
          return
        }
      }
    }

    connect()

    return () => {
      mountedRef.current = false
      if (pingRef.current) clearInterval(pingRef.current)
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [identity])

  const claimTileWS = (tile_id: number) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'claim', tile_id }))
    }
  }

  const exitMatch = () => {
    mountedRef.current = false
    if (reconnectRef.current) clearTimeout(reconnectRef.current)
    if (pingRef.current) clearInterval(pingRef.current)
    wsRef.current?.close()
  }

  return { claimTileWS, exitMatch }
}
