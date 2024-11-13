/**
 * Color used for the engagement chart visuals.
 */
export const ENGAGEMENT_CHART_COLOR = '#8884d8'

/**
 * Generates a random engagement score between 0 and 100.
 * This simulates the engagement metric for participants.
 *
 * @returns A random engagement score.
 */
export const getEngagementScore = () => {
  if (typeof window === 'undefined') return 0
  return Math.floor(Math.random() * 100)
}
