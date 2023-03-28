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

export const DraftCampaigns = (props: IProps) => {
  const { userInfo } = useAuth();
  const [draftCampaigns, setDraftCampaigns] = useState<Campaign[]>();

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    const getData = async () => {
      const campaignRes: { message: { campaignList: Campaign[] } } =
        await api.campaign.get(`/company/draft/${userInfo.companyId}`);
      setDraftCampaigns(campaignRes.message.campaignList.reverse());
    };
    getData();
  }, [userInfo]);

  if (!draftCampaigns)
    return (
      <Flex justify="center">
        <Loader color="violet" />
      </Flex>
    );
  return draftCampaigns.length > 0 ? (
    <div className="PCCardContainer">
      {draftCampaigns.map((campaign) => (
        <PCCard
          {...props}
          {...campaign}
          type={campaign.type}
          variant="Draft"
          key={campaign._id}
        />
      ))}
    </div>
  ) : (
    <NoCampaignsYet />
  );
};
