/*
  Warnings:

  - Added the required column `version` to the `Map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accuracy` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_combo` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Map" ADD COLUMN     "version" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Map_id_seq";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Match_id_seq";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Player_id_seq";

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "accuracy" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "max_combo" INTEGER NOT NULL,
ADD COLUMN     "score" INTEGER NOT NULL;
