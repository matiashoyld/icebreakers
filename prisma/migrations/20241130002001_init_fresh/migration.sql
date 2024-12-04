-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "context" TEXT NOT NULL,
    "totalTurns" INTEGER NOT NULL,
    "taskScore" DOUBLE PRECISION,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationParticipant" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "participantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "wordsSpoken" INTEGER NOT NULL,
    "cameraToggles" INTEGER NOT NULL,
    "timesDoingNothing" INTEGER NOT NULL,
    "participationRate" DOUBLE PRECISION NOT NULL,
    "satisfactionScore" DOUBLE PRECISION,

    CONSTRAINT "SimulationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationTurn" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT,
    "thinkingProcess" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "engagementScore" DOUBLE PRECISION NOT NULL,
    "cameraStatus" BOOLEAN NOT NULL,

    CONSTRAINT "SimulationTurn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SimulationParticipant_simulationId_idx" ON "SimulationParticipant"("simulationId");

-- CreateIndex
CREATE INDEX "SimulationTurn_simulationId_idx" ON "SimulationTurn"("simulationId");

-- CreateIndex
CREATE INDEX "SimulationTurn_participantId_idx" ON "SimulationTurn"("participantId");

-- AddForeignKey
ALTER TABLE "SimulationParticipant" ADD CONSTRAINT "SimulationParticipant_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationTurn" ADD CONSTRAINT "SimulationTurn_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationTurn" ADD CONSTRAINT "SimulationTurn_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "SimulationParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
