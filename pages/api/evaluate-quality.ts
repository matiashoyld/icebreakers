import { NextApiRequest, NextApiResponse } from 'next';
import { callLLM } from '@/app/utils/llmUtils'; // Ensure this path is correct

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    try {
      const { score } = await callLLM(prompt);
      res.status(200).json({ qualityScore: score });
    } catch (error) {
      console.error('Error calling LLM:', error);
      res.status(500).json({ error: 'Failed to evaluate quality of contribution' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 