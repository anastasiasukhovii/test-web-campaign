import { Modal, Stack, Radio, Flex, UnstyledButton } from '@mantine/core';
import Button from '@components/buttons/button';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { TbAlertTriangle, TbCheck } from 'react-icons/tb';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { getDateDifference } from 'src/utils/dates';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Comment } from 'src/utils/types';
import { Heading3, Subheading1, BodyText } from '../typography';
import UserBadge from '../userBadge';

const PCComments = ({ comments }: { comments: Comment[] }) => {
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>();
  const [reportedCommentId, setReportedCommentId] = useState<string>();
  const [reportStatus, setReportStatus] = useState<
    'submit' | 'submitting' | 'submitted'
  >('submit');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { userInfo } = useAuth();
  const { lang } = useLanguage();
  const reportReasons = {
    en: [
      'Spam',
      'Violence/ aggression',
      'Harrassment/ abuse',
      'Misinformation',
      'Impersonating me or other users',
    ],
    ko: [
      '스팸',
      '폭력/공격성',
      '괴롭힘/ 학대',
      '오보',
      '사용자 또는 다른 사용자로 가장',
    ],
  };
  const notReported = reportStatus !== 'submitted';

  const handleSubmitReport = async () => {
    setReportStatus('submitting');
    reportedCommentId &&
      reportReason &&
      (await api.reportComment.post('/create', {
        reporterEmail: userInfo!.email,
        reportedCommentId,
        reason: reportReason,
      }));
    setReportStatus('submitted');
    setReportedCommentId(undefined);
    setReportReason(undefined);
  };

  return (
    <>
      {/* Report Comment Modal */}
      <Modal
        fullScreen={isMobile}
        centered
        radius="xl"
        opened={reportModal}
        onClose={() => {
          setReportModal(false);
          setReportStatus('submit');
          setReportedCommentId(undefined);
          setReportReason(undefined);
        }}>
        <Stack justify="center" align="center" ta="center" p="md" mih={300}>
          <TbAlertTriangle color="gray" size={36} />
          <Heading3 fw={600}>
            {notReported ? 'Report Comment' : 'Comment Reported'}
          </Heading3>
          <Subheading1 ta="center">
            {notReported
              ? 'Please state the reason for your report'
              : 'You will be notified of your report status in Notifications.'}
          </Subheading1>

          {notReported && (
            <>
              <Radio.Group
                name="reportReason"
                orientation="vertical"
                onChange={(value) => setReportReason(value)}
                m="1rem">
                <Stack spacing={8} align="start">
                  {reportReasons[lang].map((reason) => (
                    <Radio
                      icon={(props) => (
                        <TbCheck
                          {...props}
                          strokeWidth={3.5}
                          style={{ transform: 'scale(1.5)' }}
                        />
                      )}
                      key={reason}
                      color="violet"
                      value={reason}
                      label={<BodyText>{reason}</BodyText>}
                    />
                  ))}
                </Stack>
              </Radio.Group>
              <Subheading1 style={{ textAlign: 'center' }}>
                After confirmation, this action cannot be undone.
              </Subheading1>
              <Button
                type="primary"
                style={{ width: '80%', margin: '1rem' }}
                disabled={!reportReason || reportStatus === 'submitting'}
                onClick={handleSubmitReport}>
                Submit report
              </Button>
            </>
          )}
        </Stack>
      </Modal>

      {/* Display approved comments */}
      {comments.map((comment) => {
        const dateString = getDateDifference(
          new Date(comment.createdAt).getTime(),
          lang
        );
        const user = comment.user[0];
        return (
          <Stack spacing="sm" mb="1rem" key={comment._id}>
            <Flex align="center" gap="sm" justify="space-between">
              <Flex align="center" justify="center" gap="sm">
                <UserBadge
                  profilePicture={
                    user.profilePicture
                      ? user.profilePicture
                      : '/emptyPhoto.png'
                  }
                  role={user.role}
                  username={user.username!}
                />
                <BodyText color="#D4D4D4">
                  {lang === 'en'
                    ? dateString === ''
                      ? 'just now'
                      : `${dateString} ago`
                    : dateString === ''
                    ? '방금'
                    : `${dateString.substring(
                        0,
                        dateString.lastIndexOf(' ')
                      )} 전`}
                </BodyText>
              </Flex>
              <UnstyledButton
                onClick={() => {
                  setReportedCommentId(comment._id);
                  setReportModal(true);
                }}
                style={{
                  border: '1px solid black',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '0.25rem',
                }}>
                <TbAlertTriangle size={18} />
              </UnstyledButton>
            </Flex>
            <BodyText>{comment.content}</BodyText>
          </Stack>
        );
      })}
    </>
  );
};

export default PCComments;
