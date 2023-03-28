import { BodyText } from '@components/typography';
import { Group, Avatar } from '@mantine/core';
import { forwardRef } from 'react';
import styles from './multiselectItem.module.scss';

interface IProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  image?: string;
}

const SelectItem = forwardRef<HTMLDivElement, IProps>(
  ({ label, image, ...htmlProps }: IProps, ref) => (
    <div ref={ref} {...htmlProps}>
      <div className={styles.selectItem}>
        <Group noWrap>
          {image && (
            <Avatar className={styles.logo} src={image}>
              <Avatar src="/emptyPhoto.png" />
            </Avatar>
          )}
          <BodyText>{label}</BodyText>
        </Group>
      </div>
    </div>
  )
);

export default SelectItem;
