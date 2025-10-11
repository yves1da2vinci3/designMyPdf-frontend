import { NextApiRequest, NextApiResponse } from 'next';
import { deleteFile } from '../../services/backblazeService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileId } = req.body;

    if (!fileName || !fileId) {
      return res.status(400).json({ error: 'Missing fileName or fileId parameter' });
    }

    const result = await deleteFile(fileName, fileId);

    if (result) {
      return res.status(200).json({ success: true, message: 'Image deleted successfully' });
    }

    return res.status(400).json({ success: false, message: 'Failed to delete image' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
