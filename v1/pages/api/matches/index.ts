// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Match, PrismaClient } from '@prisma/client'
import { Queue } from 'bullmq'
import { redis } from '../../../lib/config'
import type { WorkerJob, MatchJob } from '../../../lib/jobs'

const matchQueue = new Queue('matches', {
  connection: {
    host: redis.url,
    port: redis.port,
    password: redis.password,
    tls: redis.tls,
  },
})

const prisma = new PrismaClient()

const validateMatchRequest = (requestBody: unknown): Match['id'][] => {
  if (!Array.isArray(requestBody))
    throw new Error('Request Body is not an array')
  const matches: Match['id'][] = []
  for (const item of requestBody) {
    if (!Number.isInteger(item)) throw new Error('Match IDs must be numbers')
    matches.push(item)
  }
  return matches
}

const getHandler: requestHandler = async (req, res) => {
  // TODO: sensible get handler
  const matches = await prisma.match.findMany({
    take: 10,
    include: {
      players: true,
      scores: true,
    },
  })
  return res.status(200).json({ matches })
}

const postHandler: requestHandler = async (req, res) => {
  const { body } = req
  let matchIds: Match['id'][]
  try {
    matchIds = validateMatchRequest(body)
  } catch (error) {
    return res.status(400).send({ error: 'Could not validate request body' })
  }
  await matchQueue.obliterate()
  await addMatchJobsToQueue(
    matchIds.map((matchId) => {
      return {
        type: 'archiveMatch',
        data: { matchId },
      }
    })
  )
  res.status(200).json({ jobs: matchIds.map((matchId) => matchId.toString()) })
}

const addMatchJobsToQueue = (jobs: MatchJob[]) =>
  matchQueue.addBulk(
    jobs.map((job) => {
      return {
        name: job.type,
        data: job,
        opts: { jobId: job.data.matchId.toString() },
      }
    })
  )

const handler: requestHandler = async (req, res) => {
  if (req.method === 'GET') {
    return await getHandler(req, res)
  } else if (req.method === 'POST') {
    return await postHandler(req, res)
  }
}

export default handler

type Data = MatchData | JobData

type JobData = {
  jobs: String[]
}

type MatchData = {
  matches: Match[]
}

type requestHandler = (
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: String }>
) => Promise<void>
