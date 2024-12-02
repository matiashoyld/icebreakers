import { useEffect, useState } from 'react';
import { SimulationTurn } from '@/lib/services/simulation-service';

interface StepMetrics {
  step: number;
  cameraActivationRate: number;
  speakingTimeDistribution: number;
  qualityOfContributions: number;
  taskCompletionEffectiveness: number;
  satisfactionScore: number;
}

interface OverallMetrics {
  averageCameraActivationRate: number;
  averageSpeakingTimeDistribution: number;
  averageQualityOfContributions: number;
  averageTaskCompletionEffectiveness: number;
  averageSatisfactionScore: number;
}

export function useSimulationMetrics(simulationTurns: SimulationTurn[]) {
  const [stepMetrics, setStepMetrics] = useState<StepMetrics[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics>({
    averageCameraActivationRate: 0,
    averageSpeakingTimeDistribution: 0,
    averageQualityOfContributions: 0,
    averageTaskCompletionEffectiveness: 0,
    averageSatisfactionScore: 0,
  });

  useEffect(() => {
    // Logic to calculate stepMetrics and overallMetrics
    const newStepMetrics: StepMetrics[] = simulationTurns.map((turn, index) => ({
      step: index + 1,
      cameraActivationRate: turn.cameraStatus ? 100 : 0, // Example logic
      speakingTimeDistribution: turn.engagementScore, // Example logic
      qualityOfContributions: turn.decision.length, // Example logic
      taskCompletionEffectiveness: turn.action === 'speak' ? 100 : 0, // Example logic
      satisfactionScore: Math.random() * 100, // Example logic
    }));

    setStepMetrics(newStepMetrics);

    // Calculate overall metrics
    const totalMetrics = newStepMetrics.reduce(
      (acc, metric) => {
        acc.averageCameraActivationRate += metric.cameraActivationRate;
        acc.averageSpeakingTimeDistribution += metric.speakingTimeDistribution;
        acc.averageQualityOfContributions += metric.qualityOfContributions;
        acc.averageTaskCompletionEffectiveness += metric.taskCompletionEffectiveness;
        acc.averageSatisfactionScore += metric.satisfactionScore;
        return acc;
      },
      {
        averageCameraActivationRate: 0,
        averageSpeakingTimeDistribution: 0,
        averageQualityOfContributions: 0,
        averageTaskCompletionEffectiveness: 0,
        averageSatisfactionScore: 0,
      }
    );

    const count = newStepMetrics.length;
    setOverallMetrics({
      averageCameraActivationRate: totalMetrics.averageCameraActivationRate / count,
      averageSpeakingTimeDistribution: totalMetrics.averageSpeakingTimeDistribution / count,
      averageQualityOfContributions: totalMetrics.averageQualityOfContributions / count,
      averageTaskCompletionEffectiveness: totalMetrics.averageTaskCompletionEffectiveness / count,
      averageSatisfactionScore: totalMetrics.averageSatisfactionScore / count,
    });
  }, [simulationTurns]);

  return { stepMetrics, overallMetrics };
} 