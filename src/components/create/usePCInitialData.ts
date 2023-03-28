import { useForm } from '@mantine/form';
import { SingletonRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { getProfilePicture } from 'src/utils/storage';
import { Artist, Campaign, Proposal, User } from 'src/utils/types';

interface CreateFormData {
  title: string;
  details: string;
  brand: string[];
  artistId: string[];
  titleImage?: File | string;
  supportingMaterials?: (File | string)[];
}

export interface PFormData extends CreateFormData {
  sponsors: string[];
}
export interface CFormData extends CreateFormData {
  typeId: string;
  startTime?: Date;
  endTime?: Date;
  target: number;
  costPerVote: number;
  rewardPerComment: number;
  targetWM: number;
  donateRate: number;
  twitterLink?: string;
  fbLink?: string;
  igLink?: string;
}

export const pValuesInitial: PFormData = {
  title: '',
  details: '',
  brand: [],
  sponsors: [],
  artistId: [],
  titleImage: undefined,
  supportingMaterials: undefined,
};
export const cValuesInitial: CFormData = {
  typeId: '',
  brand: [],
  artistId: [],
  titleImage: undefined,
  startTime: undefined,
  endTime: undefined,
  title: '',
  details: '',
  target: 0,
  costPerVote: 0,
  rewardPerComment: 0,
  targetWM: 0,
  donateRate: 0,
  supportingMaterials: undefined,
  fbLink: undefined,
  twitterLink: undefined,
  igLink: undefined,
};
interface CType {
  _id: string;
  typeName: string;
}

export const useCreatePCInitialData = (
  pcType: 'Proposal' | 'Campaign',
  router: SingletonRouter
) => {
  const { userInfo } = useAuth();
  const [balance, setBalance] = useState<number>();
  const [allArtists, setAllArtists] = useState<Artist[]>();
  const [allSponsors, setAllSponsors] = useState<User[]>();
  const [cTypes, setCTypes] = useState<CType[]>();

  const createPHook = useForm<PFormData>({
    initialValues: pValuesInitial,
    // validate for draft
    validate: {
      title: (value) =>
        value.length > 3 && value.length <= 100
          ? null
          : value.length > 100
          ? 'Max. 100 characters'
          : 'Required',
    },
  });
  const createCHook = useForm<CFormData>({
    initialValues: cValuesInitial,
    // validate for draft
    validate: {
      title: (value) =>
        value.length > 3 && value.length <= 100
          ? null
          : value.length > 100
          ? 'Max. 100 characters'
          : 'Required',
    },
  });

  useEffect(() => {
    if (!userInfo || !router.isReady) return;

    const getInitialData = async () => {
      // Get all artists
      const { message: artistsRes }: { message: Artist[] } =
        await api.artist.get('/all');
      const artistsWithImages: Artist[] = await Promise.all(
        artistsRes.map(async (artist) => ({
          ...artist,
          profilePic: await getProfilePicture(artist.profilePic),
        }))
      );
      setAllArtists(artistsWithImages);
      // Get all company ids
      const allCompanyIds = Array.from(
        new Set(artistsWithImages.map((artist) => artist.companyId))
      );

      if (pcType === 'Proposal') {
        // Check sufficient balance for creating proposal
        const balanceRes = await fetch(
          `/api/balance/sd/${userInfo.walletAddress}`
        );
        const { balance } = await balanceRes.json();
        setBalance(balance);

        // Get all proposal sponsors
        const { message: sponsorsRes }: { message?: { sponsors: User[] } } =
          await api.proposal.post('/sponsors', { companiesId: allCompanyIds });
        const sponsorsWithImages = sponsorsRes
          ? await Promise.all(
              sponsorsRes.sponsors.map(async (sponsor) => ({
                ...sponsor,
                profilePicture: await getProfilePicture(sponsor.profilePicture),
              }))
            )
          : undefined;
        setAllSponsors(sponsorsWithImages);
      } else {
        // Campaign Types
        const {
          message: { campaignTypeList },
        }: { message: { campaignTypeList: CType[] } } = await api.campaign.get(
          '/type/all'
        );
        setCTypes(campaignTypeList);
      }

      // Fetch draft data and save initial state
      if (router.query.draftId) {
        const draftId = router.query.draftId;
        const fetchDraft = async () => {
          if (pcType === 'Proposal') {
            const { message: pDraftRes }: { message: Proposal } =
              await api.proposal.get(`/${draftId}`);
            const draftData: PFormData = {
              title: pDraftRes.title,
              details: pDraftRes.details ?? '',
              artistId: pDraftRes?.artistId ?? [],
              supportingMaterials: pDraftRes.supportingMaterials ?? [],
              brand: pDraftRes.brand ?? [],
              sponsors: pDraftRes.sponsors ?? [],
              titleImage: pDraftRes.titleImage,
            };
            createPHook.setValues(draftData);
          }
          if (pcType === 'Campaign') {
            const { message: cDraftRes }: { message: Campaign } =
              await api.campaign.get(`/${draftId}`);
            const draftData: CFormData = {
              typeId: cDraftRes.typeId,
              brand: cDraftRes.brand ?? [],
              artistId: cDraftRes.artistId ?? [],
              titleImage: cDraftRes.titleImage,
              startTime: cDraftRes.startTime
                ? new Date(cDraftRes.startTime)
                : undefined,
              endTime: cDraftRes.endTime
                ? new Date(cDraftRes.endTime)
                : undefined,
              title: cDraftRes.title ?? '',
              details: cDraftRes.details ?? '',
              target: cDraftRes.target ?? 0,
              costPerVote: cDraftRes.costPerVote ?? 0,
              rewardPerComment: cDraftRes.rewardPerComment ?? 0,
              donateRate: cDraftRes.donateRate ?? 1,
              targetWM: cDraftRes.targetWM ?? 0,
              supportingMaterials: cDraftRes.supportingMaterials,
              twitterLink: cDraftRes.twitterLink ?? undefined,
              fbLink: cDraftRes.fbLink ?? undefined,
              igLink: cDraftRes.igLink ?? undefined,
            };
            createCHook.setValues(draftData);
          }
        };
        fetchDraft();
      }
    };
    getInitialData();
  }, [userInfo, router.isReady]);

  return {
    balance,
    allArtists,
    allSponsors,
    cTypes,
    createPCHook: pcType === 'Proposal' ? createPHook : createCHook,
  };
};
