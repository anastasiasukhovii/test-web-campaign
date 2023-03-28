import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import api from 'src/utils/api';
import { getProfilePicture } from 'src/utils/storage';
import { Artist, Campaign, Comment } from 'src/utils/types';
import PCDetails from '@components/pc/PCDetails';

const getArtistWithIcons = async (artists: string[]): Promise<Artist[]> => {
  return await Promise.all(
    artists.map(async (id) => {
      const artistInfo: { message: Artist } = await api.artist.get(`/${id}`);
      const picURL = await getProfilePicture(artistInfo.message.profilePic);
      return { ...artistInfo.message, profilePic: picURL };
    })
  );
};

const CampaignDetails: NextPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [campaignInfo, setCampaignInfo] = useState<Campaign>();
  const [artistInfo, setArtistInfo] = useState<Artist[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    api.campaign
      .get(`/comments/approved/${router.query.id}`)
      .then(({ message }) => setComments(message.comments.reverse()));

    const getCampaign = async () => {
      const campaignRes = await api.campaign.get(`/${router.query.id}`);
      const artistIcons = await getArtistWithIcons(
        campaignRes.message.artistId
      );

      setArtistInfo(artistIcons);
      setCampaignInfo(campaignRes.message);
    };
    getCampaign();
  }, [router.query.id]);

  return (
    <PCDetails
      people={artistInfo}
      PCInfo={campaignInfo}
      comments={comments}
      PCType="Campaign"
    />
  );
};

export default CampaignDetails;
