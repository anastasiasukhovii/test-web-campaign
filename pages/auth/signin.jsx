import { useRouter } from 'next/router';
import { Loader } from '@mantine/core';
import AuthLayout from '../../src/components/auth/authLayout';
import AuthForm from '../../src/components/auth/authForm';
import { useAuth } from '../../src/utils/auth/authContext';
import { handleUserType } from 'src/utils/auth/handleUserAccess';


const SignIn = () => {
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
      <AuthForm ftype="login"/>
    </AuthLayout>
  );
}


export default SignIn; 