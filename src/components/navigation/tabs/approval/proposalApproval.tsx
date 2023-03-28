import { Flex, Loader, Select, Stack} from '@mantine/core';
import { useEffect, useState } from 'react';
import Button from '@components/buttons/button';

import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Proposal } from 'src/utils/types';
import PCCard from '@components/pc/PCCard';
import { Subheading1 } from '@components/typography';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

const text = {
  en: { emptyState: 'No proposals here yet.' },
  ko: { emptyState: '아직 제안이 없습니다.' },
};

interface IProps {
  modalType: 'Proposal' | 'Sponsor';
}

const ProposalApproval = (props: IProps) => {
  const bookmarksDispatch = useState<string[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>();
  const [processedPs, setProcessedPs] = useState<(Proposal)[]>();
  const [filter, setFilter] = useState('All');
  const [sorter, setSorter] = useState('');
  const { userInfo } = useAuth();
  const { lang } = useLanguage();
  const label = {
    en: { emptyState: 'No proposals here yet.' },
    ko: { emptyState: '아직 제안이 없습니다.' },
  };

  //change Korean
  const sorters: Record<Language, string[]> = {
    en: ['Newest', 'Oldest'],
    ko: ['최신 순', '오래된 순'],
  };

  //change Korean
  const filters: Record<Language, string[]> = {
    en: ['All', 'Requested', 'Approved', 'Rejected'],
    ko: ['전체', '승인 대기', '승인됨', '거절됨'],
  };

  useEffect(() => {
    if (!userInfo) return;
    api.user
      .get(`/bookmark/${userInfo.email}`)
      .then(({ message }) =>
        bookmarksDispatch[1](message?.bookmark?.proposalBookmarks ?? [])
      );
    api.proposal
      .get(
        props.modalType === 'Proposal'
          ? `/company/${userInfo.companyId}`
          : `/sponsor/${userInfo.email}`
      )
      .then(({ message }) => {
        console.log({ message })
        setProposals(
          message[props.modalType === 'Proposal' ? 'proposalList' : 'proposals']
            //.filter((proposal: Proposal) => proposal.status === 'Pending')
            .reverse()
        )
      }
      );

  }, [userInfo]);


  useEffect(() => {
    if (!proposals) return;
    let processedPs = [...proposals];

    switch (sorter) {
      case sorters[lang][0]: //Newest
        processedPs.sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));
        break;
      case sorters[lang][1]: //Oldest
        processedPs.sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));
        break;
      default:
        processedPs.sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));
        break;
    }

    switch (filter) {

      case filters[lang][1]: //Requested
        processedPs = processedPs.filter((PC) => PC.status === 'Pending');
        break;
      case filters[lang][2]: //Approved
        processedPs = processedPs.filter((PC) => PC.status === 'Approval');
        break;
      case filters[lang][3]: //Rejected
        processedPs = processedPs.filter((PC) => PC.status === 'Rejected');
        break;
    }

    setProcessedPs(processedPs);
  }, [filter, sorter, proposals]);

  if (!proposals || !processedPs)
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <Loader color="violet" />
      </Flex>
    );
  if (proposals.length === 0 || processedPs.length === 0)
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <Subheading1>{text[lang].emptyState}</Subheading1>
      </Flex>
    );



  return (
    <Stack>
      <Flex gap="md" align="center" my="md">
        {filters[lang].map((value) => (
          <Button
            size="sm"
            color={filter === value ? 'purple' : 'black'}
            type="secondary"
            onClick={() => setFilter(value)}
            key={value}>
            {value}
          </Button>
        ))}
      </Flex>
      <Select
        miw="fit-content"
        onChange={(e) => setSorter(e!)}
        value={sorter}
        placeholder={lang === 'en' ? 'Sort By: ' : '정렬: ' + `${sorter}`}
        data={sorters[lang]}
        style={{ display: 'inline', width: '20%' }}
      />
      {processedPs.map((proposal) => (
        <PCCard
          {...{ bookmarksDispatch }}
          key={proposal._id}
          {...proposal}
          variant="Request"
          modalType={props.modalType}
          removePC={(typeId) =>
            setProposals((prev) =>
              prev?.filter((proposal) => proposal._id !== typeId)
            )
          }
        />
      ))}
    </Stack>
  );
};

export default ProposalApproval;
