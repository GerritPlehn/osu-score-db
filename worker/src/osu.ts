import { createZodFetcher } from 'zod-fetch'
import { ZodSchema, z } from 'zod'
import axios from 'axios'

const authFetcher = createZodFetcher(axios.post)
const apiFetcher = createZodFetcher(axios.get)

import { rootSchema } from '../types/Match.js'

const matchResponseSchema = z.object({ data: rootSchema })

const authToken = z.object({
  data: z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
  }),
})

export class OsuAPI {
  private static instance: OsuAPI | null = null
  private accessToken: string | null = null
  private expiresIn: number = 0
  private readonly clientId: string
  private readonly clientSecret: string

  private constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  public static async getInstance(clientId: string, clientSecret: string) {
    if (!OsuAPI.instance) {
      console.log('Initializing OsuAPI')
      OsuAPI.instance = new OsuAPI(clientId, clientSecret)
      await OsuAPI.instance.initialize()
      console.log('OsuAPI initialized')
    }
    return OsuAPI.instance
  }

  private async initialize() {
    console.log('Getting initial token')
    const initialTokenResponse = await this.getToken()
    this.accessToken = initialTokenResponse.access_token
    this.expiresIn = initialTokenResponse.expires_in

    // Schedule token refresh
    this.scheduleTokenRefresh()
  }

  private async getToken() {
    console.log('Getting token')
    const response = await authFetcher(
      authToken,
      'https://osu.ppy.sh/oauth/token',
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'public',
        grant_type: 'client_credentials',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      }
    )
    console.log('Got token')
    return response.data
  }

  private async doTokenRefresh() {
    // Get a new token
    console.log('Refreshing token')
    const refreshResponse = await this.getToken()
    this.accessToken = refreshResponse.access_token
    this.expiresIn = refreshResponse.expires_in

    this.scheduleTokenRefresh()
    console.log('Token refreshed')
  }

  private scheduleTokenRefresh() {
    // Calculate the time in milliseconds to wait before refreshing the token
    const refreshDelay = (this.expiresIn - 60) * 1000 // Refresh 1 minute before expiration
    console.log('Scheduling token refresh in' + refreshDelay + 'ms')
    // Schedule the token refresh
    setTimeout(() => this.doTokenRefresh(), refreshDelay)
  }

  public getMatch = async (matchId: number) => {
    if (!this.accessToken) {
      throw new Error('No access token (this should never happen)')
    }
    return (
      await apiFetcher(
        matchResponseSchema,
        `https://osu.ppy.sh/api/v2/matches/${matchId}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      )
    ).data
  }
}
