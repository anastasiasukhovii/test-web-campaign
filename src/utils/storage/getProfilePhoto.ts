import getUploadedFile from './getUploadedFile';

const getProfilePicture = async (photoURL: string) => {
  const currentProfilePhoto =
    photoURL !== '' ? await getUploadedFile(photoURL) : undefined;
  if (!currentProfilePhoto || currentProfilePhoto instanceof Error) {
    return '/emptyPhoto.png';
  } else {
    return currentProfilePhoto;
  }
};

export default getProfilePicture;
