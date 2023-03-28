import { Flex, Grid, Loader, Modal, ModalProps, Stack } from '@mantine/core';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import api from 'src/utils/api';
import { Proposal, Campaign, User, Artist } from 'src/utils/types';
import { useAuth } from 'src/utils/auth/authContext';
import Button from '@components/buttons/button';
import PCContent from '@components/pc/PCContent';
import { Subheading1 } from '@components/typography';
import UserInfo from '@components/userInfo';
import { ModalType } from '@components/pc/PCCard';
import { TbBan, TbCircleCheck } from 'react-icons/tb';
import { MessageModalProps } from '@components/modal/messageModal';
import styles from './styles.module.scss';
import { useMediaQuery } from '@mantine/hooks';
import { useLanguage } from 'src/utils/lang/languageContext';

interface IProps extends ModalProps {
  PC: Proposal | Campaign;
  modalDispatch: [
    ModalType | undefined,
    Dispatch<SetStateAction<ModalType | undefined>>
  ];
  removePC: (typeId: string) => void;
}

const fetchPCData = async (PC: Proposal | Campaign) => {
  const { message: author } = await api.user.get(
    `/getUserByEmail/${PC.author}`
  );
  const artists: Artist[] = [];
  for (const artistId of PC.artistId!) {
    const { message: artist } = await api.artist.get(`/${artistId}`);
    artists.push(artist);
  }
  return { author, artists };
};

