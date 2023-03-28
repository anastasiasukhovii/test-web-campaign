import {
  Flex,
  Input,
  Loader,
  Modal,
  PasswordInput,
  Stack,
  UnstyledButton,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import Button from '@components/buttons/button';
import {
  BodyText,
  Heading1,
  Heading2,
  Heading3,
  Subheading2,
  Subheading3,
} from '@components/typography';
import { useAuth } from 'src/utils/auth/authContext';
import styles from 'styles/user/settings.module.scss';
import { TbCircleCheck, TbTrashX } from 'react-icons/tb';
import { getProfilePicture, uploadFile } from 'src/utils/storage';
import PasswordStrength from 'src/utils/auth/forms/passwordStrength';
import { useChangePassword } from 'src/utils/auth/forms/hooks';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';
import api from 'src/utils/api';
import {
  MessageModal,
  MessageModalProps,
} from '@components/modal/messageModal';
import BackButton from '@components/buttons/backButton';
import { useMediaQuery } from '@mantine/hooks';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

const emptyPhoto = '/emptyPhoto.png';
const maxFileSize = 10000000;
const allowedFileTypes = ['image/png', 'image/jpeg'];

type ModalTypes = 'saving' | 'saved' | 'delete' | 'deleting';

const Settings = () => {
  const { user, userInfo, setUserInfo, cognitoChangePassword, cognitoLogout } =
    useAuth();
  const changePasswordHook = useChangePassword();
  const filePickerRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();

  const [currentProfilePhoto, setCurrentProfilePhoto] = useState<string>();
  const [currentPhoto, setCurrentPhoto] = useState<string>();
  const [newPhoto, setNewPhoto] = useState<File>();
  const [newPassword, setNewPassword] = useState<{
    old_password: string;
    new_password: string;
  }>();

  const [passwordModal, setPasswordModal] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [status, setStatus] = useState<ModalTypes>();
  const { lang } = useLanguage();

  // brand (if user is staff)
  const [staffInfo, setStaffInfo] = useState<string>();

  const buttonLabel: Record<Language, Record<string, string>> = {
    en: {
      removePhoto: 'Remove photo',
      uploadPhoto: 'Upload new photo',
      resetPwd: 'Reset Password',
      save: 'Save',
      viewProfile: 'View Profile',
      confirm: 'Confirm',
    },
    ko: {
      removePhoto: '사진 삭제',
      uploadPhoto: '사진 올리기',
      resetPwd: '비밀번호 재설정',
      save: '저장',
      viewProfile: '마이패이지 보기',
      confirm: '확인',
    },
  };

  const labels: Record<Language, Record<string, string>> = {
    en: {
      settings: 'Settings',
      profilePhoto: 'Profile Photo',
      username: 'Username',
      phone: 'Phone Number',
      email: 'Email',
      password: 'Password',
      company: 'Company',
      role: 'Role',
    },
    ko: {
      settings: '설정',
      profilePhoto: '프로필 사진',
      username: '이름',
      phone: '전화번호',
      email: '이메일',
      password: '비밀번호',
      company: '회사',
      role: '역할',
    },
  };

  const utilLabel: Record<Language, Record<string, string>> = {
    en: {
      imgReqs: 'JPG or PNG, max 10MB',
      deleteTitle: 'Delete account',
      confirmText:
        'Please note, after confirmation, this action cannot be undone',
    },
    ko: {
      imgReqs: 'JPG 또는 PNG, 최대 10MB 용량',
      deleteTitle: '계정 삭제',
      confirmText: "주의: '확인' 누른 후 취소가 불가능합니다.",
    },
  };

  const modalText: Record<Language, Record<ModalTypes, string>> = {
    en: {
      saving: 'Saving Account',
      saved: 'Account Saved',
      delete: 'Delete Account?',
      deleting: 'Deleting Account',
    },
    ko: {
      saving: '저장중',
      saved: '저장 성공',
      delete: '계정 삭제',
      deleting: '계정 삭제중',
    },
  };

  const resetPwdModalText: Record<Language, Record<string, string[]>> = {
    en: {
      currentPwd: ['Current password', 'Enter current password'],
      newPwd: ['Password', 'Enter new password'],
      confirmPwd: ['Confirm password', 'Repeat password here'],
    },
    ko: {
      currentPwd: ['현재 비밀번호', '현재 비밀번호를 입력하세요.'],
      newPwd: ['새로운 비밀번호', '새로운 비밀번호를 입력하세요.'],
      confirmPwd: ['비밀번호 확인', '비밀번호를 한번 더 입력하세요.'],
    },
  };
  useEffect(() => {
    if (!userInfo) return;

    const getUserData = async () => {
      if (userInfo.brand && userInfo.brand !== '') {
        setStaffInfo(userInfo.brand);
      }
      // get file from s3 bucket
      const currentProfilePhoto = await getProfilePicture(
        userInfo.profilePicture
      );
      setCurrentProfilePhoto(currentProfilePhoto);
      setCurrentPhoto(currentProfilePhoto);
    };
    getUserData();
  }, [userInfo]);
  if (!user || !userInfo) return null;

  const handleRemovePhoto = () => {
    // Show empty photo
    setCurrentPhoto(emptyPhoto);
    setNewPhoto(undefined);
  };
  const handleNewPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check file type and size
    const file = e.currentTarget.files![0];
    if (!file) return;

    if (file.size > maxFileSize || !allowedFileTypes.includes(file.type)) {
      console.log('File type/size not allowed.'); //TODO: Show file criteria error
      return;
    }
    setNewPhoto(e.currentTarget.files![0]);
    setCurrentPhoto(URL.createObjectURL(e.currentTarget.files![0]));
  };
  const handleSaveChanges = async () => {
    setStatus('saving');
    setMsgModal(true);
    // Photo changed
    if (currentPhoto !== currentProfilePhoto) {
      if (currentPhoto === emptyPhoto) {
        // Remove picture in db
        await api.user.post('/updateProfilePic', {
          username: user.attributes.name,
          profilePicture: '',
        });
        setUserInfo({ ...userInfo, profilePicture: '' });
        // console.log('Removed profile picture');
      } else {
        if (!newPhoto) return;
        const newKey = await uploadFile(
          `${user.attributes.email}/profile/${newPhoto.name}`,
          newPhoto
        );

        if (newKey instanceof Error) {
          console.log(newKey.message); //TODO: Show file upload error
        } else {
          // Update picture in db
          await api.user.post('/updateProfilePic', {
            username: user.attributes.name,
            profilePicture: newKey.key,
          });
          setUserInfo({ ...userInfo, profilePicture: newKey.key });
          // console.log('Updated new picture: ', newKey.key);
        }
      }
    }

    // Password changed
    if (newPassword) {
      const result = await cognitoChangePassword(newPassword);
      if (result instanceof Error) {
        console.log('Error: Could not reset password. ', result.message);
      } else {
        console.log('Password reset successfully');
      }
    }
    setNewPassword(undefined);
    setNewPhoto(undefined);
    setStatus('saved');
  };
  const handleDeleteAccount = async () => {
    setStatus('deleting');
    try {
      await Auth.deleteUser();
      await cognitoLogout();
    } catch (error) {
      console.log('Error deleting user: ', error);
    }
  };

  const profilePicture = (
    <Stack spacing={16} w="100%" className={styles.mobileRow}>
      <img
        src={currentPhoto}
        onError={(e) => {
          e.currentTarget.src = '/emptyPhoto.png';
        }}
        className={styles.image}
      />
      <input
        type="file"
        style={{ display: 'none' }}
        ref={filePickerRef}
        onChange={(event) => handleNewPhoto(event)}
      />
      <Stack w="100%">
        <Button
          type="secondary"
          color="black"
          size="md"
          style={{ maxWidth: 400, width: '100%' }}
          onClick={() => handleRemovePhoto()}
          disabled={currentPhoto === emptyPhoto}>
          {buttonLabel[lang].removePhoto}
        </Button>
        <Stack>
          <Button
            type="primary"
            color="black"
            size="md"
            style={{ maxWidth: 400, width: '100%' }}
            onClick={() => filePickerRef.current?.click()}>
            {buttonLabel[lang].uploadPhoto}
          </Button>
          <Subheading3 className={styles.infoText}>
            {utilLabel[lang].imgReqs}
          </Subheading3>
        </Stack>
      </Stack>
    </Stack>
  );
  const resetPassword = (
    <Stack spacing={16}>
      <Button
        type="primary"
        color="black"
        size="md"
        style={{ width: '100%' }}
        onClick={() => setPasswordModal(true)}>
        {buttonLabel[lang].resetPwd}
      </Button>
    </Stack>
  );
  const settingsInfo: Record<string, string | JSX.Element | undefined> = {
    [labels[lang].profilePhoto]: profilePicture,
    [labels[lang].username]: user.attributes.name,
    [labels[lang].company]: staffInfo ? staffInfo : undefined,
    [labels[lang].role]: staffInfo ? userInfo.role : undefined,
    [labels[lang].phone]: user.attributes.phone_number,
    [labels[lang].email]: user.attributes.email,
    [labels[lang].password]: resetPassword,
  };

  const modalData: Record<ModalTypes, Omit<MessageModalProps, 'onClose'>> = {
    saving: {
      icon: <Loader color="#C399FF" />,
      heading: modalText[lang].saving,
    },
    saved: {
      icon: <TbCircleCheck color="#333333" size={36} />,
      heading: modalText[lang].saved,
      buttonText: buttonLabel[lang].viewProfile,
      onSubmit: () => {
        router.push('/user/profile');
      },
    },
    delete: {
      icon: <TbTrashX color="#333333" size={36} />,
      heading: modalText[lang].delete,
      subheading: labels[lang].confirm,
      buttonText: buttonLabel[lang].confirm,
      onSubmit: () => handleDeleteAccount(),
      sticky: false,
    },
    deleting: {
      icon: <Loader color="#C399FF" />,
      heading: modalText[lang].deleting,
    },
  };

  return (
    <Stack>
      {status && (
        <MessageModal
          sticky={modalData[status].sticky ?? true}
          opened={msgModal}
          {...modalData[status]}
          onClose={() => setMsgModal(false)}
        />
      )}
      <Modal
        fullScreen={isMobile}
        centered
        size="80%"
        padding={50}
        withCloseButton
        radius="xl"
        opened={passwordModal}
        onClose={() => setPasswordModal(false)}>
        <form
          onSubmit={changePasswordHook.onSubmit((values) => {
            setNewPassword({
              old_password: values.old_password,
              new_password: values.new_password,
            });
            setPasswordModal(false);
          })}>
          <Stack align="flex-start" spacing={36} style={{ margin: '0 auto' }}>
            <Heading3>{buttonLabel[lang].resetPwd}</Heading3>

            <PasswordInput
              label={resetPwdModalText[lang].currentPwd[0]}
              placeholder={resetPwdModalText[lang].currentPwd[1]}
              radius={10}
              size="lg"
              {...changePasswordHook.getInputProps('old_password')}
              w="100%"
            />
            <div style={{ width: '100%' }}>
              <Input.Label mb={10}>
                {resetPwdModalText[lang].newPwd[0]}
              </Input.Label>
              <PasswordStrength
                value={changePasswordHook.values.new_password}
                onChange={(value: string) =>
                  changePasswordHook.setFieldValue('new_password', value)
                }
              />
            </div>
            <PasswordInput
              label={resetPwdModalText[lang].confirmPwd[0]}
              radius={10}
              size="lg"
              placeholder={resetPwdModalText[lang].confirmPwd[1]}
              {...changePasswordHook.getInputProps('confirm_password')}
              w="100%"
            />

            <Button type="primary" color="black" style={{ width: '100%' }}>
              {buttonLabel[lang].resetPwd}
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Back Button */}
      <BackButton />

      <Flex className={styles.container}>
        {/* User Information */}
        <Stack spacing={48} style={{ flex: 2 }}>
          <Heading1>{labels[lang].settings}</Heading1>
          {Object.entries(settingsInfo).map(
            ([label, item]) =>
              item && (
                <Flex
                  align="center"
                  key={label}
                  className={
                    label === 'Profile Photo' || label === '프로필 사진'
                      ? styles.responsivePicContainer
                      : undefined
                  }>
                  <Heading2 className={styles.label}>{label}</Heading2>
                  {typeof item === 'string' ? (
                    <BodyText className={styles.infoText}>{item}</BodyText>
                  ) : (
                    <>{item}</>
                  )}
                </Flex>
              )
          )}
        </Stack>
        {/* Save / Delete Account */}

        <Stack spacing={48} pos="sticky" top="15%" style={{ flex: 1 }}>
          <Button
            type="primary"
            color="purple"
            size="lg"
            style={{ width: '100%' }}
            onClick={() => handleSaveChanges()}
            disabled={currentPhoto === currentProfilePhoto && !newPassword}>
            {buttonLabel[lang].save}
          </Button>
          <UnstyledButton
            className={styles.infoCard}
            onClick={() => {
              setStatus('delete');
              setMsgModal(true);
            }}>
            <Flex align="center" gap={8}>
              <TbTrashX size={20} />
              <Subheading2>{utilLabel[lang].deleteTitle}</Subheading2>
            </Flex>
            <Subheading2>{utilLabel[lang].confirmText}</Subheading2>
          </UnstyledButton>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default Settings;
