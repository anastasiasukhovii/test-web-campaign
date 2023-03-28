import { Subheading2, Heading3 } from '@components/typography';
import { FlexProps, Loader } from '@mantine/core';
import { CSSProperties } from 'react';

import styles from './styles.module.scss';

interface IProps extends FlexProps {
  data?: string | number | null;
  description: string;
  descWeight?: CSSProperties['fontWeight'];
  icon?: JSX.Element;
  sponsors?: React.ReactNode;
}

const StatCard = (props: IProps) => {
  const {
    data,
    description,
    descWeight: fontWeight,
    icon,
    sponsors,
    className,
    ...flexProps
  } = props;
  return (
    <div className={[styles.container, className].join(' ')} {...flexProps}>
      {icon}
      {data !== undefined ? (
        data !== null && (
          <Heading3 className={styles.data}>{data.toString()}</Heading3>
        )
      ) : (
        <Loader variant="dots" size="sm" color="gray" my="md" />
      )}
      <Subheading2
        className={styles.description}
        style={{ fontWeight, marginTop: data ? undefined : '0' }}>
        {description}
      </Subheading2>
      {sponsors}
    </div>
  );
};

export default StatCard;
