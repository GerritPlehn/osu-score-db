import Bottleneck from "bottleneck";
import { z } from "zod";
import { env } from "./env";
import {
	type OsuUser,
	beatmapExtendedSchema,
	rawMatchSchema,
} from "./types/osu";

const limiter = new Bottleneck({
	minTime: 1000, // 1 request per second
	maxConcurrent: 1,
	id: "osu-api",
	datastore: "ioredis",
	clearDatastore: false,
	clientOptions: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
	},
});

async function zFetch<T extends z.ZodTypeAny>(
	schema: T,
	...params: Parameters<typeof fetch>
) {
	const response = await limiter.schedule(() => fetch(...params));
	if (!response.ok) {
		throw new Error(`Request failed: ${response.statusText}`);
	}
	return schema.parse(await response.json()) as z.infer<T>;
}

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
	private headers = new Headers();

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
			await this.doTokenRefresh();
		} else {
			this.accessToken = env.OSU_ACCESS_TOKEN;
			this.headers.set("Authorization", `Bearer ${this.accessToken}`);
			this.expiresIn = 86400;
		}
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
		return response;
	}

	private async doTokenRefresh() {
		console.log("Refreshing token");
		const refreshResponse = await this.getToken();
		this.accessToken = refreshResponse.access_token;
		this.expiresIn = refreshResponse.expires_in;
		this.headers.set("Authorization", `Bearer ${this.accessToken}`);

		this.scheduleTokenRefresh();
		console.log("Token refreshed");
	}

	private scheduleTokenRefresh() {
		// Calculate the time in milliseconds to wait before refreshing the token
		const refreshDelay = (this.expiresIn - 60) * 1000; // Refresh 1 minute before expiration
		console.log(`Scheduling token refresh in ${refreshDelay}ms`);
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
					headers: this.headers,
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
		const beatmap = await zFetch(
			beatmapExtendedSchema,
			`${apiBaseUrl}/beatmaps/${mapId}`,
			{
				headers: this.headers,
			},
		);
		return {
			id: mapId,
			name: beatmap.beatmapset.title,
			version: beatmap.version,
		};
	};
}
