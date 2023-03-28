import Button from '@components/buttons/button';
import { Heading1 } from '@components/typography';
import {
  LiveCampaigns,
  ScheduledCampaigns,
  DraftCampaigns,
  EndedCampaigns,
} from '@components/navigation/tabs/campaign';
import React, { useEffect, useState } from 'react';
import { Stack } from '@mantine/core';
import { useRouter } from 'next/router';
import Tabs, { Tab } from '@components/navigation/tabs';
import { useLanguage } from 'src/utils/lang/languageContext';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';

const text = {
  en: { title: 'Your Campaigns', createButton: 'Create Campaign' },
  ko: { title: '내 캠페인', createButton: '캠페인 만들기' },
};

const koreanLabel = ['라이브', '예정', '초안', '종료'];

const tabContent = {
  Live: LiveCampaigns,
  Scheduled: ScheduledCampaigns,
  Drafts: DraftCampaigns,
  Ended: EndedCampaigns,
};

const Campaigns = () => {
  const { lang } = useLanguage();
  const { userInfo } = useAuth();
  const router = useRouter();
  const bookmarksDispatch = useState<string[]>([]);

  useEffect(() => {
    if (!userInfo) return;
    api.user
      .get(`/bookmark/${userInfo.email}`)
      .then(({ message }) =>
        bookmarksDispatch[1]([
          ...(message.bookmark?.proposalBookmarks ?? []),
          ...(message.bookmark?.proposalBookmarks ?? []),
        ])
      );
  }, [userInfo]);

  return (
    <>
      <Stack spacing="lg" pt="2rem">
        <Heading1>{text[lang].title}</Heading1>
        <Button
          type="primary"
          size="lg"
          style={{ width: 'min(30rem, 100%)' }}
          onClick={() => router.replace('/admin/campaigns/create')}>
          {text[lang].createButton}
        </Button>
      </Stack>
      <Tabs>
        {Object.keys(tabContent).map((value, index) => {
          const Page = tabContent[value as keyof typeof tabContent];
          return (
            <Tab
              title={lang === 'en' ? value : koreanLabel[index]}
              value={value}
              key={value}
              component={<Page {...{ bookmarksDispatch }} />}
            />
          );
        })}
      </Tabs>
    </>
  );
};

export default Campaigns;
