// import axios from 'axios'
import { z } from 'zod'
// import { Job, Worker } from 'bullmq'

import { env } from './env.js'

// import { drizzle } from 'drizzle-orm/planetscale-serverless'
// import { connect } from '@planetscale/database'

// import { createZodFetcher } from 'zod-fetch'
import { OsuAPI } from './osu.js'

// // create the connection
// const matchDBConnection = connect({
//   host: env.DATABASE_HOST,
//   username: env.DATABASE_USERNAME,
//   password: env.DATABASE_PASSWORD,
// })

// const db = drizzle(matchDBConnection)

const main = async () => {
  const api = await OsuAPI.getInstance(env.OSU_CLIENT_ID, env.OSU_CLIENT_SECRET)
  const match = await api.getMatch(105294878)

  console.log(match)
}
main()
