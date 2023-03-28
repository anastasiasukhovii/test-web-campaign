import { Flex } from '@mantine/core';
import { getFormattedTimestamp } from 'src/utils/dates';
import { Subheading3 } from '../../typography';
import { Transaction, User } from 'src/utils/types';
import { useMediaQuery } from '@mantine/hooks';
import { TbTriangle } from 'react-icons/tb';
import UserInfo from '@components/userInfo';
import { useLanguage } from 'src/utils/lang/languageContext';

const VotingRow = (props: Transaction & User) => {
  const isMobile = useMediaQuery('(max-width: 576px)');
  const { lang } = useLanguage();
  return (
    <Flex align="center" gap="md">
      {!isMobile && (
        <Subheading3 style={{ flex: 1 }}>
          {getFormattedTimestamp(props.timestamp, lang).date}
        </Subheading3>
      )}
      <UserInfo
        style={{ flex: 3 }}
        displayAddress
        profilePicture={props.profilePicture}
        username={props.username}
        walletAddress={props.senderAddress}
      />
      <Flex justify={isMobile ? 'end' : undefined} style={{ flex: 1 }}>
        <Flex align="center" miw="7rem" gap="xs">
          <TbTriangle color="#0F77F0" fill="#0F77F0" />
          <Subheading3 color="#0F77F0">
            ${props.type === 'Donate WM' ? 'WM' : 'SD'} {props.amount}
          </Subheading3>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default VotingRow;
