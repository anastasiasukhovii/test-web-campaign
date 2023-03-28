import { UnstyledButton, UnstyledButtonProps } from '@mantine/core';
import { useRouter } from 'next/router';
import { TbChevronLeft, TbChevronUp } from 'react-icons/tb';
import { useLanguage } from 'src/utils/lang/languageContext';
import styles from './styles.module.scss';

interface IProps extends UnstyledButtonProps {
  up?: boolean;
  centered?: boolean;
}

const BackButton = (props: IProps) => {
  const router = useRouter();
  const { up, centered, ...buttonProps } = props;
  const Icon = up ? TbChevronUp : TbChevronLeft;
  const { lang } = useLanguage();
  return (
    <UnstyledButton
      sx={{ margin: centered ? 'auto' : undefined }}
      onClick={() => (up ? window.scrollTo(0, 0) : router.back())}
      {...buttonProps}
      className={[buttonProps.className, styles.button].join(' ')}>
      <Icon size={20} />
      {lang === 'en' ? `Back ${up ? 'Up' : ''} ` : `${up ? '위' : '뒤'}로 `}
    </UnstyledButton>
  );
};

export default BackButton;
