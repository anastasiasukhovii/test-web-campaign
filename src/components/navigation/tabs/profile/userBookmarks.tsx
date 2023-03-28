import PCCard from '@components/pc/PCCard';
import { Flex, Loader } from '@mantine/core';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Campaign, Proposal } from 'src/utils/types';
import { EmptyState } from './tabEmptyState';

const text = {
  en: {
    emptyStateTitle: 'No bookmarks yet.',
    emptyStateText: 'Save great ideas you want to remember by bookmarking them',
  },
  ko: {
    emptyStateTitle: '아직 북마크가 없습니다.',
    emptyStateText: '기억하고 싶은 멋진 아이디어를 북마크하여 저장하세요',
  },
};

interface IProps {
  bookmarksDispatch: [string[], Dispatch<SetStateAction<string[]>>];
}

export const UserBookmarks = (props: IProps) => {
  const { userInfo } = useAuth();
  const [bookmarks] = props.bookmarksDispatch;
  const [bookmarkedItems, setBookmarkedItems] =
    useState<(Proposal | Campaign)[]>();
  const { lang } = useLanguage();
  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const {
        message: { bookmark },
      }: {
        message: {
          bookmark: {
            proposalBookmarks: string[];
            campaignBookmarks: string[];
          } | null;
        };
      } = await api.user.get(`/bookmark/${userInfo.email}`);

      const pBookmarks: Proposal[] =
        (bookmark &&
          (await Promise.all(
            bookmark.proposalBookmarks.map(async (proposalId) => {
              const { message: proposal }: { message: Proposal } =
                await api.proposal.get(`/${proposalId}`);
              return { ...proposal, type: 'Proposal' };
            })
          ))) ??
        [];

      const cBookmarks: Campaign[] =
        (bookmark &&
          (await Promise.all(
            bookmark.campaignBookmarks.map(async (campaignId) => {
              const { message: campaign }: { message: Campaign } =
                await api.campaign.get(`/${campaignId}`);
              return { ...campaign, type: 'Campaign' };
            })
          ))) ??
        [];
      setBookmarkedItems([...pBookmarks, ...cBookmarks]);
    };
    getData();
  }, [userInfo, bookmarks]);

  if (!bookmarkedItems) {
    return (
      <Flex justify="center">
        <Loader color="violet" />
      </Flex>
    );
  }
  return bookmarkedItems.length > 0 ? (
    <div className="PCCardContainer">
      {bookmarkedItems.map((pc) => (
        <PCCard {...props} key={pc._id} {...pc} />
      ))}
    </div>
  ) : (
    <EmptyState
      title={text[lang].emptyStateTitle}
      text={text[lang].emptyStateText}
    />
  );
};
