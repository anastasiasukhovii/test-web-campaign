import { NavLink as NavLinkMantine } from '@mantine/core';
import Link from 'next/link';

import { Subheading1 } from '@components/typography';
import styles from './styles.module.scss';
import { TbLogout, TbWorld } from 'react-icons/tb';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';
import { useRouter } from 'next/router';


export interface LinkWithIcon {
  link: string;
  icon: JSX.Element;
  selectedIcon?: JSX.Element; 
}

interface IProps extends LinkWithIcon {
  label: string;
  currentPath: string;
}

const NavLink = ({ label, link, icon, selectedIcon, currentPath }: IProps) => {
  return (
    <Link href={link}>
      <NavLinkMantine
        className={[
          styles.navButton,
          currentPath === link ? styles.selected : '',
        ].join(' ')}
        icon={currentPath === link ? selectedIcon :  icon}
        label={label}
      />
    </Link>
  );
};

export const LogoutButton = () => {
  const { cognitoLogout } = useAuth();
  const { lang } = useLanguage();
  return (
    <NavLinkMantine
      onClick={cognitoLogout}
      className={styles.navButton}
      icon={<TbLogout size="1.5rem" />}
      label={
        <Subheading1 color="#333333">
          {lang === 'en' ? 'Log-out' : '로그아웃'}
        </Subheading1>
      }
    />
  );
};
export const LanguageButton = () => {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  return (
    <NavLinkMantine
      onClick={() => {
        setLang(lang === 'en' ? 'ko' : 'en');
        router.push(router.asPath, router.asPath, {
          locale: lang === 'en' ? 'ko' : 'en',
        });
      }}
      className={styles.navButton}
      icon={<TbWorld size="1.5rem" />}
      label={
        <Subheading1 color="#333333">
          {lang === 'en' ? '한국어' : 'English'}
        </Subheading1>
      }
    />
  );
};

export default NavLink;
