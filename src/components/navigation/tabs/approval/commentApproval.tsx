import { useEffect, useState } from 'react';
import { Flex, Loader } from '@mantine/core';

import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Comment, Report } from 'src/utils/types';
import Table, { CommentRow } from '@components/table';
import { useLanguage } from 'src/utils/lang/languageContext';

const CommentApproval = (props: { report?: boolean }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAuth();
  const { lang } = useLanguage();
  const colSpans = [2, 4, 8, 3];

  const text = {
    en: {
      type: 'Comment',
      reason: 'Reason',
      headers: ['Date', 'User', 'Comment', 'Status'],
    },
    ko: {
      type: '댓글 남기기',
      reason: '이유',
      headers: ['날짜', '사용자', '댓글 남기기', '댓글 승인 현황'],
    },
  };

  if (props.report) {
    text[lang].headers.splice(3, 0, text[lang].reason);
    colSpans.splice(3, 0, 2);
  }

  useEffect(() => {
    setLoading(true);
    if (!userInfo) return;
    (props.report
      ? api.comment.get('/getAllReported')
      : api.comment.get(`/getAllByCompanyId/${userInfo.companyId}`)
    ).then(({ message }) => {
      const comments = props.report
        ? message.comment.flatMap((comment: Comment & { report: Report[] }) =>
            comment.report.map((report) => ({ ...comment, report: [report] }))
          )
        : message.comment;
      setComments(comments.reverse());
      setLoading(false);
    });
  }, [userInfo]);

  if (loading)
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <Loader color="violet" />
      </Flex>
    );

  return (
    <Table<Comment>
      rowComponent={CommentRow}
      headers={text[lang].headers}
      contentType={text[lang].type}
      content={comments}
      keyExtractor={
        (item) => (props.report && item.report ? item.report[0]._id : item._id) //report_id as key for comment reports
      }
      colSpans={colSpans}
      breakpoint={1000}
    />
  );
};

export default CommentApproval;
