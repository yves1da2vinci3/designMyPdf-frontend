import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
  secure: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Missing publicId parameter' });
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return res.status(200).json({ success: true, message: 'Image deleted successfully' });
    }

    return res.status(400).json({ success: false, message: 'Failed to delete image', result });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
