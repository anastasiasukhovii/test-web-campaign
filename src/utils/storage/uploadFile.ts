import { Storage } from 'aws-amplify';

// upload file to s3 bucket
const uploadFile = async (filepath: string, file: File) => {
  try {
    const result = await Storage.put(filepath, file, {
      contentType: file.type,
    });
    return result;
  } catch (error) {
    return error as Error;
  }
};

export default uploadFile;
