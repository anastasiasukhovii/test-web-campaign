import { CopyButton, Flex, Stack, UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import {
  Dispatch,
  Fragment,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { TbBookmark, TbShare } from 'react-icons/tb';

import { useAuth } from 'src/utils/auth/authContext';
import { Campaign, PCType, Proposal } from 'src/utils/types';
import styles from './styles.module.scss';
import { Subheading3 } from '@components/typography';
import { ButtonState, iconProps, usePCActionState } from 'src/utils/PCAction';
import { getDateDifference } from 'src/utils/dates';
import { getUploadedFile } from 'src/utils/storage';
import api from 'src/utils/api';
import {
  MessageModal,
  MessageModalProps,
} from '@components/modal/messageModal';
import {
  PCApprovalModal,
  UpgradeProposalModal,
} from '@components/navigation/tabs/approval';
import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { ShareModal } from '@components/modal/shareModal';

//EXPORT IT
export type ModalType =
  | 'Proposal'
  | 'Sponsor'
  | 'Upgrade'
  | ['Message', MessageModalProps];
type Variant = 'Draft' | 'Request';

interface PCCardProps {
  bookmarksDispatch?: [string[], Dispatch<SetStateAction<string[]>>];
  type: PCType;
  variant?: Variant;
  modalType?: ModalType;
  removePC?: (typeId: string) => void;
}

interface DraftURL {
  pathname: string;
  query: { draftId: string };
}

const PCCard = (props: (Proposal | Campaign) & PCCardProps) => {
  const router = useRouter();
  const [bookmarks, setBookmarks] = props.bookmarksDispatch ?? [];
  const { userInfo } = useAuth();
  const [bookmarkState, , handleBookmark] = usePCActionState(
    'bookmark',
    bookmarks?.includes(props._id)
  );
  const [titleImage, setTitleImage] = useState('');
  const [PC, setPC] = useState<Proposal | Campaign>();
  const [modalType, setModalType] = useState<ModalType>();
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [text, setText] = useState('');
  const [messageModalProps, setMessageModalProps] =
    useState<MessageModalProps>();
  const { lang } = useLanguage();

  const modalLabels = {
    en: { shareText: 'Share', shared: 'Link Copied', copyLink: 'Copy Link' },
    ko: {
      shareText: '공유하기',
      shared: '링크 복사됬습니다',
      copyLink: '링크 복사하기',
    },
  };

  const mediaButtons = {};
  useEffect(() => {
    if (bookmarkState === ButtonState.LOADING || !setBookmarks) return;
    setBookmarks((prev) =>
      bookmarkState === ButtonState.ACTIVE
        ? Array.from(new Set([...prev, props._id]))
        : prev.filter((pc) => pc !== props._id)
    );
  }, [bookmarkState]);

  useEffect(() => {
    if (props.titleImage)
      getUploadedFile(props.titleImage).then(
        (image) => typeof image === 'string' && setTitleImage(image)
      );
    (props.type === 'Proposal'
      ? api.proposal.get(`/${props._id}`)
      : api.campaign.get(`/${props._id}`)
    ).then(({ message: PC }) => setPC(PC));
  }, []);

  useEffect(() => {
    if (typeof modalType !== 'object') return;
    setMessageModalProps(modalType[1]);
  }, [modalType]);

  // Redirect URLs
  const publishedCardURL: Record<PCType, string> = {
    Proposal: `/proposals/${props._id}`,
    Campaign: `/campaigns/${props._id}`,
  };
  const statisticsURL = `/admin/campaigns/statistics/${props._id}`;
  const draftCardURL: Record<PCType, DraftURL> = {
    Proposal: {
      pathname: `/user/proposals/create`,
      query: { draftId: props._id },
    },
    Campaign: {
      pathname: `/admin/campaigns/create`,
      query: { draftId: props._id },
    },
  };
  const getRedirectURL = () => {
    switch (props.variant) {
      case 'Draft':
        return draftCardURL[props.type];
      case 'Request':
        return undefined;
      default:
        if (Date.now() > props.endTime)
          return props.type === 'Proposal'
            ? publishedCardURL[props.type]
            : statisticsURL;
        if (Date.now() < (props.startTime ?? 0))
          return publishedCardURL[props.type];
        if (Date.now() > (props.startTime ?? 0) && Date.now() < props.endTime)
          return props.type === 'Proposal'
            ? publishedCardURL[props.type]
            : userInfo!.role == 'Fan'
            ? publishedCardURL[props.type]
            : statisticsURL;
    }
  };

  const getCardText = () => {
    const label: Record<Language, string[]> = {
      en: ['Draft', 'Requested', 'Ended', 'Publishes', 'Votes | Ends in'],
      ko: ['초안', '요청날', '종료', '발행일', '명 참여 |'],
    };
    switch (props.variant) {
      case 'Draft':
        return label[lang][0];
      case 'Request':
        return `${label[lang][1]} ${
          props.startTime ? new Date(props.startTime).toLocaleDateString() : '-'
        }`;
      default:
        if (Date.now() > props.endTime) return label[lang][2];
        if (Date.now() < (props.startTime ?? 0))
          return `${label[lang][3]} ${
            props.startTime
              ? new Date(props.startTime).toLocaleDateString()
              : '-'
          }`;
        if (Date.now() > (props.startTime ?? 0) && Date.now() < props.endTime)
          return `${PC?.votes ?? 0} ${label[lang][4]} ${getDateDifference(
            props.endTime,
            lang
          )}`;
    }
  };

  return (
    <Fragment key={props._id}>
      <ShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        link={publishedCardURL[props.type]}
      />
      <Stack
        className={styles.container}
        onClick={() => {
          if (!props.modalType) {
            const res = getRedirectURL();
            res && router.replace(res);
          } else setModalType(props.modalType);
        }}>
        {/* Title Image */}
        <div className={styles.imgContainer}>
          <img
            src={titleImage}
            onError={(e) => {
              e.currentTarget.src = '/authPageLogo.svg';
              e.currentTarget.className = styles.imageFallback;
            }}
            onLoad={(e) => {
              if (!e.currentTarget.src.includes('/authPageLogo.svg')) {
                e.currentTarget.className = styles.image;
              }
            }}
          />
        </div>

        {/* Card content */}
        <Stack p="md" justify="space-between" h="50%">
          {/* Title and type flag */}
          <Flex
            gap={10}
            style={{ overflow: 'hidden', alignItems: 'flex-start' }}>
            <img
              src={props.type === 'Proposal' ? '/General.png' : '/Business.png'}
              className={styles.badge}
            />
            <Subheading3>{props.title}</Subheading3>
          </Flex>
          {/* Tags and buttons */}
          <Flex justify="space-between">
            <div
              className={
                props.variant === 'Request' ? styles.requestText : undefined
              }>
              <Subheading3>{getCardText()}</Subheading3>
            </div>
            {!(props.variant === 'Draft') && (
              <Flex gap="sm" className={styles.bottom}>
                {userInfo?.role === 'Fan' && (
                  <UnstyledButton
                    className={styles.iconButton}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleBookmark(userInfo.email, props._id, props.type);
                    }}>
                    <TbBookmark size={20} {...iconProps[bookmarkState]} />
                  </UnstyledButton>
                )}
                <UnstyledButton
                  className={styles.iconButton}
                  style={{ zIndex: '-1' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareModalOpened(true);
                    console.log('sharemodal');
                  }}>
                  <TbShare size={20} />
                </UnstyledButton>
              </Flex>
            )}
          </Flex>
        </Stack>
      </Stack>
      {PC && props.modalType && props.removePC && (
        <>
          <PCApprovalModal
            opened={
              typeof modalType === 'string' &&
              ['Proposal', 'Sponsor'].includes(modalType)
            }
            onClose={() => setModalType(undefined)}
            PC={PC}
            modalDispatch={[modalType, setModalType]}
            removePC={props.removePC}
          />
          <UpgradeProposalModal
            opened={modalType === 'Upgrade'}
            onClose={() => setModalType(undefined)}
            PC={PC}
            modalDispatch={[modalType, setModalType]}
            removePC={props.removePC}
          />
          <MessageModal
            opened={(modalType && modalType[0] === 'Message') ?? false}
            onClose={
              messageModalProps?.onClose ??
              (() => setModalType(props.modalType))
            }
            {...(typeof messageModalProps === 'object' && messageModalProps)}
          />
        </>
      )}
    </Fragment>
  );
};

export default PCCard;
