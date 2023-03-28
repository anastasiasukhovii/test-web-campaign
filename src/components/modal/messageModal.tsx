import Button from '@components/buttons/button';
import {
  Heading1,
  Subheading1,
  BodyText,
  Heading4,
} from '@components/typography';
import { Checkbox, Modal, ModalProps, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ReactNode, useState } from 'react';
import { useLanguage } from 'src/utils/lang/languageContext';

interface IProps
  extends Omit<ModalProps, keyof MessageModalProps>,
    MessageModalProps {}

export type MessageModalProps = {
  buttonDisabled?: boolean;
  buttonText?: string | ReactNode;
  bodyContent?: JSX.Element;
  checkmarkText?: string | JSX.Element;
  color?: 'green' | 'red' | 'purple';
  heading?: string;
  icon?: JSX.Element;
  onClose: () => void;
  onSubmit?: () => void;
  sticky?: boolean;
  subheading?: string;
};

const MessageModal = (props: IProps) => {
  const {
    buttonDisabled,
    buttonText,
    bodyContent,
    checkmarkText,
    color = 'purple',
    heading,
    icon,
    onSubmit,
    sticky,
    subheading,
    ...modalProps
  } = props;
  const [checkmarked, setCheckmarked] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { lang } = useLanguage();
  const label = {
    en: { confirmButton: 'Confirm Payment' },
    ko: { confirmButton: '결제 확인' },
  };
  return (
    <Modal
      fullScreen={isMobile}
      centered
      radius="xl"
      size="30%"
      withCloseButton={!sticky}
      closeOnClickOutside={!sticky}
      closeOnEscape={!sticky}
      styles={
        isMobile
          ? undefined
          : { modal: { width: 'max-content', maxWidth: '27rem' } }
      }
      {...modalProps}>
      <Stack
        align="center"
        justify="center"
        mih="34rem"
        miw={isMobile ? undefined : '24rem'}
        w="90%"
        ta="center"
        mx="auto"
        px={isMobile ? undefined : '1.5rem'}>
        {icon}
        <Heading1 ta="center">{heading}</Heading1>
        <Subheading1 ta="center">{subheading}</Subheading1>
        {bodyContent && bodyContent}
        {checkmarkText && (
          <Stack p="1rem">
            {typeof checkmarkText !== 'string' && (
              <Heading4>{label[lang].confirmButton}</Heading4>
            )}
            <Checkbox
              required
              color={color === 'purple' ? 'violet' : color}
              radius="xl"
              checked={checkmarked}
              onChange={(e) => setCheckmarked(e.target.checked)}
              label={<BodyText>{checkmarkText}</BodyText>}
            />
          </Stack>
        )}
        {onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={(checkmarkText && !checkmarked) || buttonDisabled}
            color={color}
            style={{ width: '100%', margin: '1rem' }}>
            {buttonText}
          </Button>
        )}
      </Stack>
    </Modal>
  );
};

export { MessageModal };
