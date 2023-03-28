import { Stack, Flex, CopyButton, UnstyledButton } from '@mantine/core';
import { HTMLAttributes } from 'react';
import { IconType } from 'react-icons';
import { TbChevronRight, TbCopy } from 'react-icons/tb';
import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { Subheading1, Subheading3 } from '../typography';
import styles from './styles.module.scss';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  address?: string;
  campaignId?: string;
  icon: IconType;
  title?: string;
}

const data: Record<Language, Record<string, string | string[]>> = {
  en: { walletID: 'Wallet ID', campaignID: 'Campaign ID' },
  ko: { walletID: '지갑 ID', campaignID: '캠페인 ID' },
};

const WalletCard = (props: IProps) => {
  const { lang } = useLanguage();
  const { address, campaignId, icon: Icon, title, ...divProps } = props;
  return (
    <div
      {...divProps}
      className={[
        styles.wallet,
        divProps.onClick ? styles.clickable : '',
        divProps.className ?? '',
      ].join(' ')}>
      <Stack style={{ overflow: 'hidden' }}>
        <Flex align="center" gap="sm">
          <Icon color="#6a00ff" size={22} />
          <Subheading1 fw={700}>{title}</Subheading1>
        </Flex>
        {campaignId && (
          <Subheading3 color="#808080" className={styles.id}>
            {data[lang].campaignID}: {campaignId}
          </Subheading3>
        )}
        <Flex gap="xs">
          <Subheading3 className={styles.id}>
            {data[lang].walletID}: {address ?? '...'}
          </Subheading3>
          <CopyButton value={address ?? ''}>
            {({ copied, copy }) => (
              <UnstyledButton
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  copy();
                }}>
                <TbCopy size={24} color={copied ? '#6a00ff' : 'inherit'} />
              </UnstyledButton>
            )}
          </CopyButton>
        </Flex>
      </Stack>
      {divProps.onClick && <TbChevronRight size={30} />}
    </div>
  );
};

export default WalletCard;
