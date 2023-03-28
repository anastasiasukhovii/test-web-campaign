import {
  Header as HeaderMantine,
  HeaderProps,
  UnstyledButton,
  Flex,
  Loader,
  Select,
  Menu,
  Text,
  Button as Btn,
  MantineProvider
} from '@mantine/core';
import {
  TbFileDescription,
  TbHelp,
  TbMenu2,
  TbPlus,
  TbSettings,
  TbWallet,
  TbWorld,
} from 'react-icons/tb';
import {
  BsCheck2
} from 'react-icons/bs';
import {
  MdOutlineKeyboardArrowDown
} from 'react-icons/md';
import Button from '@components/buttons/button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import UpdootSVG from 'public/updoot.svg';
import LogoSVG from 'public/logo.svg';
import { useAuth } from 'src/utils/auth/authContext';
import { getProfilePicture } from 'src/utils/storage';
import UserBadge from '@components/userBadge';
import { handleUserType } from 'src/utils/auth/handleUserAccess';
import { sidebarData } from '@components/navigation/sidebar';
import NavLink, {
  LanguageButton,
  LinkWithIcon,
  LogoutButton,
} from '../navLink';
import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { User } from 'src/utils/types';

const headerData: Record<
  User['role'],
  Record<Language, Record<string, LinkWithIcon>>
> = {
  Fan: {
    en: {
      Wallet: { icon: <TbWallet size="1.5rem" />, link: '/user/wallet' },
      Settings: {
        icon: <TbSettings size="1.5rem" />,
        link: '/settings',
      },
    },
    ko: {
      지갑: { icon: <TbWallet size="1.5rem" />, link: '/user/wallet' },
      설정: { icon: <TbSettings size="1.5rem" />, link: '/settings' },
    },
  },
  Staff: {
    en: { Settings: { icon: <TbSettings size="1.5rem" />, link: '/settings' } },
    ko: { 설정: { icon: <TbSettings size="1.5rem" />, link: '/settings' } },
  },
  Manager: {
    en: {
      Wallet: { icon: <TbWallet size="1.5rem" />, link: '/admin/financial' },
      Settings: { icon: <TbSettings size="1.5rem" />, link: '/settings' },
    },
    ko: {
      지갑: { icon: <TbWallet size="1.5rem" />, link: '/admin/financial' },
      설정: { icon: <TbSettings size="1.5rem" />, link: '/settings' },
    },
  },
};

const utilLinks: Record<Language, Record<string, LinkWithIcon>> = {
  en: {
    'Help & Support': { link: '/help', icon: <TbHelp size="1.5rem" /> },
    Legal: { link: '/legal', icon: <TbFileDescription size="1.5rem" /> },
  },
  ko: {
    문의하기: { link: '/help', icon: <TbHelp size="1.5rem" /> },
    이용약관: { link: '/legal', icon: <TbFileDescription size="1.5rem" /> },
  },
};

const menuData: Record<
  User['role'],
  Record<Language, Record<string, LinkWithIcon>>
> = {
  Fan: {
    en: { ...sidebarData.Fan.en, ...headerData.Fan.en, ...utilLinks.en },
    ko: { ...sidebarData.Fan.ko, ...headerData.Fan.ko, ...utilLinks.ko },
  },
  Staff: {
    en: { ...sidebarData.Staff.en, ...headerData.Staff.en, ...utilLinks.en },
    ko: { ...sidebarData.Staff.ko, ...headerData.Staff.ko, ...utilLinks.ko },
  },
  Manager: {
    en: {
      ...sidebarData.Manager.en,
      ...headerData.Manager.en,
      ...utilLinks.en,
    },
    ko: {
      ...sidebarData.Manager.ko,
      ...headerData.Manager.ko,
      ...utilLinks.ko,
    },
  },
};

