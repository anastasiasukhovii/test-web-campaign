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

export const LiveCampaigns = (props: IProps) => {
  const { userInfo } = useAuth();
  const [liveCampaigns, setLiveCampaigns] = useState<Campaign[]>();

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    const getData = async () => {
      const campaignRes = await api.campaign.get(
        `/company/live/${userInfo.companyId}`
      );
      setLiveCampaigns(campaignRes.message.campaignList.reverse());
    };
    getData();
  }, [userInfo]);

  if (!liveCampaigns)
    return (
      <>
        <Flex justify="center">
          <Loader color="violet" />
        </Flex>
      </>
    );
  return liveCampaigns.length > 0 ? (
    <div className="PCCardContainer">
      {liveCampaigns.map((campaign) => (
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
