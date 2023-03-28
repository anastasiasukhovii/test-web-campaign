import PCCard from '@components/pc/PCCard';
import { Flex, Loader } from '@mantine/core';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Campaign, Like, Proposal } from 'src/utils/types';
import { EmptyState } from './tabEmptyState';

const text = {
  en: {
    emptyStateTitle: 'No likes yet.',
    emptyStateText:
      'Support ideas and engage with the community by liking Proposals.',
  },
  ko: {
    emptyStateTitle: '내용이 없습니다.',
    emptyStateText: '좋아요 눌러서 아이디어를 지원하세요.',
  },
};

interface IProps {
  bookmarksDispatch: [string[], Dispatch<SetStateAction<string[]>>];
}
type PCwithType =
  | (Proposal & { type: 'Proposal' | 'Campaign' })
  | (Campaign & { type: 'Proposal' | 'Campaign' });

export const UserLikes = (props: IProps) => {
  const { userInfo } = useAuth();
  const [userLikes, setUserLikes] = useState<PCwithType[]>();
  const { lang } = useLanguage();
  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const { message: likesRes }: { message: { likes: Like[] } } =
        await api.user.get(`/like/getAllLikes/${userInfo.username}`);

      const pcLikes: PCwithType[] = await Promise.all(
        likesRes.likes.map(async (userLike) => {
          if (userLike.type == 'Proposal') {
            const { message: proposal }: { message: Proposal } =
              await api.proposal.get(`/${userLike.typeId}`);
            return { ...proposal, type: userLike.type };
          } else {
            const { message: campaign }: { message: Campaign } =
              await api.campaign.get(`/${userLike.typeId}`);
            return { ...campaign, type: userLike.type };
          }
        })
      );

      setUserLikes(pcLikes);
    };
    getData();
  }, [userInfo]);

  if (!userLikes)
    return (
      <Flex justify="center">
        <Loader color="violet" />
      </Flex>
    );
  return userLikes.length > 0 ? (
    <div className="PCCardContainer">
      {userLikes.map((pc) => (
        <PCCard key={pc._id} {...pc} {...props} />
      ))}
    </div>
  ) : (
    <EmptyState
      title={text[lang].emptyStateTitle}
      text={text[lang].emptyStateText}
    />
  );
};
