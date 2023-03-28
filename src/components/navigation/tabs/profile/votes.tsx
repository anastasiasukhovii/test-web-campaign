import Table, { VoteRow } from '@components/table';
import { Flex, Loader } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';
import { PCType, Proposal, Vote } from 'src/utils/types';
import { EmptyState } from './tabEmptyState';

interface UserVote {
  title: string;
  timestamp: EpochTimeStamp;
  amount: number;
  type: PCType;
}

const text = {
  en: {
    type: 'Vote',
    headers: ['Date', 'Amount', 'Type', 'Name'],
    emptyStateTitle: 'No votes yet.',
    emptyStateText: 'Actively drive ideas by voting on proposals',
  },
  ko: {
    type: '투표',
    headers: ['날짜', '금액', '종류', '제목'],
    emptyStateTitle: '투표 내용이 없습니다.',
    emptyStateText: '투표를 통해 아이디어에 참여하세요.',
  },
};

export const UserVotes = () => {
  const { userInfo } = useAuth();
  const [votesData, setVotesData] = useState<UserVote[]>();
  const { lang } = useLanguage();
  useEffect(() => {
    const getData = async () => {
      if (!userInfo) return;
      const { message: data }: { message: { votes: Vote[] } } =
        await api.user.get(`/vote/getAllVotes/${userInfo.username}`);
      // get proposal information - title and title image for each vote
      const userVotes: UserVote[] = (
        await Promise.all(
          data.votes.map(async (vote) => {
            const {
              status,
              message: proposalData,
            }: { status: string; message: Proposal } = await api.proposal.get(
              `/${vote.typeId}`
            );
            if (status === 'Success') {
              return {
                title: proposalData.title,
                timestamp: vote.timestamp,
                amount: 0 - proposalData.costPerVote,
                type: vote.type,
              };
            }
          })
        )
      ).filter((vote): vote is UserVote => !!vote);
      setVotesData(userVotes.reverse());
    };
    getData();
  }, [userInfo]);

  if (!votesData)
    return (
      <Flex justify="center">
        <Loader color="violet" />
      </Flex>
    );
  return votesData.length > 0 ? (
    <Table<UserVote>
      headers={text[lang].headers}
      rowComponent={VoteRow}
      content={votesData}
      contentType="Vote"
      keyExtractor={(item) => item.title + '-' + item.timestamp}
      breakpoint={576}
      colSpans={[1, 1, 1, 1]}
    />
  ) : (
    <EmptyState
      title={text[lang].emptyStateTitle}
      text={text[lang].emptyStateText}
    />
  );
};
