import { z } from 'zod'

const envShape = z.object({
  OSU_CLIENT_ID: z.string(),
  OSU_CLIENT_SECRET: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_USERNAME: z.string(),
  DATABASE_PASSWORD: z.string(),
})

export const env = envShape.parse(process.env)
