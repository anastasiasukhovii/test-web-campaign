import { useState } from 'react';
import { Loader, Stack } from '@mantine/core';
import Button from '@components/buttons/button';
import { Heading1, Subheading3 } from '@components/typography';
import { AuthProcessI, SignUpCredentials } from 'src/utils/auth/dataTypes';
import SignUpForm from 'src/utils/auth/forms/signUp';
import { Verification } from 'src/utils/auth/forms/verification';
import { Login } from 'src/utils/auth/forms/login';
import { ForgotPassword } from 'src/utils/auth/forms/forgotPassword';
import styles from './styles.module.scss';
import { useLanguage } from 'src/utils/lang/languageContext';
import {
  btnText,
  formTitles,
  signupDisclaimer,
} from 'src/utils/auth/forms/formData';
import { useMediaQuery } from '@mantine/hooks';



const AuthForm = (props: any) => {
  const ftype = props?.ftype || null; 
  const [formType, setFormType] = useState<AuthProcessI>(ftype ?? 'login');
  const [authError, setAuthError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 550px)');

  const [userCred, setUserCred] = useState<SignUpCredentials>({
    username: '',
    phone_number: '',
    email: '',
    password: '',
  });
  const { lang } = useLanguage();

  // Toggle between LogIn and SignUp
  const toggleAuthButton = (
    <Button
      size="md"
      className={styles.authButton}
      type="secondary"
      color="black"
      onClick={() => {
        formType === 'signup' ? setFormType('login') : setFormType('signup');
        setAuthError(undefined);
      }}>
      {formType === 'signup' ? btnText[lang].login : btnText[lang].signup}
    </Button>
  );
  // Forgot password button
  const forgotPasswordButton = (
    <Subheading3
      className={styles.authLink}
      onClick={() => {
        setFormType('forgotPassword');
        setAuthError(undefined);
      }}>
      {btnText[lang].forgotPwd}
    </Subheading3>
  );

  const accountCreated = (
    <Button
      size="lg"
      className={styles.authButton}
      style={{ marginTop: '40px' }}
      type="primary"
      color="purple"
      onClick={() => setFormType('login')}>
      {btnText[lang].login}
    </Button>
  );
  // Forms for each auth process
  const authForms: Record<AuthProcessI, JSX.Element | (() => JSX.Element)> = {
    signup: (
      <>
        <SignUpForm
          setAuthError={setAuthError}
          setFormType={setFormType}
          userCred={userCred}
          setUserCred={setUserCred}
        />
        {toggleAuthButton}
      </>
    ),
    confirm: (
      <Verification
        type="email"
        userCred={userCred}
        setAuthError={setAuthError}
        setFormType={setFormType}
        setLoading={setLoading}
      />
    ),
    verified: accountCreated,
    login: (
      <>
        <Login setAuthError={setAuthError} />
        {toggleAuthButton}
        {forgotPasswordButton}
      </>
    ),
    forgotPassword: (
      <ForgotPassword setFormType={setFormType} setAuthError={setAuthError} />
    ),
  };

  if (loading) {
    return (
      <Stack justify="center" align="center">
        <Heading1
          color="#333333"
          style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {btnText[lang].createAcc}
        </Heading1>
        <Loader color="violet" />
      </Stack>
    );
  }
  return (
    <Stack spacing={!isMobile ? 30 : 8} px="md">
      {/* <pre>{JSON.stringify(userCred, null, 2)}</pre> */}
      <Heading1
        color="#333333"
        style={{
          textAlign: 'center',
          marginBottom: isMobile ? 10 : 'inherit',
        }}>
        {formTitles[lang][formType]}
      </Heading1>

      <>{authForms[formType]}</>
      {authError && <Subheading3 color="#FF0055">{authError}</Subheading3>}

      <Subheading3
        color="#808080"
        ta="center"
        style={{ width: '87%', margin: '0 auto' }}>
        {signupDisclaimer[lang]}
      </Subheading3>
    </Stack>
  );
};

export default AuthForm;
