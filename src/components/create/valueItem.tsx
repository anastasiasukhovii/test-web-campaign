import { BodyText } from '@components/typography';
import { Avatar, Box, CloseButton, MultiSelectValueProps } from '@mantine/core';
import styles from './multiselectItem.module.scss';

interface IProps extends MultiSelectValueProps {
  image?: string;
}

const ValueItem = (props: IProps) => {
  const { image, label, onRemove, classNames, ...htmlProps } = props;
  return (
    <div {...htmlProps}>
      <Box className={styles.valueItemContainer}>
        {image && (
          <Avatar className={styles.logo} src={image}>
            <Avatar src="/emptyPhoto.png" />
          </Avatar>
        )}
        <BodyText>{label}</BodyText>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Box>
    </div>
  );
};

export default ValueItem;
