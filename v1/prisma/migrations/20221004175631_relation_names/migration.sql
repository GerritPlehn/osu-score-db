/*
  Warnings:

  - You are about to drop the `_MatchToPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MatchToPlayer" DROP CONSTRAINT "_MatchToPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToPlayer" DROP CONSTRAINT "_MatchToPlayer_B_fkey";

-- DropTable
DROP TABLE "_MatchToPlayer";

-- CreateTable
CREATE TABLE "_PlayerMatches" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerMatches_AB_unique" ON "_PlayerMatches"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerMatches_B_index" ON "_PlayerMatches"("B");

-- AddForeignKey
ALTER TABLE "_PlayerMatches" ADD CONSTRAINT "_PlayerMatches_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerMatches" ADD CONSTRAINT "_PlayerMatches_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
