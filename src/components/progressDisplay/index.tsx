import React, { useEffect, useState } from 'react';
import { Flex, Progress } from '@mantine/core';

import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { Subheading1, Subheading3 } from '../typography';
import styles from './styles.module.scss';
import { Campaign, Currency } from 'src/utils/types';

interface IProps {
  current: number;
  target: number;
  title: string;
  currency?: Currency;
}

const text: Record<Language, Record<string, string>> = {
  en: {
    weMakeGoal: 'WeMake Goal',
    stardustGoal: 'Stardust Goal',
    progress: 'Progress',
  },
  ko: {
    weMakeGoal: '캠페인 목표금액',
    stardustGoal: '스타더스트 목표금액',
    progress: '달성',
  },
};

const ProgressDisplay = ({ current, target, title, currency }: IProps) => {
  const { lang } = useLanguage();
  return (
    <>
      <Flex justify="space-between" align="center">
        <Subheading1 fw={700}>{title}</Subheading1>
        <div className={styles.goalLabel}>
          <Subheading3 color={'#6a00ff'}>
            ${currency && currency === 'WeMake' ? 'WM' : 'SD'} {target}
          </Subheading3>
        </div>
      </Flex>

      <Flex justify="space-between" align="center" mb="0.5rem">
        <Subheading3 color="#808080">
          {text[lang].progress}:{' '}
          {((current / (target === 0 ? 1 : target)) * 1e2).toFixed(2)}%
        </Subheading3>
        <Subheading3 color="#808080">{`${current}/${target}`}</Subheading3>
      </Flex>
      <Progress
        color="#6a00ff"
        value={current / target}
        styles={{ root: { backgroundColor: '#808080' } }}
      />
    </>
  );
};

const ProgressCard = (props: { campaign: Campaign }) => {
  const { lang } = useLanguage();

  return (
    <div className={styles.progressCard}>
      <ProgressDisplay
        current={props.campaign.collectedSD}
        target={props.campaign.target}
        title={text[lang].stardustGoal}
        currency="Stardust"
      />
      <hr className={styles.progressLineBreak} />
      <ProgressDisplay
        current={props.campaign.collectedWM}
        target={props.campaign.targetWM}
        title={text[lang].weMakeGoal}
        currency="WeMake"
      />
    </div>
  );
};

export default ProgressCard;
