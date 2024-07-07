import { relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgSchema,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const schema = pgSchema("osu_score_db");

export const maps = schema.table("map", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	version: text("version").notNull(),
});

export const mapRelations = relations(maps, ({ many }) => ({
	scores: many(scores),
}));

export const matches = schema.table("match", {
	id: serial("id").primaryKey(),
	startTime: timestamp("start_time"),
	endTime: timestamp("end_time"),
	name: text("name"),
	rawData: jsonb("raw_data"),
	processingStatus: text("processing_status", {
		enum: ["queued", "failed", "done"],
	}),
	processedAt: timestamp("processed_at"),
});

export const matchRelations = relations(matches, ({ many }) => ({
	scores: many(scores),
}));

export const mods = schema.table("mod", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export const modRelations = relations(mods, ({ many }) => ({
	scores: many(scores),
}));

export const players = schema.table("player", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export const playerRelations = relations(players, ({ many }) => ({
	scores: many(scores),
}));

export const scores = schema.table("score", {
	id: serial("id").primaryKey(),
	mapId: integer("map_id").notNull(),
	playerId: integer("player_id").notNull(),
	score: integer("score").notNull(),
	accuracy: numeric("accuracy").notNull(),
	maxCombo: integer("max_combo").notNull(),
	matchId: integer("match_id").notNull(),
	mods: jsonb("mods"),
});

export const scoresRelations = relations(scores, ({ one, many }) => ({
	maps: one(maps, { fields: [scores.mapId], references: [maps.id] }),
	match: one(matches, { fields: [scores.matchId], references: [matches.id] }),
	players: one(players, {
		fields: [scores.playerId],
		references: [players.id],
	}),
	mods: many(mods),
}));

export type OsuMap = typeof maps.$inferSelect;
