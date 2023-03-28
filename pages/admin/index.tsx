import Button from '@components/buttons/button';
import LineChart, { GraphData } from '@components/chart/LineChart';
import ProgressCard from '@components/progressDisplay';
import StatCard from '@components/statCard';
import { BodyText, Heading1, Heading2 } from '@components/typography';
import WalletCard from '@components/walletCard';
import { Flex, Select, Stack, UnstyledButton, Loader } from '@mantine/core';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  TbAlertCircle,
  TbChevronRight,
  TbCircleCheck,
  TbFile,
  TbMessage,
  TbUser,
} from 'react-icons/tb';
import { WiStars } from 'react-icons/wi';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { Campaign, Proposal } from 'src/utils/types';
import styles from '/styles/admin/index.module.scss';

interface ApprovalData {
  pendingProposals: number;
  pendingSponsors: number;
  pendingComments: number;
  pendingReports: number;
}

export interface CompanyData {
  totalVotes: number;
  SDCollected: number;
  WMCollected: number;
  totalSDSpent: number;
}

interface IStatCard {
  icon: JSX.Element;
  data?: string | number;
  description: Record<Language, string>;
}

interface IApprovalCard {
  icon: JSX.Element;
  data: number | undefined;
  description: Record<Language, string>;
  redirect: string;
}

const primaryColor = '#6a00ff';
const textColor = '#5C5C5C';
const mediumGray = '#808080';
const campaignOverviewData: Record<Language, Record<string, string>> = {
  en: {
    heading: 'Campaign Overviews',
    placeholder: 'Campaign: ',
    campaignID: 'Campaign ID',
    walletID: 'Wallet ID',
    chartTitle: 'Activity Summary',
    chartLabel1: 'Votes per day',
    chartLabel2: 'Comments per day',
  },
  ko: {
    heading: '캠페인 개요',
    placeholder: '캠페인: ',
    campaignID: '캠페인 ID',
    walletID: '지갑 ID',
    chartTitle: '활동 요약',
    chartLabel1: '하루 투표 수',
    chartLabel2: '하루 댓글 수',
  },
};
const emptyStateText: Record<Language, Record<string, string>> = {
  en: {
    companyOverview: 'Create Campaigns or add companies to view overview.',
    pendingApproval: 'Create Campaigns to engage the community.',
    noCampaignsYet: 'No Campaigns Yet.',
    createCampaign: 'Create your first campaign',
  },
  ko: {
    companyOverview: '개요를 보려면 캠페인을 만들거나 회사를 추가하세요.',
    pendingApproval: '커뮤니티 참여를 위한 캠페인을 만드새요.',
    noCampaignsYet: '아직 캠페인이 없습니다.',
    createCampaign: '첫 번째 캠페인 만들기',
  },
};

