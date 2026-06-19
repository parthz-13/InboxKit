import { create } from 'zustand'
import type { LeaderboardEntry, TileState, UserInfo } from '../types'

interface GridStore {
  tiles: TileState[]
  leaderboard: LeaderboardEntry[]
  currentUser: UserInfo | null
  onlineCount: number
  isConnected: boolean
  cooldownUntil: number
  cooldownMs: number
  recentlyClaimed: Set<number>
  matchEndsAt: string | null
  matchOver: boolean
  finalLeaderboard: LeaderboardEntry[]

  initState: (tiles: TileState[], leaderboard: LeaderboardEntry[], user: UserInfo, online: number, matchEndsAt: string, cooldownMs: number) => void
  claimTile: (tile: TileState, leaderboard: LeaderboardEntry[]) => void
  setOnlineCount: (count: number) => void
  setCooldown: (until: number) => void
  setConnected: (connected: boolean) => void
  setMatchOver: (over: boolean, leaderboard?: LeaderboardEntry[]) => void
  resetMatch: (tiles: TileState[], matchEndsAt: string) => void
}

export const useGridStore = create<GridStore>((set) => ({
  tiles: [],
  leaderboard: [],
  currentUser: null,
  onlineCount: 0,
  isConnected: false,
  cooldownUntil: 0,
  cooldownMs: 3000,
  recentlyClaimed: new Set(),
  matchEndsAt: null,
  matchOver: false,
  finalLeaderboard: [],

  initState: (tiles, leaderboard, user, online, matchEndsAt, cooldownMs) =>
    set({ tiles, leaderboard, currentUser: user, onlineCount: online, matchEndsAt, matchOver: false, cooldownMs }),

  claimTile: (tileUpdate, leaderboard) =>
    set((state) => {
      const tiles = [...state.tiles]
      tiles[tileUpdate.id] = tileUpdate
      const recentlyClaimed = new Set(state.recentlyClaimed)
      recentlyClaimed.add(tileUpdate.id)
      setTimeout(() => {
        useGridStore.setState((s) => {
          const next = new Set(s.recentlyClaimed)
          next.delete(tileUpdate.id)
          return { recentlyClaimed: next }
        })
      }, 800)
      return { tiles, leaderboard, recentlyClaimed }
    }),

  setOnlineCount: (count) => set({ onlineCount: count }),
  setCooldown: (until) => set({ cooldownUntil: until }),
  setConnected: (connected) => set({ isConnected: connected }),

  setMatchOver: (over, leaderboard) =>
    set((s) => ({ matchOver: over, finalLeaderboard: leaderboard ?? s.finalLeaderboard })),

  resetMatch: (tiles, matchEndsAt) =>
    set({ tiles, leaderboard: [], matchEndsAt, matchOver: false, recentlyClaimed: new Set() }),
}))
