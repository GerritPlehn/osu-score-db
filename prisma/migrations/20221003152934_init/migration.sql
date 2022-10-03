-- CreateTable
CREATE TABLE "Map" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "mapId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Mod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "osustats" (
    "id" UUID NOT NULL,
    "playerid" VARCHAR,
    "beatmap_playcounts_count" INTEGER,
    "follower_count" INTEGER,
    "level" DECIMAL(5,2),
    "global_rank" INTEGER,
    "pp" DECIMAL(7,2),
    "ranked_score" BIGINT,
    "hit_accuracy" DECIMAL(7,4),
    "play_count" INTEGER,
    "play_time" INTEGER,
    "total_score" BIGINT,
    "total_hits" INTEGER,
    "maximum_combo" SMALLINT,
    "replays_watched_by_others" INTEGER,
    "is_ranked" BOOLEAN,
    "grades_ssh" INTEGER,
    "grades_ss" INTEGER,
    "grades_sh" INTEGER,
    "grades_s" INTEGER,
    "grades_a" INTEGER,
    "country_rank" INTEGER,
    "timestamp" TIMESTAMP(0),

    CONSTRAINT "osustats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MatchToPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ModToScore" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Mod_name_key" ON "Mod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_MatchToPlayer_AB_unique" ON "_MatchToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_MatchToPlayer_B_index" ON "_MatchToPlayer"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModToScore_AB_unique" ON "_ModToScore"("A", "B");

-- CreateIndex
CREATE INDEX "_ModToScore_B_index" ON "_ModToScore"("B");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchToPlayer" ADD CONSTRAINT "_MatchToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchToPlayer" ADD CONSTRAINT "_MatchToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModToScore" ADD CONSTRAINT "_ModToScore_A_fkey" FOREIGN KEY ("A") REFERENCES "Mod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModToScore" ADD CONSTRAINT "_ModToScore_B_fkey" FOREIGN KEY ("B") REFERENCES "Score"("id") ON DELETE CASCADE ON UPDATE CASCADE;
