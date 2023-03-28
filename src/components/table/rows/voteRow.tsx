import { BodyText, Subheading3 } from '@components/typography';
import { Flex, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { TbTriangle, TbTriangleInverted } from 'react-icons/tb';
import { getFormattedTimestamp } from 'src/utils/dates';
import { useLanguage } from 'src/utils/lang/languageContext';
import { PCType } from 'src/utils/types';

interface IProps {
  type: PCType;
  title: string;
  amount: number;
  timestamp: EpochTimeStamp;
}

const VoteRow = (props: IProps) => {
  const isMobile = useMediaQuery('(max-width: 576px)');
  const { lang } = useLanguage();
  const { date, time } = getFormattedTimestamp(props.timestamp, lang);
  const label = { Proposal: '제안', Campaign: '캠페인' };

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
          {props.amount >= 0 ? (
            <TbTriangle color="#0F77F0" fill="#0F77F0" />
          ) : (
            <TbTriangleInverted color="#FF0055" fill="#FF0055" />
          )}
          <Subheading3 color={props.amount >= 0 ? '#0F77F0' : '#ff0055'}>
            $SD{Math.abs(props.amount)}
          </Subheading3>
        </Flex>
      </Flex>
      {!isMobile && (
        <BodyText style={{ flex: 1 }}>
          {lang === 'en' ? props.type : label[props.type]}
        </BodyText>
      )}
      <Stack spacing={0} style={{ flex: 1 }}>
        <BodyText>{props.title}</BodyText>
      </Stack>
    </Flex>
  );
};

export default VoteRow;
