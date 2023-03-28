import PCCard from '@components/pc/PCCard';
import { Flex, Loader } from '@mantine/core';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Campaign } from 'src/utils/types';
import { NoCampaignsYet } from './noCampaignsYet';

interface IProps {
  bookmarksDispatch: [string[], Dispatch<SetStateAction<string[]>>];
}

export const ScheduledCampaigns = (props: IProps) => {
  const { userInfo } = useAuth();
  const [scheduledCampaigns, setScheduledCampaigns] = useState<Campaign[]>();

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    const getData = async () => {
      const {
        message: campaignRes,
      }: { message: { campaignList: Campaign[] } } = await api.campaign.get(
        `/company/scheduled/${userInfo.companyId}`
      );
      setScheduledCampaigns(campaignRes.campaignList.reverse());
    };
    getData();
  }, [userInfo]);

  if (!scheduledCampaigns)
    return (
      <>
        <Flex justify="center">
          <Loader color="violet" />
        </Flex>
      </>
    );
  return scheduledCampaigns.length > 0 ? (
    <div className="PCCardContainer">
      {scheduledCampaigns.map((campaign) => (
        <PCCard
          {...props}
          {...campaign}
          type={campaign.type}
          key={campaign._id}
        />
      ))}
    </div>
  ) : (
    <NoCampaignsYet />
  );
};
