import { useState } from 'react';
import { useRouter } from 'next/router';
import { Loader } from '@mantine/core';
import AuthLayout from '../src/components/auth/authLayout';
import AuthForm from '../src/components/auth/authForm';
import { useAuth } from '../src/utils/auth/authContext';
import { handleUserType } from 'src/utils/auth/handleUserAccess';
import { AuthProcessI } from 'src/utils/auth/dataTypes';

const Home = () => {
  const { userInfo, authLoading } = useAuth();
  const router = useRouter(); 

  if (authLoading || userInfo) {
    userInfo && router.push(handleUserType(userInfo).dashboardLink ?? '/');
    return (
      <div className="authLoader">
        <Loader color="violet" size="lg" />
      </div>
    );
  }

  return (
    <AuthLayout>
      <AuthForm/>
    </AuthLayout>
  );
};

export default Home;
