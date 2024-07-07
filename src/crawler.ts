import { sql } from "drizzle-orm";
import { Match } from "./Match";
import { db } from "./db/db";
import {
	type OsuMap,
	maps as mapTable,
	matches as matchTable,
	players as playerTable,
	scores as scoreTable,
} from "./db/schema";
import { env } from "./env";
import { OsuAPI } from "./osuAPI";

export async function archiveMatch(matchId: number) {
	console.log(`Crawling match ${matchId}`);
	if (await isMatchCrawled(matchId)) {
		console.log(`Match ${matchId} already crawled`);
		return;
	}
	console.log(`Match ${matchId} not crawled yet`);
	const match = await getMatchFromAPI(matchId);
	await saveMatchToDB(match);
	console.log(`Match ${matchId} archived successfully`);
}

async function isMatchCrawled(matchId: number) {
	console.log(`Checking if match ${matchId} is crawled`);
	const match = await db.query.matches.findFirst({
		where: (matches, { eq }) => eq(matches.id, matchId),
	});
	console.log(`Match ${matchId} is ${match ? "" : "not "}crawled`);
	return !!match;
}

async function getMatchFromAPI(matchId: number) {
	console.log(`Getting match ${matchId} from API`);
	const api = await OsuAPI.getInstance(
		env.OSU_CLIENT_ID,
		env.OSU_CLIENT_SECRET,
	);
	const matchData = await api.getMatch(matchId);
	const match = new Match(matchData);
	console.log(`Match ${matchId} retrieved successfully`);
	return match;
}

async function getMapFromAPI(mapId: number) {
	console.log(`Getting map ${mapId} from API`);
	const api = await OsuAPI.getInstance(
		env.OSU_CLIENT_ID,
		env.OSU_CLIENT_SECRET,
	);
	// fallback to deleted map if map is not found
	let map = { id: mapId, name: "deleted", version: "deleted" };
	try {
		map = await api.getMap(mapId);
		console.log(`Map ${mapId} retrieved successfully`);
	} catch (error) {
		console.warn(`Map ${mapId} not found, using fallback`);
	}
	return map;
}

export async function saveMatchToDB(match: Match) {
	const matchData = match.matchData;
	await saveUsersToDB(match.players);
	await saveMapsToDB(
		await Promise.all(match.maps.map((mId) => getMapFromAPI(mId))),
	);
	if (!matchData.match.end_time) {
		throw new Error("Match is not finished yet, cannot save to DB");
	}
	console.log(`Saving match ${match.matchData.match.id} to DB`);
	await db.insert(matchTable).values({
		id: matchData.match.id,
		startTime: matchData.match.start_time,
		endTime: matchData.match.end_time,
		name: matchData.match.name,
		rawData: matchData,
	});
	console.log(`Saved match ${match.matchData.match.id} to DB`);
	await saveScoresToDB(
		match.scores.map((score) => {
			return {
				playerId: score.userId,
				mapId: score.mapId,
				score: score.score,
				accuracy: score.accuracy.toFixed(2),
				matchId: matchData.match.id,
				maxCombo: 0,
			};
		}),
	);
}

async function saveScoresToDB(scores: (typeof scoreTable.$inferInsert)[]) {
	console.log(`Saving ${scores.length} scores to DB`);
	await db.insert(scoreTable).values(scores).onConflictDoNothing();
	console.log(`Saved ${scores.length} scores to DB`);
}

async function saveUsersToDB(users: GenericRecord[]) {
	console.log(`Saving ${users.length} users to DB`);
	await db
		.insert(playerTable)
		.values(users)
		.onConflictDoUpdate({
			target: playerTable.id,
			set: { name: sql.raw(`excluded.${playerTable.name.name}`) },
		});
	console.log(`Saved ${users.length} users to DB`);
}

async function saveMapsToDB(maps: OsuMap[]) {
	console.log(`Saving ${maps.length} maps to DB`);
	await db
		.insert(mapTable)
		.values(maps)
		.onConflictDoUpdate({
			target: mapTable.id,
			set: {
				name: sql.raw(`excluded.${mapTable.name.name}`),
				version: sql.raw(`excluded.${mapTable.version.name}`),
			},
		});
	console.log(`Saved ${maps.length} maps to DB`);
}

// put match id in db with status "crawling"
// handle in progress matches (cooldown 5 minutes after last crawl attempt)
type GenericRecord = { id: number; name: string };
