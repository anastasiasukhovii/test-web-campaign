import { BodyText } from '@components/typography';
import UserBadge from '@components/userBadge';
import { Flex, FlexProps, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { getProfilePicture } from 'src/utils/storage';
import { User } from 'src/utils/types';

import styles from './styles.module.scss';

interface IProps extends Partial<User>, Omit<FlexProps, keyof User> {
  displayAddress?: boolean;
}

const UserInfo = (props: IProps) => {
  const [profilePic, setProfilePic] = useState('/emptyPhoto.png');
  useEffect(() => {
    getProfilePicture(props.profilePicture!).then((pic) => setProfilePic(pic));
  });
  const {
    displayAddress,
    _id,
    companyId,
    brand,
    email,
    encryptedSeed,
    managerRole,
    profilePicture,
    role,
    username,
    walletAddress,
    createdAt,
    updatedAt,
    ...flexProps
  } = props;
  return (
    <Flex
      gap="sm"
      align="center"
      {...flexProps}
      style={{ overflow: 'hidden', ...flexProps.style }}>
      <UserBadge profilePicture={profilePic} role={role} />
      <Stack
        spacing={0}
        align="center"
        style={{ display: 'flex', alignItems: 'start', overflow: 'hidden' }}>
        <BodyText>{username}</BodyText>
        {displayAddress && (
          <BodyText className={styles.address}>{walletAddress}</BodyText>
        )}
      </Stack>
    </Flex>
  );
};

export default UserInfo;
