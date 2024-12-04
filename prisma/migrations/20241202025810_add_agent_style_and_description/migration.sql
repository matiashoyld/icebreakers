/*
  Warnings:

  - Added the required column `agentDescription` to the `SimulationParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speakingStyle` to the `SimulationParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SimulationParticipant" ADD COLUMN     "agentDescription" TEXT NOT NULL,
ADD COLUMN     "speakingStyle" TEXT NOT NULL;
