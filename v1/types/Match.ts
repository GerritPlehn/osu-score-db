export interface Match {
  id: number
  start_time: Date
  end_time: Date
  name: string
}

export interface Detail {
  type: string
  text: string
}

export interface Covers {
  cover: string
  'cover@2x': string
  card: string
  'card@2x': string
  list: string
  'list@2x': string
  slimcover: string
  'slimcover@2x': string
}

export interface Beatmapset {
  artist: string
  artist_unicode: string
  covers: Covers
  creator: string
  favourite_count: number
  hype?: any
  id: number
  nsfw: boolean
  offset: number
  play_count: number
  preview_url: string
  source: string
  spotlight: boolean
  status: string
  title: string
  title_unicode: string
  track_id?: number
  user_id: number
  video: boolean
}

export interface Beatmap {
  beatmapset_id: number
  difficulty_rating: number
  id: number
  mode: string
  status: string
  total_length: number
  user_id: number
  version: string
  beatmapset: Beatmapset
}

export interface Statistics {
  count_100: number
  count_300: number
  count_50: number
  count_geki: number
  count_katu: number
  count_miss: number
}

export interface CurrentUserAttributes {
  pin?: any
}

export interface Match2 {
  slot: number
  team: string
  pass: boolean
}

export interface Score {
  accuracy: number
  best_id?: any
  created_at: Date
  id?: any
  max_combo: number
  mode: string
  mode_int: number
  mods: string[]
  passed: boolean
  perfect: number
  pp?: any
  rank: string
  replay: boolean
  score: number
  statistics: Statistics
  type: string
  user_id: number
  current_user_attributes: CurrentUserAttributes
  match: Match2
}

export interface Game {
  id: number
  start_time: Date
  end_time: Date
  mode: string
  mode_int: number
  scoring_type: string
  team_type: string
  mods: string[]
  beatmap: Beatmap
  scores: Score[]
}

export interface Event {
  id: number
  detail: Detail
  timestamp: Date
  user_id?: number
  game: Game
}

export interface Country {
  code: string
  name: string
}

export interface User {
  avatar_url: string
  country_code: string
  default_group: string
  id: number
  is_active: boolean
  is_bot: boolean
  is_deleted: boolean
  is_online: boolean
  is_supporter: boolean
  last_visit?: Date
  pm_friends_only: boolean
  profile_colour?: any
  username: string
  country: Country
}

export interface MatchApiResponse {
  match: Match
  events: Event[]
  users: User[]
  first_event_id: number
  latest_event_id: number
  current_game_id?: any
}