const PCApprovalModal = (props: IProps) => {
  const { PC, modalDispatch, removePC, ...modalProps } = props;
  const [modalType, setModalType] = modalDispatch;

  const [author, setAuthor] = useState<User>();
  const [artists, setArtists] = useState<Artist[]>();

  const { userInfo } = useAuth();
  const { lang } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const label = {
    en: {
      approvalRequestHeading: 'Accept sponsor request',
      approvalHeading: 'Sponsor request accepted',
      approvalSubheading: 'After confirmation, this action cannot be undone',
      viewProposal: 'View Proposal',
      actionButton: 'Agree to sponsor',
      confirmText: 'Confirm to accept',
      rejectRequestHeading: `Reject ${
        modalType === 'Proposal' ? 'upgrade' : 'sponsor request'
      }`,
      rejectHeading: `${
        modalType === 'Proposal' ? 'Upgrade' : 'Sponsor request'
      } rejected`,
      rejectSubheading: 'After confirmation, this action cannot be undone',
      rejectButton: 'Reject',
      rejectConfirm: 'Confirm to reject',
    },
    ko: {
      approvalRequestHeading: '스폰서 요청 수락서',
      approvalHeading: '스폰서 요청 수락되었습니다',
      approvalSubheading: '확인 후에는 작업을 취소할 수 없습니다.',
      viewProposal: '제안서 보기',
      actionButton: '스폰서 동의',
      confirmText: '수락 확인',
      rejectRequestHeading: `${
        modalType === 'Proposal' ? '승진' : '스폰서 요청'
      } 거부하기`,
      rejectHeading: `${
        modalType === 'Proposal' ? '승진' : '스폰서 요청'
      } 거부되었습니다`,
      rejectSubheading: '확인 후에는 작업을 취소할 수 없습니다.',
      rejectButton: '거부하기',
      rejectConfirm: '거부 확인',
    },
  };

  const modalLabel = {
    en: {
      title: 'Created by: ',
      requested: 'Requested: ',
      artist: 'Artists: ',
      brand: 'Record label:',
      upgradeButton: 'Upgrade to Campaign',
      sponsorButton: 'Agree to sponsor',
      rejectButton: 'Reject',
    },
    ko: {
      title: '창조자: ',
      requested: '요청일: ',
      artist: '아티스트: ',
      brand: '음반사:',
      upgradeButton: '캠페인으 승진하기',
      sponsorButton: '스폰서 동의',
      rejectButton: '거부하기',
    },
  };
  useEffect(() => {
    if (!props.opened) return;
    fetchPCData(props.PC).then(({ author, artists }) => {
      setAuthor(author);
      setArtists(artists);
    });
  }, [props.opened]);

  const updateStatus = async (
    status: 'Approval' | 'Rejected',
    type: 'Proposal' | 'Sponsor'
  ) => {
    let response: Record<string, any>;

    response =
      type === 'Proposal'
        ? await api.proposal.post(`/updateApprovalStatus`, {
            _id: PC!._id,
            status,
          })
        : await api.proposal.post(`/updateSponsorStatus`, {
            proposalId: PC!._id,
            email: userInfo?.email,
            status,
          });

    return response.status === 'Success';
  };

  const handleSubmit = async (status: 'Approval' | 'Rejected') => {
    if (typeof modalType !== 'string' || modalType === 'Upgrade') return;
    if (modalType === 'Proposal' && status === 'Approval')
      setModalType('Upgrade');
    else {
      const modalContent: Record<'Approval' | 'Rejected', MessageModalProps> = {
        Approval: {
          onClose: props.onClose,
          heading: label[lang].approvalRequestHeading,
          icon: <TbCircleCheck color="#333333" size={36} />,
          onSubmit: async () => {
            setModalType([
              'Message',
              { icon: <Loader color="#C399FF" />, onClose: props.onClose },
            ]);
            if (await updateStatus(status, modalType))
              setModalType([
                'Message',
                {
                  heading: label[lang].approvalHeading,
                  icon: <TbCircleCheck color="#333333" size={36} />,
                  color: 'purple',
                  buttonText: label[lang].viewProposal,
                  onSubmit: () => {
                    setModalType(undefined);
                    router.push(`/proposals/${props.PC._id}`);
                  },
                  onClose: () => props.removePC(PC._id),
                },
              ]);
          },
          subheading: label[lang].approvalSubheading,
          buttonText: label[lang].actionButton,
          color: 'green',
          checkmarkText: label[lang].confirmText,
        },
        Rejected: {
          onClose: props.onClose,
          heading: label[lang].rejectRequestHeading,
          icon: <TbBan color="#333333" size={36} />,
          onSubmit: async () => {
            setModalType([
              'Message',
              { icon: <Loader color="#C399FF" />, onClose: props.onClose },
            ]);
            if (await updateStatus(status, modalType))
              setModalType([
                'Message',
                {
                  heading: label[lang].rejectHeading,
                  icon: <TbBan color="#333333" size={36} />,
                  color: 'purple',
                  onClose: () => props.removePC(PC._id),
                },
              ]);
          },
          subheading: label[lang].rejectSubheading,
          buttonText: label[lang].rejectButton,
          color: 'red',
          checkmarkText: label[lang].rejectConfirm,
        },
      };
      setModalType(['Message', modalContent[status]]);
    }
  };

  return (
    <Modal
      {...modalProps}
      size="80%"
      fullScreen={isMobile}
      centered
      radius="xl"
      padding={25}>
      {!PC ? (
        <Flex justify="center" align="center" h={'80vh'}>
          <Loader color="#C399FF" />
        </Flex>
      ) : (
        <Grid grow gutter="xl" p={15}>
          <Grid.Col md={7}>
            <PCContent {...PC} />
          </Grid.Col>
          <Grid.Col md={4}>
            <Stack>
              <Stack className={styles.infoContainer}>
                <Flex align="center" gap="md">
                  <Subheading1>{modalLabel[lang].title}</Subheading1>
                  {author ? <UserInfo {...author} /> : '...'}
                </Flex>
                <Subheading1>
                  {modalLabel[lang].requested}
                  {new Date(PC.startTime ?? 0).toLocaleDateString()}
                </Subheading1>
                <Subheading1>
                  {modalLabel[lang].artist}
                  {artists
                    ? artists.map((artist) => artist.name).join(', ')
                    : '...'}
                </Subheading1>
                <Subheading1>
                  {modalLabel[lang].brand} {PC.brand}
                </Subheading1>
              </Stack>
              <Button
                color="green"
                style={{ width: '100%' }}
                onClick={() => handleSubmit('Approval')}>
                {modalType === 'Proposal'
                  ? modalLabel[lang].upgradeButton
                  : modalLabel[lang].sponsorButton}
              </Button>
              <Button
                color="red"
                style={{ width: '100%' }}
                onClick={() => handleSubmit('Rejected')}>
                {modalLabel[lang].rejectButton}
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Modal>
  );
};

export default PCApprovalModal;
