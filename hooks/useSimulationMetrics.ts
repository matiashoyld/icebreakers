import { useEffect, useState } from 'react';
import { SimulationTurn } from '@/lib/services/simulation-service';
import { evaluateQualityOfContributions } from '@/lib/llm/prompts/prompts';

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
    const calculateStepMetrics = async () => {
      const newStepMetrics: StepMetrics[] = await Promise.all(simulationTurns.map(async (turn, index) => ({
        step: index + 1,
        cameraActivationRate: turn.cameraStatus ? 100 : 0,
        // Assuming speakingTimeDistribution is a placeholder for actual logic
        speakingTimeDistribution: 0, // Placeholder value
        // Call LLM to evaluate quality of contributions
        qualityOfContributions: turn.message ? await evaluateQualityOfContributions(turn.message) : 0,
        taskCompletionEffectiveness: turn.action === 'speak' ? 100 : 0,
        satisfactionScore: Math.random() * 100,
      })));

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
    };

    calculateStepMetrics();
  }, [simulationTurns]);

  return { stepMetrics, overallMetrics };
} 