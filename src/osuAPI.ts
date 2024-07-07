import { z } from "zod";
import { createZodFetcher } from "zod-fetch";

const zFetch = createZodFetcher();

import { env } from "./env.js";
import { type OsuUser, rawMatchSchema } from "./types/osu.js";

const baseUrl = "https://osu.ppy.sh";
const apiBaseUrl = `${baseUrl}/api/v2`;
const oauthBaseUrl = `${baseUrl}/oauth`;

const authToken = z.object({
	access_token: z.string(),
	token_type: z.string(),
	expires_in: z.number(),
});

export class OsuAPI {
	private static instance: OsuAPI | null = null;
	private accessToken: string | null = null;
	private expiresIn = 0;
	private readonly clientId: string;
	private readonly clientSecret: string;

	private constructor(clientId: string, clientSecret: string) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	public static async getInstance(
		clientId = env.OSU_CLIENT_ID,
		clientSecret = env.OSU_CLIENT_SECRET,
	) {
		if (!OsuAPI.instance) {
			console.log("Initializing OsuAPI");
			OsuAPI.instance = new OsuAPI(clientId, clientSecret);
			await OsuAPI.instance.initialize();
			console.log("OsuAPI initialized");
		}
		return OsuAPI.instance;
	}

	private async initialize() {
		console.log("Getting initial token");
		if (!env.OSU_ACCESS_TOKEN) {
			const initialTokenResponse = await this.getToken();
			this.accessToken = initialTokenResponse.access_token;
			this.expiresIn = initialTokenResponse.expires_in;
		} else {
			this.accessToken = env.OSU_ACCESS_TOKEN;
			this.expiresIn = 86400;
		}

		// Schedule token refresh
		this.scheduleTokenRefresh();
	}

	private async getToken() {
		console.log("Getting token");
		const response = await zFetch(authToken, `${oauthBaseUrl}/token`, {
			body: new URLSearchParams({
				client_id: this.clientId,
				client_secret: this.clientSecret,
				scope: "public",
				grant_type: "client_credentials",
			}),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			method: "POST",
		});
		console.log("Got token");
		console.log(response);
		return response;
	}

	private async doTokenRefresh() {
		// Get a new token
		console.log("Refreshing token");
		const refreshResponse = await this.getToken();
		this.accessToken = refreshResponse.access_token;
		this.expiresIn = refreshResponse.expires_in;

		this.scheduleTokenRefresh();
		console.log("Token refreshed");
	}

	private scheduleTokenRefresh() {
		// Calculate the time in milliseconds to wait before refreshing the token
		const refreshDelay = (this.expiresIn - 60) * 1000; // Refresh 1 minute before expiration
		console.log(`Scheduling token refresh in${refreshDelay}ms`);
		// Schedule the token refresh
		setTimeout(() => this.doTokenRefresh(), refreshDelay);
	}

	public getMatch = async (matchId: number) => {
		if (!this.accessToken) {
			throw new Error("No access token (this should never happen)");
		}
		let matchData: z.infer<typeof rawMatchSchema>;
		const events = [];
		const users: OsuUser[] = [];
		let hasMore = true;
		const params = new URLSearchParams();
		while (hasMore) {
			const matchPage = await zFetch(
				rawMatchSchema,
				`${apiBaseUrl}/matches/${matchId}?${params.toString()}`,
				{
					headers: { Authorization: `Bearer ${this.accessToken}` },
				},
			);
			events.push(...matchPage.events);
			users.push(...matchPage.users);
			matchData = { ...matchPage, events, users };

			const firstId = matchPage.events.at(0)?.id ?? "";
			hasMore = firstId !== matchData.first_event_id;
			if (!hasMore) {
				return matchData;
			}
			params.set("before", firstId?.toString());
		}
	};

	public getMap = async (mapId: number) => {
		// TODO: implement properly
		return { id: mapId, name: "Test Map", version: "1" };
	};
}
