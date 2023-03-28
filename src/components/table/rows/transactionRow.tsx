import { Flex } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { TbTriangle, TbTriangleInverted } from 'react-icons/tb';
import { getFormattedTimestamp } from 'src/utils/dates';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Transaction, TxType } from 'src/utils/types';
import { BodyText } from '../../typography';

const TransactionRow = (props: Transaction) => {
  const isMobile = useMediaQuery('(max-width: 576px)');
  const { lang } = useLanguage();
  const { date, time } = getFormattedTimestamp(props.timestamp, lang);

  const actionTypes: Record<
    Exclude<TxType, 'Donate SD'> | 'Donation Reward',
    string
  > = {
    'Create Proposal': '팬 제안 만들기',
    Vote: '투표',
    'Comment Reward': '댓글 보상',
    Refund: '환불',
    'Donate WM': '위매이크 기부하기',
    'Donation Reward': '기부 보상',
  };

  return (
    <Flex align="center" gap="md" direction={isMobile ? 'row-reverse' : 'row'}>
      {!isMobile && (
        <div style={{ flex: 1 }}>
          <BodyText>{date}</BodyText>
          <BodyText color="#808080">{time}</BodyText>
        </div>
      )}
      <Flex justify={isMobile ? 'end' : undefined} style={{ flex: 1 }}>
        <Flex align="center" miw="7rem" gap="xs">
          {props.amount > 0 ? (
            <TbTriangle color="#0F77F0" fill="#0F77F0" />
          ) : (
            <TbTriangleInverted color="#FF0055" fill="#FF0055" />
          )}
          <BodyText color={props.amount > 0 ? '#0F77F0' : '#FF0055'}>
            ${props.type === 'Donate WM' ? 'WM' : 'SD'} {Math.abs(props.amount)}
          </BodyText>
        </Flex>
      </Flex>
      <BodyText style={{ flex: 1 }}>
        {lang === 'en'
          ? props.type
          : actionTypes[
              props.type === 'Donate SD' ? 'Donation Reward' : props.type
            ]}
      </BodyText>
    </Flex>
  );
};

export default TransactionRow;
