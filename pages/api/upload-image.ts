import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { uploadFile } from '../../services/backblazeService';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
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

          const uploadPromises = fileArray.map(async (file) => {
            if (!file) return null;

            try {
              const fileBuffer = fs.readFileSync(file.filepath);
              const result = await uploadFile(fileBuffer, file.originalFilename || 'unknown-file');

              // Delete the temporary file
              fs.unlinkSync(file.filepath);

              return {
                url: `${process.env.BACKBLAZE_BUCKET_URL}/file/${process.env.BACKBLAZE_BUCKET_NAME}/${result.fileName}`,
                public_id: result.fileId,
                fileName: result.fileName,
              };
            } catch (uploadError) {
              // Handle upload error silently and return null
              return null;
            }
          });

          const uploadResults = (await Promise.all(uploadPromises)).filter(Boolean);
          const uploadedUrls = uploadResults.map((result) => result?.url).filter(Boolean);

          res.status(200).json({
            urls: uploadedUrls,
            files: uploadResults,
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
