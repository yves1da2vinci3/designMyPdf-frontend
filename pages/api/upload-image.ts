import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
  secure: true,
});

// Store uploaded image public IDs for later cleanup
const uploadedImageIds: string[] = [];

// Function to clean up old images (keep only the most recent 20)
async function cleanupOldImages() {
  try {
    if (uploadedImageIds.length > 20) {
      const idsToDelete = uploadedImageIds.slice(0, uploadedImageIds.length - 20);

      // Delete images from Cloudinary
      for (const publicId of idsToDelete) {
        await cloudinary.uploader.destroy(publicId);
      }

      // Update the array to only keep the most recent 20
      uploadedImageIds.splice(0, uploadedImageIds.length - 20);
    }
  } catch (error) {
    // Silent error handling for background cleanup process
  }
}

// Schedule cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldImages, 60 * 60 * 1000); // Every hour
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a temporary directory for uploads
    const uploadDir = `/tmp/uploads-${Date.now()}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 5,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    return await new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(500).json({ error: 'Error uploading files' });
          return resolve(undefined);
        }

        try {
          const uploadedFiles = files.files;
          const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

          // Upload files to Cloudinary
          const uploadPromises = fileArray.map(async (file) => {
            if (!file) return null;

            try {
              // Upload to Cloudinary with auto-expiration
              const result = await cloudinary.uploader.upload(file.filepath, {
                folder: 'designmypdf',
                resource_type: 'image',
                quality: 'auto:good', // Optimize quality
                fetch_format: 'auto', // Auto-select optimal format
                transformation: [
                  { width: 1200, crop: 'limit' }, // Limit max width
                  { quality: 'auto:good' }, // Optimize quality
                ],
              });

              // Store the public_id for later cleanup
              if (result.public_id) {
                uploadedImageIds.push(result.public_id);
              }

              // Delete the temporary file
              fs.unlinkSync(file.filepath);

              return {
                url: result.secure_url,
                public_id: result.public_id,
              };
            } catch (uploadError) {
              // Handle upload error silently and return null
              return null;
            }
          });

          const uploadResults = (await Promise.all(uploadPromises)).filter(Boolean);
          const uploadedUrls = uploadResults.map((result) => result?.url).filter(Boolean);

          // Clean up temporary directory
          try {
            fs.rmdirSync(uploadDir);
          } catch (cleanupError) {
            // Silent error handling for directory cleanup
          }

          // Run cleanup to ensure we don't exceed storage limits
          cleanupOldImages();

          res.status(200).json({
            urls: uploadedUrls,
            message:
              'Images uploaded successfully. They will be automatically deleted after usage to preserve storage.',
          });
          return resolve(undefined);
        } catch (error) {
          res.status(500).json({ error: 'Error processing uploads' });
          return resolve(undefined);
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
