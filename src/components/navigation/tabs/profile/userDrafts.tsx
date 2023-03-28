import PCCard from '@components/pc/PCCard';
import { Flex, Loader } from '@mantine/core';
import { useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Proposal } from 'src/utils/types';
import { EmptyState } from './tabEmptyState';

const text = {
  en: {
    emptyStateTitle: 'No drafts yet.',
    emptyStateText: 'Your Proposal drafts will be saved here for editing',
  },
  ko: {
    emptyStateTitle: '아직 초안이 없습니다.',
    emptyStateText: '나중에 여기에서 볼 수 있도록 제안을 저장하새요.',
  },
};

export const UserDrafts = () => {
  const { userInfo } = useAuth();
  const [userDrafts, setUserDrafts] = useState<Proposal[]>();
  const { lang } = useLanguage();

  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const { message: drafts }: { message: { proposalList: Proposal[] } } =
        await api.proposal.get(`/userDrafts/${userInfo.email}`);

      setUserDrafts(drafts.proposalList.reverse());
    };
    getData();
  }, [userInfo]);

  if (!userDrafts)
    return (
      <Flex justify="center">
        <Loader color="violet" />
      </Flex>
    );
  return userDrafts.length > 0 ? (
    <div className="PCCardContainer">
      {userDrafts.map((draft) => (
        <PCCard {...draft} type="Proposal" variant="Draft" key={draft._id} />
      ))}
    </div>
  ) : (
    <EmptyState
      title={text[lang].emptyStateTitle}
      text={text[lang].emptyStateText}
    />
  );
};
