import { Subheading2 } from '@components/typography';
import { Flex } from '@mantine/core';
import styles from './styles.module.scss';

interface badgeProps {
  profilePicture: string;
  username?: string;
  role?: 'Fan' | 'Staff' | 'Manager' | 'Sponsor';
}

const UserBadge = (props: badgeProps) => {
  const badge = {
    Fan: '/General.png',
    Sponsor: '/Sponsor.png',
    Staff: '/Business.png',
    Manager: '/Business.png',
  };
  return (
    <Flex align={'center'} gap="sm">
      <div className={styles.container}>
        <img
          src={props.profilePicture}
          onError={(e) => {
            e.currentTarget.src = '/emptyPhoto.png';
          }}
          className={styles.logo}
        />
        {props.role && <img src={badge[props.role]} className={styles.badge} />}
      </div>
      {props.username ? <Subheading2>{props.username}</Subheading2> : null}
    </Flex>
  );
};

export default UserBadge;
