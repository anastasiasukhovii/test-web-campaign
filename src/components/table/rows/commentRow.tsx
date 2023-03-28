import { BodyText } from '@components/typography';
import { Flex, Stack, Button, ActionIcon } from '@mantine/core';
import { FaCircle } from 'react-icons/fa';
import { useMediaQuery } from '@mantine/hooks';
import { Fragment, useEffect, useState } from 'react';
import { getFormattedTimestamp } from 'src/utils/dates';
import { Comment, Report } from 'src/utils/types';
import UserInfo from '../../userInfo';
import {
  statusText,
  statusTextReported,
  statusTextDot,
  statusTextReportedDot
} from '../../navigation/tabs/approval/commentStatus';
import { CommentApprovalModal } from '@components/navigation/tabs/approval';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';

interface IProps extends Comment {
  report?: Report[];
}

const CommentRow = (props: IProps) => {
  const [status, setStatus] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [statusColorDot, setStatusColorDot] = useState('');
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 576px)');
  const hideDate = useMediaQuery('(max-width: 1000px)');
  const hideUser = useMediaQuery('(min-width: 768px) and (max-width: 1000px)');
  const { userInfo } = useAuth();
  const { lang } = useLanguage();

  useEffect(() => {
    let s = { en: '', ko: '' },
      c = '',
      cd = '';
    if (props.isReported && props.report) {
      [s, c] = statusTextReported[props.report[0]?.status ?? 'Pending'];
      cd = statusTextReportedDot[props.report[0]?.status ?? 'Pending'];
    }
    else {
      //@ts-ignore | remove after approval[] is changed to approval
      [s, c] = statusText[props.approval[0].status];
      //@ts-ignore | remove after approval[] is changed to approval
      cd = statusTextDot[props.approval[0].status];
    }
    setStatus(s[lang]);
    setStatusColor(c);
    setStatusColorDot(cd);
  }, [lang]);

  const containerProps = statusColor === '#FFF5CE' &&
    userInfo?.role !== 'Fan' && {
    onClick: () => setOpened(true),
    style: { cursor: 'pointer' },
  };

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

  return (
    <Fragment key={props._id}>
      <Flex align="center" gap="md" {...containerProps}>
        {!hideDate && (
          <Stack spacing={0} style={{ flex: 1 }}>
            <BodyText>
              {getFormattedTimestamp(props.createdAt, lang).date}
            </BodyText>
            <BodyText color="#808080">
              {getFormattedTimestamp(props.createdAt, lang).time}
            </BodyText>
          </Stack>
        )}

        {!(hideUser || isMobile) && props.user.length > 0 && (
          <div style={{ flex: 2 }}>
            <UserInfo {...props.user[0]} />
          </div>
        )}
        <Stack spacing="xs" justify="start" style={{ flex: 4 }}>
          <BodyText
            style={{
              overflow: 'hidden',
              maxHeight: '3.75rem',
            }}>
            {props.content}
          </BodyText>
          {(hideUser || isMobile) && props.user.length > 0 && (
            <BodyText color="#808080">{props.user[0].username}</BodyText>
          )}
        </Stack>
        {props.report && !isMobile && (
          <BodyText
            style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {reportReasons[lang][
              reportReasons.en.indexOf(props.report[0]?.reason)
            ] ?? '-'}
          </BodyText>
        )}
        <Button size="md" 
          style={{ 
            width: '200px', 
            height: '50px', 
            backgroundColor: statusColor }} 
          disabled>
          <ActionIcon style={{ color: statusColorDot }}>
            <FaCircle size={10} />
          </ActionIcon>
          <BodyText ta="center" style={{ marginInline: '0.3rem' }}>
            {status}
          </BodyText>
        </Button>
      </Flex>
      <CommentApprovalModal
        opened={opened}
        onClose={() => setOpened(false)}
        statusDispatch={[setStatus, setStatusColor]}
        {...props}
      />
    </Fragment>
  );
};

export default CommentRow;
