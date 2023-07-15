const osu = {
  baseUrl: 'https://osu.ppy.sh',
  client_id: process.env.OSU_CLIENT_ID,
  client_secret: process.env.OSU_CLIENT_SECRET,
  grant_type: 'client_credentials',
  scope: 'public',
}

const redis = {
  port: Number(process.env.REDIS_PORT),
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_SSL === 'true' ? {} : undefined
}

export { redis, osu }
