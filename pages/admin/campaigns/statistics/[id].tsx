import Button from '@components/buttons/button';
import { Heading1 } from '@components/typography';
import Table, { VotingRow } from '@components/table';
import { Flex, Loader, Stack } from '@mantine/core';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import api from 'src/utils/api';
import { Campaign, Transaction, User } from 'src/utils/types';
import styles from '/styles/admin/statistics.module.scss';
import LineChart, { GraphData } from '@components/chart/LineChart';
import BackButton from '@components/buttons/backButton';
import ProgressCard from '@components/progressDisplay';
import WalletCard from '@components/walletCard';
import { useLanguage } from 'src/utils/lang/languageContext';
import { PCStatCard } from '@components/pc/PCStatCard';

const text = {
  en: {
    pageTitle: 'Campaign Statistics',
    viewCampaign: 'View Campaign',
    tableTitle: 'Voting Summary',
    type: 'Vote',
    chartTitle: 'Activity Summary',
    chartLabel1: 'Votes per day',
    chartLabel2: 'Comments per day',
    headers: ['Date', 'User', 'Amount'],
  },
  ko: {
    pageTitle: '캠페인 통계',
    viewCampaign: '캠페인 보기',
    tableTitle: '투표 요약',
    type: '투표',
    chartTitle: '활동 요약',
    chartLabel1: '하루 투표 수',
    chartLabel2: '하루 댓글 수',
    headers: ['날짜', '사용자', '금액'],
  },
};

const Statistics = () => {
  const [currentCampaign, setCurrentCampaign] = useState<Campaign>();
  const [graphData, setGraphData] = useState<GraphData>();
  const [transactions, setTransactions] = useState<(Transaction & User)[]>([]);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!router.isReady) return;
    const getData = async () => {
      const campaignRes = await api.campaign.get(`/${router.query.id}`);

      // get campaign activity graph data
      const graphDataRes: { message: { graphData: GraphData } } =
        await api.campaign.get(`/activities/${router.query.id}`);
      setGraphData(graphDataRes.message.graphData);

      //Get transaction details of campaign
      const { message: txs }: { message: (Transaction & User)[] } =
        await api.campaign.get(`/transactions/${router.query.id}`);
      setTransactions(txs.sort((a, b) => a.timestamp - b.timestamp));
      setCurrentCampaign(campaignRes.message);
    };
    getData();
  }, [router.query.id]);

  return (
    <>
      {!currentCampaign ? (
        <Flex justify="center" align="center" h="100%">
          <Loader color="violet" />
        </Flex>
      ) : (
        <>
          <BackButton />
          <Heading1 style={{ marginTop: '2rem' }}>
            {text[lang].pageTitle}: {currentCampaign?.title}
          </Heading1>
          <Flex className={styles.container}>
            <Stack className={styles.infoColumn}>
              <Button
                type="primary"
                onClick={() => router.replace(`/campaigns/${router.query.id}`)}
                size="lg"
                style={{ width: '100%' }}>
                {text[lang].viewCampaign}
              </Button>
              <WalletCard
                address={currentCampaign.walletAddress}
                campaignId={currentCampaign._id}
                icon={() => <img src="/Business.png" height={20} />}
                title={currentCampaign.title}
              />
              <ProgressCard campaign={currentCampaign} />
              <PCStatCard
                pcInfo={currentCampaign}
                iconsInfo={[]}
                pcType={'Campaign'}
              />
            </Stack>
            <Stack className={styles.graphTableColumn}>
              <LineChart
                title={text[lang].chartTitle}
                labels={[
                  { name: text[lang].chartLabel1, color: '#6a00ff' },
                  { name: text[lang].chartLabel2, color: '#808080' },
                ]}
                {...graphData}
              />
              <Table<Transaction & User>
                title={text[lang].tableTitle}
                contentType={text[lang].type}
                headers={text[lang].headers}
                content={transactions}
                rowComponent={VotingRow}
                keyExtractor={(item) => item.txnId}
                breakpoint={576}
                colSpans={[1, 3, 1]}
              />
            </Stack>
          </Flex>
        </>
      )}
    </>
  );
};

export default Statistics;