const Header = (props: Partial<HeaderProps>) => {
  const router = useRouter();
  const { userInfo, cognitoLogout, cognitoLogin } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string>();
  const [menuOpened, setMenuOpened] = useState(false);
  const currentPath = useRouter().pathname;
  const { lang, setLang } = useLanguage();
  const { role } = handleUserType(userInfo);

  useEffect(() => {
    if (!userInfo) return;

    const getData = async () => {
      const currentProfilePhoto = await getProfilePicture(
        userInfo.profilePicture
      );
      setProfilePicture(currentProfilePhoto);
    };

    getData();
  }, [userInfo]);

  useEffect(() => setMenuOpened(false), [currentPath]);

  const toggleLanguage = (arg: Language) => {
    setLang(arg);
    router.push(router.asPath, router.asPath, {
      locale: lang === 'en' ? 'ko' : 'en',
    });
  };
  
  const languageToggleButton = (
    <Menu
      position="bottom"
      width={128}
      withinPortal
      styles={(theme) => ({
        item: {
          '&[data-hovered]': {
            backgroundColor: '#ece5ff',
          },
        },
      })}
    >
      <Menu.Target>
        <Btn
          styles={(theme) => ({
            root: {
              backgroundColor: '#ffffff',
              color: '#333333',

              '&: hover': {
                backgroundColor: '#ffffff',
              }
            }
          })
          }
          leftIcon={<TbWorld size="1.5rem" />}
          rightIcon={<MdOutlineKeyboardArrowDown size="1.5rem" />}
        >
          {lang == 'en' ? 'English' : 'Korean'}
        </Btn>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          icon={<BsCheck2 size="1rem" color={lang == 'en' ? '#333333' : '#ffffff'} />}
          onClick={() => toggleLanguage('en')}
        >
          English
        </Menu.Item>
        <Menu.Item
          icon={<BsCheck2 size="1rem" color={lang == 'ko' ? '#333333' : '#ffffff'} />}
          onClick={() => toggleLanguage('ko')}
        >
          Korean
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
  const headerLogo = (
    <Flex align="center" gap="sm">
      <LogoSVG className={styles.updoot} />
      <UpdootSVG className={styles.updoot} />
    </Flex>
  );

  return (
    <HeaderMantine
      height={70}
      className={[styles.container, menuOpened ? styles.opened : ''].join(' ')}
      {...props}>
      {userInfo && role ? (
        <>
          <div className={styles.header}>
            {headerLogo}
            <UnstyledButton
              className={styles.hamburger}
              onClick={() => setMenuOpened((prev) => !prev)}>
              <TbMenu2 size={32} />
            </UnstyledButton>
            <div className={styles.utilContainer}>
              {Object.values(headerData[role][lang]).map(({ link, icon }) => (
                <Link href={link} key={link}>
                  <UnstyledButton>{icon}</UnstyledButton>
                </Link>
              ))}
              {profilePicture ? (
                <UserBadge
                  profilePicture={profilePicture}
                  role={role === 'Fan' ? 'Fan' : 'Staff'}
                />
              ) : (
                <Loader color="grey" />
              )}
              <Button
                color="black"
                className={styles.createCampaignButton}
                onClick={() =>
                  router.push(
                    role === 'Fan'
                      ? '/user/proposals/create'
                      : '/admin/campaigns/create'
                  )
                }>
                {/* <TbPlus style={{ verticalAlign: 'middle' }} /> */}
                {lang === 'en' ? 'Create Campaign' : '캠페인 만들기'}
              </Button>
              {languageToggleButton}
              <UnstyledButton onClick={cognitoLogout}>
                {lang === 'en' ? 'Log-out' : '로그아웃'}
              </UnstyledButton>
            </div>
          </div>
          {Object.entries(menuData[role][lang]).map(
            ([label, { link, icon }]) => (
              <NavLink key={label} {...{ label, link, icon, currentPath }} />
            )
          )}
          <LanguageButton />
          <LogoutButton />
        </>
      ) : (
        // Header - unauthenticated user
        <div className={styles.header}>
          {headerLogo}
          <div style={{display: 'flex', alignItems: 'center'}}>
            {languageToggleButton}
            <UnstyledButton
              onClick={() =>
                  router.push('/auth/signin')
                }
              >         
              {lang === 'en' ? 'Log-In' : '로그인'}
            </UnstyledButton>
            <span> &nbsp; | &nbsp;</span>
            <UnstyledButton
              onClick={() =>
                router.push('/auth/signup')
              }
            >
              {lang === 'en' ? 'Sign up' : '회원가입'}
            </UnstyledButton>
          </div>

        </div>
      )}
    </HeaderMantine>
  );
};

export default Header;
