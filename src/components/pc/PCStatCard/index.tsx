import StatCard from '@components/statCard';
import { Heading1, Subheading3 } from '@components/typography';
import UserBadge from '@components/userBadge';
import { Flex, Grid, Modal, Stack, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React, { useState } from 'react';
import { BiLike, BiTimeFive } from 'react-icons/bi';
import { FiCheckCircle, FiUserCheck } from 'react-icons/fi';
import { TbChevronRight } from 'react-icons/tb';
import { WiStars } from 'react-icons/wi';
import { getDateDifferenceLong, getDaysLeft } from 'src/utils/dates';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Artist, Campaign, PCType, Proposal, User } from 'src/utils/types';
import styles from './styles.module.scss';

interface StatInfo {
  data: string | number;
  description: string;
  icon?: JSX.Element;
  sponsors?: React.ReactNode;
}

export const PCStatCard = ({
  pcInfo,
  iconsInfo,
  pcType,
}: {
  pcInfo: Proposal | Campaign;
  iconsInfo: Artist[] | User[];
  pcType: PCType;
}) => {
  const [modalOpened, setModalOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { lang } = useLanguage();
  function isArtist(icon: Artist | User): icon is Artist {
    return (icon as Artist).profilePic !== undefined;
  }
  const isProposal = pcType === 'Proposal';
  const seeArtistsOrSponsors = (
    <Flex align={'center'} gap="md" mt="sm">
      {iconsInfo.slice(0, 3).map((icon, key) => {
        return (
          <UserBadge
            profilePicture={
              isArtist(icon) ? icon.profilePic : icon.profilePicture
            }
            role={!isArtist(icon) ? 'Sponsor' : undefined}
            key={key}
          />
        );
      })}
      <UnstyledButton onClick={() => setModalOpened(true)}>
        <div className={styles.seeMoreButton}>
          {lang === 'en' ? 'See More' : '더보기'}
          <TbChevronRight size={20} />
        </div>
      </UnstyledButton>
    </Flex>
  );

  const statCardData: StatInfo[] = [
    {
      data: iconsInfo.length,
      description:
        lang === 'en'
          ? isProposal
            ? 'Proposal Sponsors'
            : 'Artists Involved'
          : isProposal
          ? '제안 스폰서'
          : '제안 대상',
      icon: <FiUserCheck size={36} color="#6a00ff" />,
      sponsors: seeArtistsOrSponsors,
    },
    {
      data: `${pcInfo?.votes ?? 0}`,
      description: lang === 'en' ? 'Users have voted' : '명 참여',
      icon: <FiCheckCircle size={30} color="#6a00ff" />,
    },
    {
      data: `D-${getDaysLeft(pcInfo?.endTime ?? 0)}`,
      description: `${getDateDifferenceLong(pcInfo?.endTime ?? 0, lang)} ${
        lang === 'en' ? 'left to vote' : '후 투표 마감'
      }`,

      icon: <BiTimeFive size={36} color="#6a00ff" />,
    },
    {
      data: pcInfo.collectedSD,
      description: lang === 'en' ? 'Collected Stardust' : '보유 스타더스트',
      icon: <WiStars size={36} color="#6a00ff" />,
    },
    {
      data: `${pcInfo?.approvalRate ?? 0}%`,
      description: lang === 'en' ? 'Approval Rate' : '지지율',
      icon: <BiLike size={36} color="#6a00ff" />,
    },
  ];

  return (
    <>
      <Modal
        fullScreen={isMobile}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        overflow="inside"
        size="70%"
        radius="md"
        classNames={{ modal: styles.sponsorModalContainer }}>
        <Stack align="center" spacing="xs" p={10}>
          <FiUserCheck size={30} color="#6a00ff" />
          <Heading1>{iconsInfo.length}</Heading1>
          <Subheading3>{statCardData[0]['description']}</Subheading3>
          <Flex
            gap="xl"
            mt={20}
            wrap={'wrap'}
            justify="center"
            className={styles.sponsorContainer}>
            {iconsInfo.map((icon, key) => (
              <Flex className={styles.sponsorLabel} key={key}>
                <UserBadge
                  profilePicture={
                    isArtist(icon) ? icon.profilePic : icon.profilePicture
                  }
                  role={!isArtist(icon) ? 'Sponsor' : undefined}
                />
                <Subheading3>
                  {isArtist(icon) ? icon.name : icon.username} ({icon.brand})
                </Subheading3>
              </Flex>
            ))}
          </Flex>
        </Stack>
      </Modal>

      <Grid grow gutter="sm" className={styles.statcardContainer}>
        {statCardData.map((card, index) => {
          if (index === statCardData.length - 1 && !isProposal)
            return undefined;
          if (index === 0 && iconsInfo.length < 1) return null; //for campaign statistics page
          return (
            <Grid.Col span={index < 1 ? 12 : 6} key={index}>
              <StatCard {...card} />
            </Grid.Col>
          );
        })}
      </Grid>
    </>
  );
};
