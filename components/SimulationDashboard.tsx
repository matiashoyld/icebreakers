import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardProps {
  stepMetrics: Array<{
    step: number;
    cameraActivationRate: number;
    speakingTimeDistribution: number;
    qualityOfContributions: number;
    taskCompletionEffectiveness: number;
    satisfactionScore: number;
  }>;
  overallMetrics: {
    averageCameraActivationRate: number;
    averageSpeakingTimeDistribution: number;
    averageQualityOfContributions: number;
    averageTaskCompletionEffectiveness: number;
    averageSatisfactionScore: number;
  };
}

export function SimulationDashboard({ stepMetrics, overallMetrics }: DashboardProps) {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Simulation Metrics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className='font-medium'>Overall Metrics</h3>
          <ul>
            <li>Average Camera Activation Rate: {overallMetrics.averageCameraActivationRate}%</li>
            <li>Average Speaking Time Distribution: {overallMetrics.averageSpeakingTimeDistribution}%</li>
            <li>Average Quality of Contributions: {overallMetrics.averageQualityOfContributions}%</li>
            <li>Average Task Completion Effectiveness: {overallMetrics.averageTaskCompletionEffectiveness}%</li>
            <li>Average Satisfaction Score: {overallMetrics.averageSatisfactionScore}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <table className='w-full'>
            <thead>
              <tr>
                <th>Step</th>
                <th>Camera Activation Rate</th>
                <th>Speaking Time Distribution</th>
                <th>Quality of Contributions</th>
                <th>Task Completion Effectiveness</th>
                <th>Satisfaction Score</th>
              </tr>
            </thead>
            <tbody>
              {stepMetrics.map((metric) => (
                <tr key={metric.step}>
                  <td>{metric.step}</td>
                  <td>{metric.cameraActivationRate}%</td>
                  <td>{metric.speakingTimeDistribution}%</td>
                  <td>{metric.qualityOfContributions}%</td>
                  <td>{metric.taskCompletionEffectiveness}%</td>
                  <td>{metric.satisfactionScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
} 