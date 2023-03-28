import { ActionIcon, Flex, Stack, TextInput } from '@mantine/core';
import router from 'next/router';
import React, { useState } from 'react';
import {
  TbBrandFacebook,
  TbBrandTwitter,
  TbBrandWhatsapp,
  TbMail,
  TbShare,
} from 'react-icons/tb';
import { useLanguage } from 'src/utils/lang/languageContext';
import { MessageModal } from './messageModal';
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share';

type shareModal = {
  onClose: () => void;
  opened: boolean;
  link?: string;
};

export const ShareModal = (props: shareModal) => {
  const modalLabels = {
    en: { shareText: 'Share', shared: 'Link Copied', copyLink: 'Copy Link' },
    ko: {
      shareText: '공유하기',
      shared: '링크 복사됬습니다',
      copyLink: '링크 복사하기',
    },
  };
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const { link, ...modalProps } = props;
  const shareLink = `${window.location.origin}${link ?? router.asPath}`;

  return (
    <MessageModal
      {...modalProps}
      onClose={() => {
        setCopied(false);
        props.onClose();
      }}
      color="purple"
      heading={copied ? modalLabels[lang].shared : modalLabels[lang].shareText}
      buttonText={modalLabels[lang].copyLink}
      onSubmit={() => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
      }}
      bodyContent={
        <Stack align={'center'}>
          <Flex gap={'xl'}>
            <FacebookShareButton url={shareLink}>
              <ActionIcon radius="xl" variant="outline">
                <TbBrandFacebook />
              </ActionIcon>
            </FacebookShareButton>
            <TwitterShareButton url={shareLink}>
              <ActionIcon radius="xl" variant="outline">
                <TbBrandTwitter />
              </ActionIcon>
            </TwitterShareButton>
            <WhatsappShareButton url={shareLink}>
              <ActionIcon radius="xl" variant="outline">
                <TbBrandWhatsapp />
              </ActionIcon>
            </WhatsappShareButton>
            <EmailShareButton url={shareLink}>
              <ActionIcon radius="xl" variant="outline">
                <TbMail />
              </ActionIcon>
            </EmailShareButton>
          </Flex>
          <TextInput
            contentEditable={false}
            value={shareLink}
            variant="filled"
            style={{ width: '300px' }}
          />
        </Stack>
      }
      icon={<TbShare color="#6a00ff" size={36} />}
      sticky={false}
    />
  );
};
