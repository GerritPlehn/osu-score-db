import {
	type Event,
	type MatchData,
	type ResultEvent,
	eventSchema,
	rawMatchSchema,
} from "./types/Match";

export class Match {
	matchData: MatchData;

	constructor(match: unknown) {
		const newMatch = rawMatchSchema.parse(match);
		const relevantEvents: Event[] = [];
		for (const event of newMatch.events) {
			const eventParse = eventSchema.safeParse(event);
			if (eventParse.success) {
				relevantEvents.push(eventParse.data);
			}
		}
		this.matchData = { ...newMatch, events: relevantEvents };
	}

	get isFinished() {
		const hasEndDate = this.matchData.match.end_time !== null;
		console.log(`Match has end date: ${hasEndDate}`);
		const disbandEvent = this.matchData.events.find(
			(event) => event?.detail?.type === "match-disbanded",
		);
		console.log(`Match has been disbanded: ${!!disbandEvent}`);
		return hasEndDate ?? !!disbandEvent;
	}

	get players() {
		const players = new Map<number, string>();
		for (const score of this.scores) {
			players.set(score.userId, "UNKNOWN");
		}
		for (const user of this.matchData.users) {
			players.set(user.id, user.username);
		}

		return Array.from(players.entries()).map(([id, name]) => ({
			id,
			name,
		}));
	}

	private get resultEvents() {
		return this.matchData.events.filter(
			(gameEvent): gameEvent is ResultEvent =>
				gameEvent.detail.type === "other",
		);
	}

	get scores() {
		const scores = [];
		for (const resultEvent of this.resultEvents) {
			scores.push(
				...resultEvent.game.scores.map((score) => {
					return {
						userId: score.user_id,
						mapId: resultEvent.game.beatmap_id,
						score: score.score,
						accuracy: score.accuracy,
					};
				}),
			);
		}
		return scores;
	}

	get maps() {
		return this.resultEvents.map((gameEvent) => {
			return gameEvent.game.beatmap_id;
		});
	}
}
