import { z } from "zod"

export const matchSchema = z.object({
  id: z.number(),
  start_time: z.string(),
  end_time: z.string(),
  name: z.string()
})

export const detailSchema = z.object({
  type: z.string(),
  text: z.string().optional()
})

export const coversSchema = z.object({
  cover: z.string(),
  "cover@2x": z.string(),
  card: z.string(),
  "card@2x": z.string(),
  list: z.string(),
  "list@2x": z.string(),
  slimcover: z.string(),
  "slimcover@2x": z.string()
})

export const hypeSchema = z.object({
  current: z.number(),
  required: z.number()
})

export const statisticsSchema = z.object({
  count_100: z.number(),
  count_300: z.number(),
  count_50: z.number(),
  count_geki: z.number(),
  count_katu: z.number(),
  count_miss: z.number()
})

export const currentUserAttributesSchema = z.object({
  pin: z.any()
})

export const match2Schema = z.object({
  slot: z.number(),
  team: z.string(),
  pass: z.boolean()
})

export const countrySchema = z.object({
  code: z.string(),
  name: z.string()
})

export const beatmapsetSchema = z.object({
  artist: z.string(),
  artist_unicode: z.string(),
  covers: coversSchema,
  creator: z.string(),
  favourite_count: z.number(),
  hype: hypeSchema.nullable(),
  id: z.number(),
  nsfw: z.boolean(),
  offset: z.number(),
  play_count: z.number(),
  preview_url: z.string(),
  source: z.string(),
  spotlight: z.boolean(),
  status: z.string(),
  title: z.string(),
  title_unicode: z.string(),
  track_id: z.number().nullable(),
  user_id: z.number(),
  video: z.boolean()
})

export const scoresSchema = z.object({
  accuracy: z.number(),
  best_id: z.any(),
  created_at: z.string(),
  id: z.any(),
  max_combo: z.number(),
  mode: z.string(),
  mode_int: z.number(),
  mods: z.array(z.string()),
  passed: z.boolean(),
  perfect: z.number(),
  pp: z.any(),
  rank: z.string(),
  replay: z.boolean(),
  score: z.number(),
  statistics: statisticsSchema,
  type: z.string(),
  user_id: z.number(),
  current_user_attributes: currentUserAttributesSchema,
  match: match2Schema
})

export const userSchema = z.object({
  avatar_url: z.string(),
  country_code: z.string(),
  default_group: z.string(),
  id: z.number(),
  is_active: z.boolean(),
  is_bot: z.boolean(),
  is_deleted: z.boolean(),
  is_online: z.boolean(),
  is_supporter: z.boolean(),
  last_visit: z.string().nullable(),
  pm_friends_only: z.boolean(),
  profile_colour: z.any(),
  username: z.string(),
  country: countrySchema
})

export const beatmapSchema = z.object({
  beatmapset_id: z.number(),
  difficulty_rating: z.number(),
  id: z.number(),
  mode: z.string(),
  status: z.string(),
  total_length: z.number(),
  user_id: z.number(),
  version: z.string(),
  beatmapset: beatmapsetSchema
})

export const gameSchema = z.object({
  beatmap_id: z.number(),
  id: z.number(),
  start_time: z.string(),
  end_time: z.string(),
  mode: z.string(),
  mode_int: z.number(),
  scoring_type: z.string(),
  team_type: z.string(),
  mods: z.array(z.string()),
  beatmap: beatmapSchema.optional(),
  scores: z.array(scoresSchema)
})

export const eventSchema = z.object({
  id: z.number(),
  detail: detailSchema,
  timestamp: z.string(),
  user_id: z.number().nullable(),
  game: gameSchema.optional()
})

export const rootSchema = z.object({
  match: matchSchema,
  events: z.array(eventSchema),
  users: z.array(userSchema),
  first_event_id: z.number(),
  latest_event_id: z.number(),
  current_game_id: z.any()
})

export type Match = z.infer<typeof rootSchema>
