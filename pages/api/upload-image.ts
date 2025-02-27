import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    return new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          res.status(500).json({ error: 'Error uploading files' });
          return resolve(undefined);
        }

        try {
          const uploadedFiles = files.files;
          const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
          
          const uploadedUrls = fileArray.map((file) => {
            if (!file) return null;
            
            // Generate a unique filename
            const uniqueFilename = `${uuidv4()}${path.extname(file.originalFilename || '')}`;
            const finalPath = path.join(uploadDir, uniqueFilename);
            
            // Move the file to the final location with the unique name
            fs.renameSync(file.filepath, finalPath);
            
            // Return the public URL
            return `/uploads/${uniqueFilename}`;
          }).filter(Boolean);

          res.status(200).json({ urls: uploadedUrls });
          return resolve(undefined);
        } catch (error) {
          console.error('Error processing uploads:', error);
          res.status(500).json({ error: 'Error processing uploads' });
          return resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ error: 'Server error' });
  }
} 