const CampaignOverview = () => {
  const { userInfo } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>();
  const [campaignlist, setCampaignlist] = useState<Campaign[]>();
  const [currentCampaign, setCurrentCampaign] = useState<Campaign>();
  const [graphData, setGraphData] = useState<GraphData>();
  const [pendingApprovalData, setPendingApprovalData] =
    useState<ApprovalData>();
  const [companyData, setCompanyData] =
    useState<Omit<CompanyData, 'totalSDSpent'>>();
  const { lang } = useLanguage();

  useEffect(() => {
    if (!userInfo || !userInfo.companyId) return;
    const getData = async () => {
      //All launched campaigns under current user's company
      const campaignRes = await api.campaign.get(
        `/company/live/${userInfo.companyId}`
      );
      if (campaignRes) {
        setCampaignlist(campaignRes.message.campaignList);
        campaignRes.message.campaignList.length > 0 &&
          setSelectedCampaignId(campaignRes.message.campaignList[0]._id);
      }

      //Pending approval data fetching
      const allProposals: Promise<{ message: { proposalList: Proposal[] } }> =
        api.proposal.get(`/company/${userInfo.companyId}`);
      const allSponsorships: Promise<{
        message: { proposals: Proposal[] };
      }> = api.proposal.get(`/sponsor/${userInfo.email}`);
      const allReportedComments = api.reportComment.get(
        `/company/pending/${userInfo.companyId}`
      );
      const allPendingComments = api.comment.get(
        `/getCompanyPendingComments/${userInfo.companyId}`
      );
      Promise.all([
        allProposals,
        allSponsorships,
        allReportedComments,
        allPendingComments,
      ]).then(
        ([proposals, sponsorships, allReportedComments, pendingComments]) =>
          setPendingApprovalData({
            pendingProposals: proposals.message.proposalList.filter(
              (proposal) => proposal.status === 'Pending'
            ).length,
            pendingSponsors: sponsorships.message.proposals.filter(
              (proposal) => proposal.status === 'Pending'
            ).length,
            pendingComments: pendingComments.message.comment.length,
            pendingReports: allReportedComments.message.reports.length,
          })
      );

      //Company statistics
      const companyVoteSD = await api.company.get(
        `/voteAmount/${userInfo.companyId}`
      );
      const {
        voteCount: totalVotes,
        SDCollected,
        WMBalance: WMCollected,
      } = companyVoteSD.message;
      setCompanyData({ totalVotes, SDCollected, WMCollected });
    };
    getData();
  }, [userInfo]);

  useEffect(() => {
    const getSelectedCampaign = async () => {
      const selectedCampaignRes = await api.campaign.get(
        `/${selectedCampaignId}`
      );
      setCurrentCampaign(selectedCampaignRes.message);

      const graphDataRes: { message: { graphData: GraphData } } =
        await api.campaign.get(
          `/activities/${selectedCampaignRes.message._id}`
        );

      setGraphData(graphDataRes.message.graphData);
    };

    if (selectedCampaignId) {
      getSelectedCampaign();
    }
  }, [selectedCampaignId]);

  if (!userInfo) return;

  const overviewData: {
    heading: Record<Language, string>;
    cards: IStatCard[];
  } = {
    heading: {
      en: 'Company Overview',
      ko: '회사 개요',
    },
    cards: [
      {
        icon: <TbCircleCheck size={36} color={primaryColor} />,
        data: companyData?.totalVotes,
        description: { en: 'Total Votes', ko: '투표 수' },
      },
      {
        icon: <WiStars size={36} color={primaryColor} />,
        data: companyData?.SDCollected,
        description: { en: '$SD Collected', ko: '$SD 보유' },
      },
      {
        icon: <TbMessage size={36} color={primaryColor} />,
        data: companyData?.WMCollected,
        description: { en: '$WM Collected', ko: '$WM 보유' },
      },
    ],
  };
  const approvalData: {
    heading: Record<Language, string>;
    cards: IApprovalCard[];
  } = {
    heading: {
      en: 'Pending Approvals',
      ko: '승인 대기',
    },
    cards: [
      {
        redirect: 'Proposals',
        icon: <TbFile size={36} color={primaryColor} />,
        data: pendingApprovalData?.pendingProposals,
        description: { en: 'Proposals', ko: '팬 제안' },
      },
      {
        redirect: 'Sponsor',
        icon: <TbUser size={36} color={primaryColor} />,
        data: pendingApprovalData?.pendingSponsors,
        description: { en: 'Sponsors', ko: '스폰서' },
      },
      {
        redirect: 'Comments',
        icon: <TbMessage size={36} color={primaryColor} />,
        data: pendingApprovalData?.pendingComments,
        description: { en: 'Comments', ko: '댓글' },
      },
      {
        redirect: 'Reports',
        icon: <TbAlertCircle size={36} color={primaryColor} />,
        data: pendingApprovalData?.pendingReports,
        description: { en: 'Reports', ko: '신고내역' },
      },
    ],
  };

  const noCampaignsEmptyState = (
    <>
      <Flex className={styles.informationBar} pb="10rem">
        <Stack>
          <Heading1>{overviewData.heading[lang]}</Heading1>
          <BodyText>{emptyStateText[lang].companyOverview}</BodyText>
        </Stack>
        <Stack>
          <Heading1>{approvalData.heading[lang]}</Heading1>
          <BodyText>{emptyStateText[lang].pendingApproval}</BodyText>
        </Stack>
      </Flex>

      <Heading1>{campaignOverviewData[lang].heading}</Heading1>
      <Stack align="center" spacing="md" py="5rem">
        <BodyText>{emptyStateText[lang].noCampaignsYet}</BodyText>
        <img src="/proposalEmpty.png" />
        <Button type="primary" size="lg">
          {emptyStateText[lang].createCampaign}
        </Button>
      </Stack>
    </>
  );

  const informationBar = (
    <Flex className={styles.informationBar} pb="xl">
      <Stack>
        <Heading1>{overviewData.heading[lang]}</Heading1>
        <Flex className={styles.statsRow}>
          {overviewData.cards.map((cardData, index) => (
            <StatCard
              key={index}
              icon={cardData.icon}
              data={cardData.data}
              description={cardData.description[lang]}
            />
          ))}
        </Flex>
      </Stack>
      <Stack>
        <Heading1>{approvalData.heading[lang]}</Heading1>
        <Flex className={styles.statsRow}>
          {approvalData.cards.map((cardData, index) => (
            <UnstyledButton
              key={index}
              className={styles.approvalCard}
              onClick={() => {
                router.replace({
                  pathname: '/admin/approval',
                  query: { tab: cardData.redirect },
                });
              }}>
              {cardData.icon}
              <Heading2 fw={600} ta="center">
                {cardData.data}
              </Heading2>
              <Flex align="center">
                <BodyText color={textColor}>
                  {cardData.description[lang]}
                </BodyText>
                <TbChevronRight size={20} color={textColor} />
              </Flex>
            </UnstyledButton>
          ))}
        </Flex>
      </Stack>
    </Flex>
  );

  return (
    <>
      {campaignlist ? (
        <>
          {campaignlist.length < 1
            ? noCampaignsEmptyState
            : currentCampaign && (
                <>
                  {informationBar}
                  <Heading1>{campaignOverviewData[lang].heading}</Heading1>
                  <Flex className={styles.campaignOverview}>
                    <Stack spacing="lg">
                      <Select
                        data={campaignlist.map((campaign) => ({
                          value: campaign._id,
                          label: campaign.title,
                        }))}
                        placeholder={campaignOverviewData[lang].placeholder}
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e!)}
                      />
                      <WalletCard
                        address={currentCampaign.walletAddress}
                        campaignId={currentCampaign._id}
                        icon={() => <img src="/Business.png" height={20} />}
                        onClick={() =>
                          router.push(
                            `/admin/campaigns/statistics/${currentCampaign._id}`
                          )
                        }
                        title={currentCampaign.title}
                      />
                      <ProgressCard campaign={currentCampaign} />
                    </Stack>
                    <LineChart
                      title={campaignOverviewData[lang].chartTitle}
                      labels={[
                        {
                          name: campaignOverviewData[lang].chartLabel1,
                          color: primaryColor,
                        },
                        {
                          name: campaignOverviewData[lang].chartLabel2,
                          color: mediumGray,
                        },
                      ]}
                      {...graphData}
                    />
                  </Flex>
                </>
              )}
        </>
      ) : (
        <Flex justify="center" align="center" h="100%">
          <Loader color="violet" />
        </Flex>
      )}
    </>
  );
};

export default CampaignOverview;
