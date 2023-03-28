import { Modal, ModalProps, Stack } from '@mantine/core';
import { useState } from 'react';

import Button from '@components/buttons/button';
import { BodyText, Heading1, Subheading1 } from '@components/typography';
import UserInfo from '@components/userInfo';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Comment, Company, Report } from 'src/utils/types';
import { statusText, statusTextReported } from '../commentStatus';
import styles from './styles.module.scss';
import { useMediaQuery } from '@mantine/hooks';
import { getFormattedTimestamp } from 'src/utils/dates';
import { useLanguage } from 'src/utils/lang/languageContext';

interface IProps extends Comment, ModalProps {
  report?: Report[];
  statusDispatch: React.Dispatch<React.SetStateAction<string>>[];
}

const CommentApprovalModal = (props: IProps) => {
  const [setStatus, setStatusColor] = props.statusDispatch;
  const { userInfo } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { lang } = useLanguage();
  const label = {
    en: {
      title: `Review ${props.report && 'Reported'} Comment`,
      warning: 'Note, this action cannot be undone',
      banButton: 'Ban comment',
      deleteButton: 'Delete report',
      rewardButton: 'Reward comment',
      rejectButton: 'Reject',
    },
    ko: {
      title: `${props.report && '신고된 '}댓글 검토하기`,
      warning: '이 작업은 취소할 수 없습니다.',
      banButton: '댓글 금지하기',
      deleteButton: '보고서 삭제',
      rewardButton: '댓글 보상하기',
      rejectButton: '거부하기',
    },
  };
  return (
    <Modal
      {...props}
      centered
      size="auto"
      fullScreen={isMobile}
      radius="xl"
      styles={{ body: { height: '95%' } }}>
      <Stack p="md" h="100%" miw="22rem">
        <Heading1>{label[lang].title}</Heading1>
        <Stack className={styles.outline}>
          <BodyText style={{ alignSelf: 'end' }}>
            {getFormattedTimestamp(props.createdAt, lang).date},{' '}
            {getFormattedTimestamp(props.createdAt, lang).time}
          </BodyText>
          <UserInfo
            {...props.user[0]}
            displayAddress
            w="100%"
            justify="start"
          />
          <BodyText className={styles.content}>{props.content}</BodyText>
        </Stack>

        {props.report ? (
          <Stack spacing={30} className={styles.buttonContainer}>
            <Subheading1 className={styles.note}>
              {label[lang].warning}
            </Subheading1>
            <Button
              disabled={submitted}
              color="red"
              onClick={() => {
                setSubmitted(true);
                api.reportComment.post('/updateStatus', {
                  _id: props.report![0]._id,
                  reportedCommentId: props.report![0].reportedCommentId,
                  status: 'Deleted',
                });
                const [s, c] = statusTextReported['Deleted'];
                setStatus(s[lang]);
                setStatusColor(c);
                props.onClose();
              }}>
              {label[lang].banButton}
            </Button>
            <Button
              disabled={submitted}
              type="secondary"
              color="black"
              onClick={() => {
                setSubmitted(true);
                api.reportComment.post('/updateStatus', {
                  _id: props.report![0]._id,
                  reportedCommentId: props.report![0].reportedCommentId,
                  status: 'Denied',
                });
                const [s, c] = statusTextReported['Denied'];
                setStatus(s[lang]);
                setStatusColor(c);
                props.onClose();
              }}>
              {label[lang].deleteButton}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={30} className={styles.buttonContainer}>
            <Subheading1 className={styles.note}>
              {label[lang].warning}
            </Subheading1>
            <Button
              color="green"
              disabled={submitted}
              onClick={async () => {
                setSubmitted(true);
                api.comment.post(`/updateApprovalStatus/${props._id}`, {
                  status: 'Approval',
                });
                const { message: companyInfo }: { message: Company } =
                  await api.company.get(`/${userInfo?.companyId}`);
                api.reward.post(`/${props.type.toLowerCase()}`, {
                  companyName: companyInfo.companyName,
                  receiverName: props.user[0].username,
                  typeId: props.typeId,
                });
                const [s, c] = statusText['Approval'];
                setStatus(s[lang]);
                setStatusColor(c);
                props.onClose();
              }}>
              {label[lang].rewardButton}
            </Button>
            <Button
              color="red"
              disabled={submitted}
              onClick={() => {
                setSubmitted(true);
                api.comment.post(`/updateApprovalStatus/${props._id}`, {
                  status: 'Rejected',
                });
                const [s, c] = statusText['Rejected'];
                setStatus(s[lang]);
                setStatusColor(c);
                props.onClose();
              }}>
              {label[lang].rejectButton}
            </Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default CommentApprovalModal;
