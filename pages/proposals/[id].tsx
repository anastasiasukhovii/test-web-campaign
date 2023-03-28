import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import api from 'src/utils/api';
import { getProfilePicture } from 'src/utils/storage';
import { Comment, Proposal, User } from 'src/utils/types';
import PCDetails from '@components/pc/PCDetails';

const getSponsorsWithIcons = async (sponsors: string[]) => {
  const sponsorsInfo: User[] = await Promise.all(
    sponsors.map(async (email) => {
      const sponsorInfo: { message: User } = await api.user.get(
        `/getUserByEmail/${email}`
      );
      const picURL = await getProfilePicture(
        sponsorInfo.message.profilePicture
      );
      return { ...sponsorInfo.message, profilePicture: picURL };
    })
  );

  return sponsorsInfo;
};

const Proposal: NextPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [proposalInfo, setProposalInfo] = useState<Proposal>();
  const [sponsorsInfo, setSponsorsInfo] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    api.proposal
      .get(`/comments/approved/${router.query.id}`)
      .then(({ message }) => setComments(message.comments.reverse()));
    api.proposal
      .get(`/${router.query.id}`)
      .then((proposal) => setProposalInfo(proposal.message));
  }, [router.query.id]);

  useEffect(() => {
    if (!proposalInfo) return;
    getSponsorsWithIcons(proposalInfo.sponsors).then((res) => {
      setSponsorsInfo(res);
    });
  }, [proposalInfo]);

  return (
    <PCDetails
      people={sponsorsInfo}
      PCInfo={proposalInfo}
      comments={comments}
      PCType="Proposal"
    />
  );
};

export default Proposal;
