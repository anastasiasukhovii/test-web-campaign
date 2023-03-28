import Button from '@components/buttons/button';
import PCCard from '@components/pc/PCCard';
import { BodyText } from '@components/typography';
import { Flex, Loader, Stack } from '@mantine/core';
import router from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Proposal } from 'src/utils/types';

interface IProps {
  bookmarksDispatch: [string[], Dispatch<SetStateAction<string[]>>];
}

export const UserProposals = (props: IProps) => {
  const { userInfo } = useAuth();
  const [userProposals, setUserProposals] = useState<Proposal[]>();
  const { lang } = useLanguage();
  const label = {
    en: [
      'Start building your very own proposal now! It will only take a few clicks.',
      'Upload your first proposal',
    ],
    ko: ['지금 나만의 제안서를 작성하세요!', '제안서 만들기'],
  };
  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const proposalRes: { message: { proposalList: Proposal[] } } =
        await api.proposal.get(`/userSubmits/${userInfo.email}`);
      setUserProposals(proposalRes.message.proposalList.reverse());
    };
    getData();
  }, [userInfo]);

  if (!userProposals)
    return (
      <Flex justify="center">
        <Loader color="violet" />
      </Flex>
    );
  return userProposals.length > 0 ? (
    <div className="PCCardContainer">
      {userProposals.map((proposal) => (
        <PCCard {...props} {...proposal} key={proposal._id} />
      ))}
    </div>
  ) : (
    <Stack align="center" justify="center" h="40vh" w="30%" m="auto">
      <img src="/proposalEmpty.png" />
      <BodyText color="#5C5C5C" ta="center">
        {label[lang][0]}
      </BodyText>
      <Button size="lg" onClick={() => router.push('proposals/create')}>
        {label[lang][1]}
      </Button>
    </Stack>
  );
};
