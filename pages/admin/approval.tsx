import { NextPage } from 'next';

import { Heading1 } from '@components/typography';
import {
  CommentApproval,
  ProposalApproval,
} from '@components/navigation/tabs/approval';
import Tabs, { Tab } from '@components/navigation/tabs';
import { useLanguage } from 'src/utils/lang/languageContext';

const Approval: NextPage = () => {
  const { lang } = useLanguage();
  const koreanLabel = [
    '펜 제안 요청',
    '스폰서 요청',
    '댓글 요청',
    '신고된 댓글',
  ];
  const label = { en: { title: 'Approvals' }, ko: { title: '승인요청' } };
  const tabContent = {
    Proposals: <ProposalApproval modalType="Proposal" />,
    Sponsor: <ProposalApproval modalType="Sponsor" />,
    Comments: <CommentApproval />,
    Reports: <CommentApproval report />,
  };

  return (
    <>
      <Heading1>{label[lang]['title']}</Heading1>
      <Tabs>
        {Object.keys(tabContent).map((value, index) => (
          <Tab
            key={value}
            value={value}
            title={lang === 'en' ? value : koreanLabel[index]}
            component={tabContent[value as keyof typeof tabContent]}
          />
        ))}
      </Tabs>
    </>
  );
};

export default Approval;
