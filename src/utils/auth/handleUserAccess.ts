import { CognitoUser } from '@aws-amplify/auth';
import { User } from '../types';
type UserRole = 'fan' | 'staff';

interface RoleContext {
  role?: User['role'];
  dashboardLink?: string;
}

interface UserAttributes {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  phone_number: string;
  phone_number_verified: boolean;
}
interface CognitoUserExt extends CognitoUser {
  attributes: UserAttributes;
  signInUserSession: {
    accessToken: {
      jwtToken: string;
      payload: {
        'cognito:groups': UserRole[] | undefined;
      };
    };
  };
}

// determine user type and relevant dashboard link
const userDashboards: Record<User['role'], string> = {
  Fan: '/user/proposals',
  Staff: '/admin',
  Manager: '/admin',
};
const accessRoutes: Record<User['role'], string[]> = {
  Fan: ['user'],
  Staff: ['admin'],
  Manager: ['admin'],
};

const handleUserType = (userInfo: User | undefined): RoleContext => ({
  role: userInfo ? userInfo.role : undefined,
  dashboardLink: userInfo ? userDashboards[userInfo?.role] : undefined,
});

const getDashboardType = (role: User['role']) => userDashboards[role];

const handlePageAccess = (path: string, user: User) => {
  const [, ...routes] = path.split('/');
  const { role, dashboardLink } = handleUserType(user);

  const hasAccess =
    (role &&
      !(role === 'Staff' && routes[1] === 'financial') &&
      accessRoutes[role].includes(routes[0])) ||
    (routes[0] !== 'admin' && routes[0] !== 'user');
  return hasAccess ? undefined : dashboardLink;
};

export { handleUserType, getDashboardType, handlePageAccess };
