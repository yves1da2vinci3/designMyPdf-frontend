import type { NextApiRequest, NextApiResponse } from 'next';
import { getAiCredits } from '@/services/ai/getAiCredits';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const balance = await getAiCredits(authHeader);
  if (!balance) {
    res.status(500).json({ error: 'Failed to fetch credit balance' });
    return;
  }

  res.status(200).json(balance);
}
