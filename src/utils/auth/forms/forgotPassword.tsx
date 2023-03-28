import { useForm } from '@mantine/form';
import { Dispatch, SetStateAction, useState } from 'react';
import { useAuth } from '../authContext';
import { Input, PasswordInput, Stack, TextInput } from '@mantine/core';
import Button from '@components/buttons/button';
import PasswordStrength from './passwordStrength';
import { AuthProcessI, PasswordReset } from '../dataTypes';
import styles from '@components/auth/authForm/styles.module.scss';
import { btnText, forgotPasswordData, signUp2_formData } from './formData';
import { useLanguage } from 'src/utils/lang/languageContext';

interface IProps {
  setFormType: Dispatch<SetStateAction<AuthProcessI>>;
  setAuthError: Dispatch<SetStateAction<string | undefined>>;
}

export const ForgotPassword = ({ setAuthError, setFormType }: IProps) => {
  const { cognitoForgotPassword, cognitoSubmitNewPassword } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [userEmail, setUserEmail] = useState<string>();
  const { lang } = useLanguage();
  const formattedEmail =
    userEmail &&
    userEmail.split('@')[0].slice(0, 3) +
      '*'.repeat(userEmail.split('@')[0].length - 3) +
      '@' +
      userEmail.split('@')[1];

  const forgotPasswordHook = useForm<{ email: string }>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });
  const submitPasswordHook = useForm<PasswordReset>({
    initialValues: {
      code: '',
      password: '',
      confirm_password: '',
    },
    validate: {
      code: (value) => (value.length > 0 ? null : 'Required'),
      password: (value) =>
        value.length >= 8 &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          value
        )
          ? null
          : value.length < 8
          ? 'Must be at least 8 characters'
          : 'Must contain uppercase, lowercase, number and special case characters',
      confirm_password: (value, values) =>
        value.length >= 8 && value === values.password
          ? null
          : value.length >= 8
          ? 'Passwords did not match'
          : 'Required',
    },
  });

  const forgotPasswordForm = (
    <form
      onSubmit={forgotPasswordHook.onSubmit(async (values) => {
        const res = await cognitoForgotPassword(values.email);
        if (res instanceof Error) {
          setAuthError(res.message);
        } else {
          setAuthError(undefined);
          setUserEmail(values.email);
          setStep(2);
        }
      })}>
      <Stack>
        <TextInput
          label={forgotPasswordData[lang].email}
          {...forgotPasswordHook.getInputProps('email')}
          size="lg"
          radius={10}
        />
        <Button
          disabled={
            !(forgotPasswordHook.isTouched() && forgotPasswordHook.isValid())
          }
          size="lg"
          className={styles.authButton}
          type="primary"
          color="purple">
          {btnText[lang].next}
        </Button>
      </Stack>
    </form>
  );

  const submitPasswordForm = (
    <form
      onSubmit={submitPasswordHook.onSubmit(async (values) => {
        if (!userEmail) return;
        const res = await cognitoSubmitNewPassword({
          email: userEmail,
          code: values.code,
          password: values.password,
        });
        if (res instanceof Error) {
          setAuthError(res.message);
        } else {
          setAuthError(undefined);
          setUserEmail(undefined);
          setFormType('login');
        }
      })}>
      <Stack>
        <TextInput
          label={`${forgotPasswordData[lang].label} ${formattedEmail}`}
          placeholder={forgotPasswordData[lang].placeholder}
          {...submitPasswordHook.getInputProps('code')}
          size="lg"
          radius={10}
        />
        <div>
          <Input.Label mb={10}>
            {signUp2_formData.password.label[lang]}
          </Input.Label>
          <PasswordStrength
            value={submitPasswordHook.values.password}
            onChange={(value: string) =>
              submitPasswordHook.setFieldValue('password', value)
            }
          />
        </div>
        <PasswordInput
          label={signUp2_formData.confirm_password.label[lang]}
          {...submitPasswordHook.getInputProps('confirm_password')}
          size="lg"
          radius={10}
        />
        <Button
          disabled={
            !(submitPasswordHook.isTouched() && submitPasswordHook.isValid())
          }
          size="lg"
          className={styles.authButton}
          type="primary"
          color="purple">
          {btnText[lang].create}
        </Button>
      </Stack>
    </form>
  );
  const resetPassword: Record<1 | 2, JSX.Element> = {
    1: forgotPasswordForm,
    2: submitPasswordForm,
  };
  return <div>{resetPassword[step]}</div>;
};
