import { Anchor, Flex, Input, Loader, Stack } from '@mantine/core';
import Button from '@components/buttons/button';
import router from 'next/router';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import {
  TbBookmark,
  TbCircleCheck,
  TbHandStop,
  TbHeartHandshake,
  TbShare,
} from 'react-icons/tb';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { ButtonState, iconProps, usePCActionState } from 'src/utils/PCAction';
import { Currency, Like, PCType, Vote } from 'src/utils/types';
import { MessageModal } from '../modal/messageModal';
import PaymentCalculation from '../paymentCalc';
import { useLanguage } from 'src/utils/lang/languageContext';
import { ShareModal } from '@components/modal/shareModal';

export const PCActions = ({
  stardustBalance,
  weMakeBalance,
  pcId,
  pcType,
  costPerVote,
}: {
  stardustBalance?: number;
  weMakeBalance?: number;
  pcId: string;
  pcType: PCType;
  costPerVote: number;
}) => {
  const { userInfo } = useAuth();
  const [bookmarkState, setBookmarkState, handleBookmark] =
    usePCActionState('bookmark');
  const [likeState, setLikeState, handleLike] = usePCActionState(
    'like',
    ...[,],
    pcType
  );
  const [modalOpened, setModalOpened] = useState<Currency>();
  const [successModalOpened, setSuccessModalOpened] = useState<Currency>();
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [voted, setVoted] = useState();
  const { lang } = useLanguage();
  const modalLabels = {
    en: {
      heading: 'Cast Your Vote!',
      confirmButton: 'Confirm Payment',
      checkboxText: `By clicking "${
        modalOpened === 'Stardust' ? 'Vote' : 'Donate'
      } now”, you confirm that you have read, understand, and accepted our `,
      discoverButton: 'Back to Discover',
      thankYouText: `Thanks for ${
        successModalOpened === 'Stardust' ? 'Voting' : 'Donating'
      }!`,
      donateButton: 'Donate to Campaign',
      subheading: `Votes require ${modalOpened} to be valid `,
      button: `${modalOpened === 'Stardust' ? 'Vote' : 'Donate'} Now`,
      likeButton: 'Like',
      bookmarkButton: 'Bookmark',
      shareText: 'Share',
    },

    ko: {
      heading: '투포하세요',
      confirmButton: '결제 확인',
      checkboxText: `${
        modalOpened === 'Stardust' ? '투표' : '기부'
      }버튼을 누르시면 이용약관을 읽고, 이해하고, 수락했음을 확인하는 것입니다.   `,
      discoverButton: '디스커버로 돌아가기',
      thankYouText: `${
        successModalOpened === 'Stardust' ? '투표' : '기부'
      }해주셔서 감사합니다!`,
      donateButton: '캠페인에 기부하기',
      subheading: `투표가 유효하려면 ${
        modalOpened === 'Stardust' ? '스타더스트' : '위매이크'
      } 필요합니다`,
      button: `${modalOpened === 'Stardust' ? '투표' : '기부'}하기`,
      likeButton: '좋아요',
      bookmarkButton: '북마크',
      shareText: '공유하기',
    },
  };

  const campaignLabels = {
    en: {
      viewButton: 'View Campaign Statistics',
      voteButton:
        voted === undefined ? (
          <Loader color="#FFFFFF" size="sm" />
        ) : voted ? (
          'Voted'
        ) : (
          'Vote Now'
        ),
      donateButton: 'Donate WeMake',
    },
    ko: {
      viewButton: '캠페인 통계',
      voteButton:
        voted === undefined ? (
          <Loader color="#FFFFFF" size="sm" />
        ) : voted ? (
          '투표됨'
        ) : (
          '투표하기'
        ),
      donateButton: '위매이크 기부하기',
    },
  };

  useEffect(() => {
    if (!userInfo) return;
    api.user
      .get(`/vote/getAllVotes/${userInfo.username}`)
      .then(({ message }) =>
        setVoted(message.votes.map((vote: Vote) => vote.typeId).includes(pcId))
      );
    api.user.get(`/bookmark/${userInfo.email}`).then((res) => {
      if (res.message.bookmark) {
        setBookmarkState(
          res.message.bookmark.proposalBookmarks.includes(pcId)
            ? ButtonState.ACTIVE
            : ButtonState.INACTIVE
        );
      }
    });
    api.user
      .get(`/like/getAllLikes/${userInfo.username}`)
      .then((res) =>
        setLikeState(
          res.message.likes.map((like: Like) => like.typeId).includes(pcId)
            ? ButtonState.ACTIVE
            : ButtonState.INACTIVE
        )
      );
  }, [userInfo, pcId]);

  if (!userInfo) return null;
  const staffCampaignView = userInfo.role !== 'Fan' && pcType === 'Campaign';

  const PaymentModal = () => {
    const [amount, setAmount] = useState('');
    const balance =
      modalOpened === 'Stardust' ? stardustBalance : weMakeBalance;
    const cost = modalOpened === 'Stardust' ? costPerVote : +amount;
    const onSubmit = () => {
      (modalOpened === 'Stardust'
        ? function () {
            const body = { username: userInfo?.username, typeId: pcId };
            pcType === 'Proposal'
              ? api.proposal.post('/vote', body)
              : api.campaign.post('/vote', body);
          }
        : function () {
            const body = {
              username: userInfo?.username,
              campaignId: pcId,
              WMamount: +amount,
            };
            api.campaign.post('/donate', body);
          })();
      setSuccessModalOpened(modalOpened);
      setModalOpened(undefined);
    };

    return (
      <MessageModal
        opened={!!modalOpened}
        sticky={false}
        onClose={() => setModalOpened(undefined)}
        icon={<TbHandStop color="#6a00ff" size={36} />}
        heading={modalLabels[lang].heading}
        subheading={modalLabels[lang].subheading}
        buttonText={modalLabels[lang].button}
        buttonDisabled={
          modalOpened === 'Stardust'
            ? balance! < cost
            : cost <= 0 || balance! < cost
        }
        onSubmit={onSubmit}
        bodyContent={
          <>
            {modalOpened === 'WeMake' && (
              <Input
                placeholder="$WM"
                radius="md"
                value={amount}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setAmount(event.target.value)
                }
                type="number"
                w="90%"
                size="lg"
              />
            )}
            <PaymentCalculation
              balance={balance!}
              cost={cost}
              currency={modalOpened ?? 'Stardust'}
            />
          </>
        }
        checkmarkText={
          balance! < cost ? undefined : (
            <div style={{ display: 'inline-block' }}>
              {modalLabels[lang].checkboxText}
              <Anchor
                style={{ display: 'inline-block' }}
                size="sm"
                target="_blank"
                color="black"
                underline={true}
                href="/legal">
                {lang === 'en' ? 'Terms of Use' : '(이용약관 읽기)'}
              </Anchor>
            </div>
          )
        }
      />
    );
  };

  return (
    <>
      <PaymentModal />
      <MessageModal
        opened={!!successModalOpened}
        onClose={() => setSuccessModalOpened(undefined)}
        onSubmit={() => router.replace('/user/proposals')}
        color="purple"
        buttonText={modalLabels[lang].discoverButton}
        heading={modalLabels[lang].thankYouText}
        icon={<TbCircleCheck color="#6a00ff" size={36} />}
        sticky={false}
      />
      <ShareModal
        onClose={() => setShareModalOpened(false)}
        opened={shareModalOpened}
      />
      <Stack spacing="lg" pt="0.5rem">
        {staffCampaignView ? (
          <Button
            size="lg"
            style={{ width: '100%' }}
            onClick={() =>
              router.replace(`/admin/campaigns/statistics/${pcId}`)
            }>
            {campaignLabels[lang].viewButton}
          </Button>
        ) : (
          <Stack>
            <Button
              size="lg"
              style={{ width: '100%' }}
              disabled={voted || voted === undefined}
              onClick={() => setModalOpened('Stardust')}>
              {voted !== undefined && <TbHandStop />}
              {campaignLabels[lang].voteButton}
            </Button>
            {pcType === 'Campaign' && (
              <Button
                size="lg"
                color="black"
                style={{ width: '100%' }}
                onClick={() => setModalOpened('WeMake')}>
                <TbHeartHandshake /> {campaignLabels[lang].donateButton}
              </Button>
            )}
          </Stack>
        )}
        <Flex justify="space-between" wrap="wrap" gap="sm">
          {staffCampaignView ? undefined : (
            <>
              <Button
                color="black"
                type="secondary"
                onClick={() => handleLike(userInfo.username, pcId)}
                style={{ flex: 1 }}>
                <FiHeart {...iconProps[likeState]} />
                {modalLabels[lang].likeButton}
              </Button>
              <Button
                color="black"
                type="secondary"
                onClick={() => handleBookmark(userInfo.email, pcId, 'Proposal')}
                style={{ flex: 1 }}>
                <TbBookmark {...iconProps[bookmarkState]} />
                {modalLabels[lang].bookmarkButton}
              </Button>
            </>
          )}

          <Button
            color="black"
            type="secondary"
            style={{ flex: 1 }}
            onClick={() => {
              setShareModalOpened(true);
            }}>
            <TbShare />
            {modalLabels[lang].shareText}
          </Button>
        </Flex>
      </Stack>
    </>
  );
};
