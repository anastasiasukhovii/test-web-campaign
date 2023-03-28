import { Storage } from 'aws-amplify';

// retrieve file from s3 bucket
const getUploadedFile = async (filename: string) => {
  try {
    // get the signed URL string
    const signedURL = await Storage.get(filename); // get key from Storage.list
    // console.log(signedURL);

    return signedURL;
  } catch (error) {
    return error as Error;
  }
};

export default getUploadedFile;
