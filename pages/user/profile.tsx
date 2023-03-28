import { Flex, Loader, Stack } from '@mantine/core';
import { useRouter } from 'next/router';
import { TbStar } from 'react-icons/tb';
import styles from 'styles/user/profile.module.scss';
import { Heading1, Heading4, Subheading1 } from '@components/typography';
import { getProfilePicture } from 'src/utils/storage';
import { useAuth } from 'src/utils/auth/authContext';
import { useEffect, useState } from 'react';
import UserBadge from '@components/userBadge';
import {
  UserProposals,
  UserDrafts,
  UserComments,
  UserVotes,
  UserLikes,
  UserBookmarks,
} from '@components/navigation/tabs/profile';
import Tabs, { Tab } from '@components/navigation/tabs';
import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { getFormattedTimestamp } from 'src/utils/dates';
import WalletCard from '@components/walletCard';
import api from 'src/utils/api';

const text: Record<Language, string[]> = {
  en: ['Profile', 'Manage your assets and activity', 'joined: ', '$SD ID'],
  ko: ['마이페이지  ', '자산 및 활동 관리', '가입일: ', '스타더스트 지갑'],
};

const koreanLabel = [
  '내 제안',
  '임시 저장',
  '댓글',
  '투표',
  '좋아요',
  '북마크',
];

const Profile = () => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const { lang } = useLanguage();
  const [balance, setBalance] = useState<number>();
  const [userProfilePic, setProfilePic] = useState<string>();
  const bookmarksDispatch = useState<string[]>([]);

  const tabContent = {
    Proposals: <UserProposals {...{ bookmarksDispatch }} />,
    Drafts: <UserDrafts />,
    Comments: <UserComments />,
    Votes: <UserVotes />,
    Likes: <UserLikes {...{ bookmarksDispatch }} />,
    Bookmarks: <UserBookmarks {...{ bookmarksDispatch }} />,
  };

  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const balanceRes = await fetch(
        `/api/balance/sd/${userInfo.walletAddress}`
      );
      const { balance }: { balance: number } = await balanceRes.json();
      setBalance(balance);

      const profilePicture = await getProfilePicture(userInfo.profilePicture);
      setProfilePic(profilePicture);

      const {
        message: { bookmark },
      } = await api.user.get(`/bookmark/${userInfo.email}`);
      const bookmarkedPCs = [
        ...(bookmark?.proposalBookmarks ?? []),
        ...(bookmark?.campaignBookmarks ?? []),
      ];
      bookmarksDispatch[1](bookmarkedPCs);
    };
    getData();
  }, [userInfo]);

  if (!userInfo) return <></>;

  return (
    <div style={{ height: 'calc(100vh - 7rem)' }}>
      <div>
        <Heading1>{text[lang][0]}</Heading1>
        <Subheading1>{text[lang][1]}</Subheading1>
      </div>
      <Flex align="center" gap="md" className={styles.topContainer}>
        <Flex align="center" gap="md" className={styles.card}>
          {userProfilePic ? (
            <UserBadge profilePicture={userProfilePic} role={userInfo.role} />
          ) : (
            <Loader color="gray" size="sm" />
          )}
          <Stack spacing={0}>
            <Heading4>{userInfo.username}</Heading4>
            <Subheading1>
              {text[lang][2]}{' '}
              {getFormattedTimestamp(userInfo.createdAt, lang).date}
            </Subheading1>
          </Stack>
        </Flex>

        <WalletCard
          style={{ height: '100%' }}
          address={userInfo.walletAddress}
          icon={TbStar}
          onClick={() => router.push('stardust')}
          title={text[lang][3]}
        />
      </Flex>

      <Tabs>
        {Object.keys(tabContent).map((value, index) => (
          <Tab
            title={lang === 'en' ? value : koreanLabel[index]}
            key={value}
            value={value}
            component={tabContent[value as keyof typeof tabContent]}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default Profile;
