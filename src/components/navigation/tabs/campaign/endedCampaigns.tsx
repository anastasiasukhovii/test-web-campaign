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

export const EndedCampaigns = (props: IProps) => {
  const { userInfo } = useAuth();
  const [endedCampaigns, setEndedCampaigns] = useState<Campaign[]>();

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    const getData = async () => {
      const campaignRes: { message: { campaignList: Campaign[] } } =
        await api.campaign.get(`/company/ended/${userInfo.companyId}`);
      setEndedCampaigns(campaignRes.message.campaignList.reverse());
    };
    getData();
  }, [userInfo]);

  if (!endedCampaigns)
    return (
      <>
        <Flex justify="center">
          <Loader color="violet" />
        </Flex>
      </>
    );
  return endedCampaigns.length > 0 ? (
    <div className="PCCardContainer">
      {endedCampaigns.map((campaign) => (
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
