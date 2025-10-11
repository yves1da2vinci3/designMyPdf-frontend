import B2 from 'backblaze-b2';
import { v4 as uuidv4 } from 'uuid';

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID || '',
  applicationKey: process.env.BACKBLAZE_APP_KEY || '',
});

export const uploadFile = async (file: Buffer, fileName: string) => {
  try {
    await b2.authorize();
    const {
      data: { uploadUrl, authorizationToken },
    } = await b2.getUploadUrl({
      bucketId: process.env.BACKBLAZE_BUCKET_ID || '',
    });

    const { data } = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: `imagesInspiration/${uuidv4()}-${fileName}`,
      data: file,
    });

    return data;
  } catch (error) {
    console.error('Error uploading file to Backblaze:', error);
    throw error;
  }
};

export const deleteFile = async (fileName: string, fileId: string) => {
  try {
    await b2.authorize();
    const { data } = await b2.deleteFileVersion({
      fileName,
      fileId,
    });

    return data;
  } catch (error) {
    console.error('Error deleting file from Backblaze:', error);
    throw error;
  }
};
