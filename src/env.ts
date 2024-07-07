import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		DATABASE_URL: z.string(),
		OSU_CLIENT_ID: z.string(),
		OSU_CLIENT_SECRET: z.string(),
		OSU_ACCESS_TOKEN: z.string().optional(),
		REDIS_HOST: z.string().default("localhost"),
		REDIS_PORT: z.coerce.number().default(6379),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	emptyStringAsUndefined: true,
});
