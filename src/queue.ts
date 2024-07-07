import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { Queue } from "bullmq";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { showRoutes } from "hono/dev";
import { getMatchFromDB } from "./crawler";
import { db } from "./db/db";
import { matches as matchTable } from "./db/schema";
import { env } from "./env";

const retryThreshold = 1000 * 60 * 60 * 24; // 1 day

export const connection = {
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
};

export type MatchJobData = { id: number };

const matchQueue = new Queue<MatchJobData>("match", {
	connection,
});

export async function handleArchiveRequest(matchId: number) {
	console.log(`Handling archive request for match ${matchId}`);
	const matchDB = await getMatchFromDB(matchId);
	let statusMessage = "Archiving for match requested";
	let process = false;
	if (matchDB) {
		switch (matchDB.processingStatus) {
			case "done":
				statusMessage = "Match already crawled";
				break;
			case "queued":
				statusMessage = "Match already queued";
				break;
			case "failed":
				if (
					matchDB.processedAt &&
					matchDB.processedAt.getTime() > Date.now() - retryThreshold
				) {
					statusMessage = "Match failed recently, not retrying";
					break;
				}
				statusMessage = "Retrying match";
				process = true;
				return;
			default: {
				statusMessage = "Match already crawled";
				break;
			}
		}
	} else {
		process = true;
	}
	if (process) {
		await db.insert(matchTable).values({
			id: matchId,
			processingStatus: "queued",
			processedAt: new Date(),
		});
		await matchQueue.add("archive", { id: matchId });
	}
	console.log(statusMessage, matchId);
	return { matchId, message: statusMessage };
}

const app = new Hono();
const serverAdapter = new HonoAdapter(serveStatic);

createBullBoard({
	queues: [new BullMQAdapter(matchQueue)],
	serverAdapter,
});
const basePath = "/ui";
serverAdapter.setBasePath(basePath);
app.route(basePath, serverAdapter.registerPlugin());
app.get("/", async (c) => c.json({ message: "Hello World" }));

export default app;
