import { BodyText } from '@components/typography';
import { Stack } from '@mantine/core';
import { useLanguage } from 'src/utils/lang/languageContext';

export const NoCampaignsYet = () => {
  const { lang } = useLanguage();
  const text = { en: 'No Campaigns to display', ko: '아직 캠페인이 없습니다' };
  return (
    <Stack align="center" justify="center" h="40vh" w="30%" m="auto">
      <img src="/proposalEmpty.png" />
      <BodyText color="#5C5C5C" ta="center">
        {text[lang]}
      </BodyText>
    </Stack>
  );
};
