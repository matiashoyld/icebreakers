-- AlterTable
ALTER TABLE "Simulation" DROP COLUMN "context",
ADD COLUMN "simulationType" TEXT NOT NULL; 