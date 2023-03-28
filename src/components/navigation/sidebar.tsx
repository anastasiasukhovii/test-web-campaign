import { Container, Navbar, NavbarProps, Stack } from '@mantine/core';
import { useRouter } from 'next/router';
import {
  TbChartPie,
  TbCircleCheck,
  TbStar,
  TbUserCircle,
  TbWallet,
} from 'react-icons/tb';

import { HiCheckCircle } from 'react-icons/hi';
 

import { MdCampaign } from 'react-icons/md'; 
import { AiFillCompass, AiOutlineCompass } from 'react-icons/ai'; 
import { HiUserCircle } from 'react-icons/hi'; 

import { handleUserType } from 'src/utils/auth/handleUserAccess';
import { useAuth } from '../../utils/auth/authContext';
import NavLink, { LinkWithIcon } from './navLink';
import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { User } from 'src/utils/types';


const basicStaffData = {
  en: {
    Overview: { link: '/admin', icon: <TbChartPie size={24} />, selectedIcon: <TbChartPie fill="#6A00FF" size={24}/>},
    Campaigns: { link: '/admin/campaigns', icon: <MdCampaign size={24} />, selectedIcon: <MdCampaign fill="#6A00FF" size={24}/> },
    Approvals: { link: '/admin/approval', icon: <TbCircleCheck size={24} />, selectedIcon: <HiCheckCircle fill="#6A00FF" size={24}/>},
  },
  ko: {
    전체: { link: '/admin', icon: <TbChartPie size={24} />, selectedIcon: <TbChartPie fill="#6A00FF" size={24}/> },
    캠페인: { link: '/admin/campaigns', icon: <MdCampaign size={24} />, selectedIcon: <MdCampaign fill="#6A00FF" size={24}/> },
    승인요청: { link: '/admin/approval', icon: <TbCircleCheck size={24} />, selectedIcon: <HiCheckCircle fill="#6A00FF" size={24}/>},
  },
};

export const sidebarData: Record<
  User['role'],
  Record<Language, Record<string, LinkWithIcon>>
> = {
  Fan: {
    en: {
      Discover: { link: '/user/proposals', icon: <AiOutlineCompass size={24} />, selectedIcon: <AiFillCompass fill="#6A00FF" size={24}/> },
      Profile: { link: '/user/profile', icon: <TbUserCircle size={24}/>, selectedIcon: <HiUserCircle fill="#6A00FF" size={24} /> },
      Stardust: { link: '/user/stardust', icon: <TbStar size={24}/>, selectedIcon: <TbStar fill="#6A00FF" size={24}/> },
    },
    ko: {
      디스커버: { link: '/user/proposals', icon: <AiOutlineCompass size={24} />, selectedIcon: <AiFillCompass fill="#6A00FF" size={24}/>},
      마이페이지: { link: '/user/profile', icon: <TbUserCircle size={24} />, selectedIcon: <HiUserCircle fill="#6A00FF" size={24}/> },
      스타더스트: { link: '/user/stardust', icon: <TbStar size={24} />, selectedIcon: <TbStar fill="#6A00FF" size={24}/>},
    },
  },
  Staff: basicStaffData,
  Manager: {
    en: {
      ...basicStaffData.en,
      Wallet: { link: '/admin/financial', icon: <TbWallet size={24} />, selectedIcon: <TbWallet fill="#6A00FF" size={24}/>  },
    },
    ko: {
      ...basicStaffData.ko,
      지갑: { link: '/admin/financial', icon: <TbWallet size={24} />, selectedIcon: <TbWallet fill="#6A00FF" size={24}/> },
    },
  },
};


const SideBar = (props: Partial<NavbarProps>) => {
  const { userInfo } = useAuth();
  if (!userInfo) return null;

  const { role } = handleUserType(userInfo);
  const router = useRouter();
  const currentPath = router.pathname;
  const { lang } = useLanguage();

  return (
    <Navbar
      hidden
      hiddenBreakpoint="sm"
      width={{ base: 200 }}
      py="md"
      {...props}>
      <Navbar.Section grow w="100%">
        <Stack justify="space-between" h={'100%'}>
          <Container px={0} mx={0}>
            {role &&
              Object.entries(sidebarData[role][lang]).map(
                ([label, { link, icon, selectedIcon}], index) => {
                  return (
                    <NavLink
                      key={label}
                      {...{ label, link, icon, selectedIcon, currentPath }}
                    />
                  );
                }
              )}
          </Container>

          <Container px={0} mx={0}>
            <NavLink
              link="/help"
              icon={<></>}
              currentPath={currentPath}
              label={lang === 'en' ? 'Help & Support' : '문의하기'}
            />
            <NavLink
              link="/legal"
              icon={<></>}
              currentPath={currentPath}
              label={lang === 'en' ? 'Legal' : '이용약관'}
            />
          </Container>
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
};

export default SideBar;
