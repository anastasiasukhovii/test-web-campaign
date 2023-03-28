import { useForm } from '@mantine/form';
import { useAuth } from '../authContext';
import { Input, Stack, TextInput } from '@mantine/core';
import Button from '@components/buttons/button';
import { Subheading2 } from '@components/typography';
import {
  AuthProcessI,
  ConfirmationCredentials,
  SignUpCredentials,
} from '../dataTypes';
import { Dispatch, SetStateAction } from 'react';
import styles from '@components/auth/authForm/styles.module.scss';
import api from 'src/utils/api';
import { btnText, verificationData } from './formData';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

interface IProps {
  setFormType: Dispatch<SetStateAction<AuthProcessI>>;
  setAuthError: Dispatch<SetStateAction<string | undefined>>;
  type: 'phone_number' | 'email';
  userCred: SignUpCredentials;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const Verification = ({
  setFormType,
  setAuthError,
  userCred,
  type,
  setLoading,
}: IProps) => {
  const { cognitoConfirmRegistration, cognitoResendCode } = useAuth();
  const { email, phone_number, username } = userCred;
  const { lang } = useLanguage();
  const formattedPhone =
    type === 'phone_number' &&
    phone_number &&
    phone_number !== '' &&
    '*'.repeat(phone_number.length - 3) + phone_number.slice(-3);
  const formattedEmail =
    type === 'email' &&
    email !== '' &&
    email.split('@')[0].slice(0, 3) +
      '*'.repeat(email.split('@')[0].length - 3) +
      '@' +
      email.split('@')[1];

  const confirmHook = useForm<ConfirmationCredentials>({
    initialValues: {
      code: '',
    },
    validate: {
      code: (value) => (value.length > 5 ? null : 'Required'),
    },
  });

  return (
    <form
      onSubmit={confirmHook.onSubmit(async (values) => {
        setLoading(true);
        const res = await cognitoConfirmRegistration(email, values.code);
        if (res instanceof Error) {
          setAuthError(res.message);
          setLoading(false);
        } else {
          setAuthError(undefined);
          // Register user in db
          const result = await api.auth.post('/register', {
            username,
            email,
            role: 'Fan',
          });
          if (result.status === 'Success') {
            // Account successfully created
            type === 'email' && setFormType('verified');
          } else {
            const regFailedMsg: Record<Language, string> = {
              en: 'Registration unsuccessful',
              ko: '등록 실패',
            };
            setAuthError(regFailedMsg[lang]);
            setFormType('signup');
          }
          setLoading(false);
        }
      })}>
      <Stack spacing={30}>
        <TextInput
          label={`${verificationData[lang].label} ${
            type === 'phone_number' ? formattedPhone : formattedEmail
          }`}
          placeholder={verificationData[lang].placeholder}
          {...confirmHook.getInputProps('code')}
          size="lg"
          radius={10}
        />

        <div>
          <Input.Label mb={10}>
            {verificationData[lang].resendTitle}
          </Input.Label>
          <Button
            size="lg"
            className={styles.authButton}
            type="secondary"
            color="black"
            onClick={async (e) => {
              e.preventDefault();
              email && (await cognitoResendCode(email));
            }}>
            {verificationData[lang].resendBtn}
          </Button>
        </div>

        <Button
          disabled={!(confirmHook.isTouched() && confirmHook.isValid())}
          size="lg"
          className={styles.authButton}
          type="primary"
          color="purple">
          {type === 'phone_number'
            ? btnText[lang].next
            : btnText[lang].createAcc}
        </Button>
      </Stack>
    </form>
  );
};
