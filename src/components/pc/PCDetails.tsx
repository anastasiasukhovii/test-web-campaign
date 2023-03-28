import { Flex, Loader, Stack, Textarea } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { TbCheck } from 'react-icons/tb';

import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { getProfilePicture } from 'src/utils/storage';
import { Campaign, Artist, Comment, Proposal, User } from 'src/utils/types';
import BackButton from '../buttons/backButton';
import Button from '../buttons/button';
import { MessageModal } from '../modal/messageModal';
import { PCActions } from './PCActions';
import PCContent from './PCContent';
import { PCStatCard } from './PCStatCard';
import { Subheading1 } from '../typography';
import UserBadge from '../userBadge';
import styles from 'styles/twoColumnLayout.module.scss';
import PCComments from './PCComments';
import { useLanguage } from 'src/utils/lang/languageContext';

interface IProps {
  people: Artist[] | User[]; //artists (C) or sponsors (P)
  comments: Comment[];
  PCInfo?: Proposal | Campaign;
  PCType: 'Proposal' | 'Campaign';
}

let text = {
  en: {
    backButton: 'Back',
    heading: 'Join the Conversation!',
    commentHeading: 'Comments',
    placeholder: 'What do you think?',
    confirmation: 'Your Comment Has Been Submitted.',
    commentButton: 'Comment',
  },
  ko: {
    backButton: '뒤로',
    heading: '댓글을 남겨보세요!',
    commentHeading: '댓글',
    placeholder: '나의 감상을 남겨보세요!',
    confirmation: '댓글을 받았습니다. 승인 중 입니다.',
    commentButton: '댓글 올리기',
  },
};

const PCDetails = (props: IProps) => {
  const [commentContent, setCommentContent] = useState('');
  const [stardustBalance, setStardustBalance] = useState();
  const [weMakeBalance, setWeMakeBalance] = useState();
  const [profilePicture, setProfilePicture] = useState('');
  const [successCommentModal, setSuccessCommentModal] = useState(false);
  const { userInfo } = useAuth();
  const { lang } = useLanguage();

  const [userComments, setUserComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!userInfo) return;
    if (userInfo.role === 'Fan')
      text = {
        en: {
          ...text.en,
          confirmation: text.en.confirmation + ' Please wait for approval.',
        },
        ko: {
          ...text.ko,
          confirmation: text.en.confirmation + ' 승인 중 입니다.',
        },
      };
    fetch(`/api/balance/sd/${userInfo.walletAddress}`).then((res) =>
      res.json().then(({ balance: bal }) => setStardustBalance(bal))
    );
    fetch(`/api/balance/wm/${userInfo.walletAddress}`).then((res) =>
      res.json().then(({ balance: bal }) => setWeMakeBalance(bal))
    );
    getProfilePicture(userInfo.profilePicture).then((pic) =>
      setProfilePicture(pic)
    );
  }, [userInfo]);

  if (!userInfo || !props.PCInfo)
    return (
      <Flex justify="center" align="center" h="100%">
        <Loader color="violet" />
      </Flex>
    );
  return (
    <div>
      <MessageModal
        opened={successCommentModal}
        icon={<TbCheck color="#6a00ff" size={50} />}
        onClose={() => setSuccessCommentModal(false)}
        onSubmit={() => setSuccessCommentModal(false)}
        heading={text[lang].confirmation}
        buttonText={<>{text[lang].backButton}</>}
      />
      <Flex gap="lg" wrap="wrap">
        <Stack className={styles.leftColumn}>
          <BackButton />
          <PCContent {...props.PCInfo} />
        </Stack>
        <Stack className={styles.rightColumn}>
          <PCStatCard
            pcInfo={props.PCInfo}
            iconsInfo={props.people}
            pcType={props.PCType}
          />
          <PCActions
            {...{ stardustBalance, weMakeBalance }}
            pcId={props.PCInfo._id}
            pcType={props.PCType}
            costPerVote={props.PCInfo.costPerVote}
          />
        </Stack>
      </Flex>
      <Stack className={styles.leftColumn}>
        <div style={{ paddingTop: '5rem' }}>
          <hr style={{ borderTop: '0.5px solid #808080' }} />
        </div>
        <Flex justify="space-between">
          <Subheading1>{text[lang].heading}</Subheading1>
          <Subheading1 color="#808080">
            {props.comments.length + userComments.length}{' '}
            {text[lang].commentHeading}
          </Subheading1>
        </Flex>
        <UserBadge
          profilePicture={profilePicture}
          username={userInfo.username}
          role={userInfo.role}
        />
        <Textarea
          radius="md"
          placeholder={text[lang].placeholder}
          size="sm"
          minRows={4}
          maxRows={4}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
        <Button
          type="secondary"
          color="black"
          style={{ marginLeft: 'auto' }}
          disabled={commentContent === ''}
          onClick={async () => {
            const status = userInfo.role === 'Fan' ? undefined : 'Approval';
            const body = {
              content: commentContent,
              type: props.PCType,
              typeId: props.PCInfo?._id,
              username: userInfo.username,
              status,
            };
            const {
              message: { comment },
            } = await api.comment.post('/create', body);
            if (status === 'Approval')
              setUserComments((prev) => [
                { ...comment, user: [userInfo] },
                ...prev,
              ]);
            setSuccessCommentModal(true);
            setCommentContent('');
          }}>
          {text[lang].commentButton}
        </Button>
        <PCComments comments={[...userComments, ...props.comments]} />
      </Stack>
      <BackButton mt="xl" up centered />
    </div>
  );
};

export default PCDetails;
