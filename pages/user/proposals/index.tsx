import { Flex, Loader, Select, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import PCCard from '@components/pc/PCCard';
import Button from '@components/buttons/button';
import { Heading2, Subheading1 } from '@components/typography';
import { Bookmark, Campaign, Proposal } from 'src/utils/types';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { NextPage } from 'next';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

const Proposals: NextPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [sorter, setSorter] = useState('');
  const [proposalCampaigns, setProposalCampaigns] =
    useState<(Proposal | Campaign)[]>();
  const [processedPCs, setProcessedPCs] = useState<(Proposal | Campaign)[]>();
  const bookmarksDispatch = useState<string[]>([]);
  const { lang } = useLanguage();

  const labels: Record<Language, string[]> = {
    en: ['Entertainment 3.0 Starts Here', 'Discover Proposals'],
    ko: ['앤터테인먼트 3.0의 시작', '팬 제안/캠페인을 탐색하세요'],
  };
  const sorters: Record<Language, string[]> = {
    en: ['Ending Soon', 'Trending', 'Newest'],
    ko: ['마감순', '인기순', '최신순'],
  };
  const filters: Record<Language, string[]> = {
    en: ['All', 'Artist Campaigns', 'Fan Proposals'],
    ko: ['전체', '캠페인', '팬 제안'],
  };
  if (!user) return null;

  useEffect(() => {
    const getPageData = async () => {
      const { message: bookmarkRes }: { message: { bookmark: Bookmark } } =
        await api.user.get(`/bookmark/${user.attributes.email}`);
      const campaignRes: { message: { campaignList: Campaign[] } } =
        await api.campaign.get('/all');
      const proposalRes: { message: { proposalList: Proposal[] } } =
        await api.proposal.get('/all');

      return {
        PCList: [
          ...proposalRes.message.proposalList.filter(
            (proposal) => proposal.status !== 'Approval'
          ),
          ...campaignRes.message.campaignList,
        ],
        bookmarks: bookmarkRes.bookmark && [
          ...bookmarkRes.bookmark.proposalBookmarks,
          ...bookmarkRes.bookmark.campaignBookmarks,
        ],
      };
    };
    getPageData().then(({ PCList, bookmarks }) => {
      if (PCList) setProposalCampaigns(PCList);
      if (bookmarks) bookmarksDispatch[1](bookmarks);
    });
  }, []);

  useEffect(() => {
    if (!proposalCampaigns) return;
    let processedPCs = [...proposalCampaigns];
    switch (sorter) {
      case sorters[lang][0]: //Ending Soon
        processedPCs.sort((a, b) => (a.endTime ?? 0) - (b.endTime ?? 0));
        break;
      case sorters[lang][1]: //Trending
        processedPCs.sort(
          (a, b) =>
            (b.votes ?? 0) / (Date.now() - (b.startTime ?? 0)) -
            (a.votes ?? 0) / (Date.now() - (a.startTime ?? 0))
        );
        break;
      case sorters[lang][2]: //Newest
      default:
        processedPCs.sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));
        break;
    }
    switch (filter) {
      case filters[lang][2]: //'Fan Proposals'
        processedPCs = processedPCs.filter((PC) => PC.type === 'Proposal');
        break;
      case filters[lang][1]: //Artist Campaigns
        processedPCs = processedPCs.filter((PC) => PC.type === 'Campaign');
        break;
    }
    setProcessedPCs(processedPCs);
  }, [filter, sorter, proposalCampaigns]);

  useEffect(() => {
    setSorter('');
  }, [lang]);

  if (!processedPCs) {
    return (
      <Flex justify="center" align="center" h={'100%'}>
        <Loader color="violet" />
      </Flex>
    );
  }

  return (
    <Stack>
      <Heading2>{labels[lang][0]}</Heading2>
      <Subheading1>{labels[lang][1]}</Subheading1>
      <Flex align="center" gap="lg" wrap="wrap" my="md">
        <Flex gap="md" align="center">
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
      </Flex>
      {processedPCs.length < 1 ? (
        <Flex justify="center" align="center" h={'50vh'}>
          <img src="/proposalEmpty.png" />
        </Flex>
      ) : (
        <div className="PCCardContainer">
          {processedPCs.map((pc) => (
            <PCCard {...{ bookmarksDispatch }} key={pc._id} {...pc} />
          ))}
        </div>
      )}
    </Stack>
  );
};

export default Proposals;
