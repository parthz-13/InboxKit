export interface TileState {
  id: number
  row: number
  col: number
  owner_name: string | null
  owner_color: string | null
  claimed_at: string | null
}

export interface LeaderboardEntry {
  name: string
  color: string
  count: number
}

export interface UserInfo {
  session_id: string
  name: string
  color: string
}
