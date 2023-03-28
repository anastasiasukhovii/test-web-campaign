import { Language } from 'src/utils/lang/languageContext';
import {
  AuthProcessI,
  FormField,
  LoginCredentials,
  SignUp1_Credentials,
  SignUp2_Credentials,
} from '../dataTypes';

const btnText: Record<
  Language,
  {
    signup: string;
    login: string;
    forgotPwd: string;
    next: string;
    create: string;
    createAcc: string;
  }
> = {
  en: {
    signup: 'Sign Up',
    login: 'Log In',
    forgotPwd: 'Forgot password?',
    next: 'Next',
    createAcc: 'Create Account',
    create: 'Create',
  },
  ko: {
    signup: '회원가입',
    login: '로그인',
    forgotPwd: '비밀번호 찾기',
    next: '다음',
    createAcc: '계정 만들기',
    create: '만들다',
  },
};

const formTitles: Record<Language, Record<AuthProcessI, string>> = {
  en: {
    signup: 'Create your Updoot Account',
    confirm: 'Create your Updoot Account',
    verified: 'Your account has been created',
    login: 'Login to your account',
    forgotPassword: 'Reset Password',
  },
  ko: {
    signup: '회원가입',
    confirm: '회원가입',
    verified: '계정이 생성되었습니다',
    login: '로그인',
    forgotPassword: '비밀번호 재설정',
  },
};

const loginData: Record<Language, Record<keyof LoginCredentials, string>> = {
  en: {
    email: 'Email address',
    password: 'Password',
  },
  ko: {
    email: '이메일 주소',
    password: '비밀번호',
  },
};

const signUp1_formData: Record<keyof SignUp1_Credentials, FormField> = {
  username: {
    type: 'text',
    label: { en: 'Username', ko: '이름' },
    placeholder: 'John',
  },
  phone_number: {
    type: 'text',
    label: { en: 'Phone number', ko: '전화번호' },
    placeholder: '+852',
  },
  email: {
    type: 'text',
    label: { en: 'Email address', ko: '이메일' },
    placeholder: 'johndoe@gmail.com',
  },
};
const signUp2_formData: Record<keyof SignUp2_Credentials, FormField> = {
  password: {
    type: 'password',
    label: { en: 'Password', ko: '비밀번호' },
    placeholder: 'Ajd18sjbny?',
  },
  confirm_password: {
    type: 'password',
    label: { en: 'Confirm Password', ko: '비밀번호 확인' },
    placeholder: 'Confirm Password',
  },
};
const signUp1_initialValues: SignUp1_Credentials = {
  username: '',
  phone_number: '',
  email: '',
};

const signUp2_initialValues: SignUp2_Credentials = {
  password: '',
  confirm_password: '',
};

const verificationData: Record<
  Language,
  { label: string; placeholder: string; resendTitle: string; resendBtn: string }
> = {
  en: {
    label: 'Enter the 6-digit code sent to',
    placeholder: '123456',
    resendTitle: 'Didn’t receive the code?',
    resendBtn: 'Send code',
  },
  ko: {
    label: '전송된 6자리 코드를 입력하세요. ',
    placeholder: '123456',
    resendTitle: '코드를 받지 못하셨나요?',
    resendBtn: '코드 보내기',
  },
};

const forgotPasswordData: Record<Language, any> = {
  en: {
    label: 'Verification code sent to',
    placeholder: '123456',
    email: 'Email address',
  },
  ko: {
    label: '인증 코드 전송됨',
    placeholder: '123456',
    email: '이메일 주소',
  },
};

const signupDisclaimer: Record<Language, string> = {
  en: 'By signing up, you agree to our Terms of Service and Privacy Policy.',
  ko: '회원가입 시 이용 약관 및 개인 정보 보호 정책에 동의합니다.',
};

export {
  formTitles,
  btnText,
  signupDisclaimer,
  signUp1_formData,
  signUp2_formData,
  signUp1_initialValues,
  signUp2_initialValues,
  loginData,
  verificationData,
  forgotPasswordData,
};
