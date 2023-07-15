import Bottleneck from 'bottleneck'
import { osu, redis } from '../lib/config'
import { Job, Worker } from 'bullmq'
import { Match, Player, PrismaClient } from '@prisma/client'
import axios from 'axios'
import type { MatchJob, WorkerJob } from '../lib/jobs'
import { MatchApiResponse } from '../types/Match'
const prisma = new PrismaClient()

const limiter = new Bottleneck({
  minTime: 1000,
  maxConcurrent: 1,
})

const osuApiOptions = {
  method: 'get',
  prefixUrl: `${osu.baseUrl}/api/v2`,
  headers: {
    Accept: 'application/json',
    Authorization: '',
    'Content-Type': 'application/json',
  },
}

const work = async (job: Job<WorkerJob>) => {
  console.log(`got ${job.name}`)
  switch (job.data.type) {
    case 'archiveMatch': {
      await matchJobHandler(job as Job<MatchJob>)
    }
  }
}

const matchJobHandler = async (job: Job<MatchJob>) => {
  console.log('checking for existing match')
  const existingMatch = await prisma.match.findUnique({
    where: { id: job.data.data.matchId },
  })
  console.log(existingMatch)
  if (existingMatch) throw new Error('Match was already analyzed')
  console.log('getting token if necessary')
  // TODO: check if match was disbanded
  if (!osuApiOptions.headers.Authorization.length) {
    await getToken()
  }
  console.log('scheduling match retrieval from api')
  const match = await limiter.schedule(() => getMatch(job.data.data.matchId))
  console.log(match)
  if (!isFinished(match)) throw new Error('Match not finished yet')
  const maps = getMaps(match)
  const players = getPlayers(match)
  const scores = getScores(match)
}

const getMatch = async (matchId: Match['id']): Promise<MatchApiResponse> => {
  console.log('getting match ' + matchId)
  const res = await axios(`${osu.baseUrl}/api/v2/matches/${matchId}`, {
    headers: osuApiOptions.headers,
  })
  console.log('got match', res.data)
  return res.data as MatchApiResponse
}

const getMaps = (match: MatchApiResponse) => {
  const gameEvents = getGameEvents(match)
  const maps = gameEvents.map((gameEvent) => {
    return {
      id: gameEvent.game.beatmap.id,
      version: gameEvent.game.beatmap.version,
      name: gameEvent.game.beatmap.beatmapset.title,
    }
  })
  return maps
}

const getScores = (match: MatchApiResponse) => {
  const gameEvents = getGameEvents(match)
  const scores = []
  for (const gameEvent of gameEvents) {
    scores.push(
      ...gameEvent.game.scores.map((score) => {
        return {
          userId: score.user_id,
          mapId: gameEvent.game.beatmap.id,
          score: score.score,
          accuracy: score.accuracy,
        }
      })
    )
  }
  return scores
}

const getGameEvents = (match: MatchApiResponse) => {
  return match.events.filter(
    (event) => event.detail.type === 'other' && event.game
  )
}

const getPlayers = (match: MatchApiResponse) => {
  const users = match?.users.map((user) => {
    return { id: user.id, name: user.username }
  })
  return users
}

const isFinished = (match: MatchApiResponse): Boolean => {
  const disbandEvent = match.events.find(
    (event) => event?.detail?.type === 'match-disbanded'
  )
  return !!disbandEvent
}

const getToken = async () => {
  console.log('getting new auth token')
  const res = await axios.post(`${osu.baseUrl}/oauth/token`, {
    client_id: osu.client_id,
    client_secret: osu.client_secret,
    grant_type: osu.grant_type,
    scope: osu.scope,
  })
  if (res.statusText !== 'OK') {
    console.error(res)
    throw new Error('Auth failed')
  }
  const resBody = res.data as AuthResponse
  console.log('got new auth', resBody)
  osuApiOptions.headers.Authorization = `Bearer ${resBody.access_token}`
  setTimeout(() => {
    getToken()
  }, resBody.expires_in * 1000 - 60)
  console.log('refreshing token in ' + resBody.expires_in + ' seconds')
  return
}

const connection = {
  host: redis.url,
  port: redis.port,
  password: redis.password,
  tls: redis.tls,
}

const main = async () => {
  const myWorker = new Worker('matches', work, {
    connection,
  })
  console.log('registered worker')
}

main()

type AuthResponse = {
  access_token: String
  expires_in: number
  token_type: 'Bearer'
}
