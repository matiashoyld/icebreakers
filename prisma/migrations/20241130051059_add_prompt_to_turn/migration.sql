/*
  Warnings:

  - Added the required column `prompt` to the `SimulationTurn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SimulationTurn" ADD COLUMN     "prompt" TEXT NOT NULL;
