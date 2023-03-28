import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  CognitoUserExt,
  LoginCredentials,
  ResetPassword,
  SignUpCredentials,
} from './dataTypes';
// amplify authentication
import { Amplify, Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';
import awsExports from '../../../src/aws-exports';
import api from '../api';
import { User } from '../types';
Amplify.configure({ ...awsExports, ssr: true });

interface AuthContextI {
  user: CognitoUserExt | null;
  userInfo: User | undefined;
  setUserInfo: React.Dispatch<React.SetStateAction<User | undefined>>;
  authLoading: boolean;
  cognitoLogin: ({
    email,
    password,
  }: LoginCredentials) => Promise<Error | undefined>;
  cognitoLogout: () => Promise<void>;
  cognitoRegister: ({
    email,
    password,
    username,
    phone_number,
  }: SignUpCredentials) => Promise<CognitoUser | Error>;
  cognitoConfirmRegistration: (username: string, code: string) => Promise<any>;
  cognitoResendCode: (email: string) => Promise<void>;
  cognitoForgotPassword: (email: string) => Promise<any>;
  cognitoSubmitNewPassword: ({
    email,
    code,
    password,
  }: ResetPassword) => Promise<string | Error>;
  cognitoChangePassword: ({
    old_password,
    new_password,
  }: {
    old_password: string;
    new_password: string;
  }) => Promise<Error | 'SUCCESS'>;
}

// auth context
export const AuthContext = createContext<AuthContextI | null>(null);

// auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useCognitoAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// hook to access auth context
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (authContext === null) {
    throw new Error('useAuth error');
  }
  return authContext;
};

const useCognitoAuth = () => {
  const [user, setUser] = useState<CognitoUserExt | null>(null);
  const [userInfo, setUserInfo] = useState<User>();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUser = user ?? (await Auth.currentAuthenticatedUser());
        setUser(currentUser);
        const { message: userData }: { message: User } = await api.user.get(
          `/getUserByUsername/${currentUser.attributes.name}`
        );
        setUserInfo(userData);
        setAuthLoading(false);
      } catch (error) {
        console.log(error);
        setAuthLoading(false);
      }
    };
    getCurrentUser();
  }, [user]);

  const cognitoLogin = async ({ email, password }: LoginCredentials) => {
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
    } catch (error) {
      return error as Error;
    }
  };

  const cognitoLogout = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      setUserInfo(undefined);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      console.log('Log out error: ', error);
    }
  };

  const cognitoRegister = async ({
    email,
    password,
    username,
    phone_number,
  }: SignUpCredentials) => {
    try {
      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name: username,
          phone_number,
        },
      });
      return user;
    } catch (error) {
      return error as Error;
    }
  };
  const cognitoConfirmRegistration = async (username: string, code: string) => {
    try {
      const res = await Auth.confirmSignUp(username, code);
      return res;
    } catch (error) {
      return error as Error;
    }
  };

  const cognitoResendCode = async (email: string) => {
    try {
      await Auth.resendSignUp(email);
      alert('Code resent successfully ');
    } catch (err) {
      console.log('Error resending code: ', err);
    }
  };

  const cognitoForgotPassword = async (email: string) => {
    try {
      const data = await Auth.forgotPassword(email);
      return data;
    } catch (error) {
      return error as Error;
    }
  };
  const cognitoSubmitNewPassword = async ({
    email,
    code,
    password,
  }: ResetPassword) => {
    try {
      const data = await Auth.forgotPasswordSubmit(email, code, password);
      return data;
    } catch (error) {
      return error as Error;
    }
  };

  const cognitoChangePassword = async ({
    old_password,
    new_password,
  }: {
    old_password: string;
    new_password: string;
  }) => {
    if (!user) throw new Error('User not authenticated.');
    try {
      const data = await Auth.changePassword(user, old_password, new_password);
      return data;
    } catch (error) {
      return error as Error;
    }
  };

  return {
    user,
    userInfo,
    setUserInfo,
    authLoading,
    cognitoLogin,
    cognitoLogout,
    cognitoRegister,
    cognitoConfirmRegistration,
    cognitoResendCode,
    cognitoForgotPassword,
    cognitoSubmitNewPassword,
    cognitoChangePassword,
  };
};
