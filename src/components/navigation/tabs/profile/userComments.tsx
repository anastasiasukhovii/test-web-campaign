import Table, { CommentRow } from '@components/table';
import { Flex, Loader } from '@mantine/core';
import { useEffect, useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { useLanguage } from 'src/utils/lang/languageContext';
import { Comment } from 'src/utils/types';
import { EmptyState } from './tabEmptyState';

const text = {
  en: {
    type: 'Comment',
    headers: ['Date', 'Comment', 'Status'],
    emptyStateTitle: 'No comments yet.',
    emptyStateText: 'Engage with the community by commenting on proposals',
  },
  ko: {
    type: '댓글 남기기',
    headers: ['날짜', '댓글 남기기', '댓글 승인 현황'],
    emptyStateTitle: '댓글이 없습니다.',
    emptyStateText: '팬 제안에 댓글을 남겨보세요.',
  },
};

export const UserComments = () => {
  const { userInfo } = useAuth();
  const [userComments, setUserComments] = useState<Comment[]>();
  const { lang } = useLanguage();

  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const commentRes: { message: { comment: Comment[] } } =
        await api.comment.get(`/getByUsername/${userInfo.username}`);

      setUserComments(
        //@ts-ignore | remove after approval[] is changed to approval
        commentRes.message.comment
          .map((comment) => ({
            ...comment,
            user: [],
            approval: [comment.approval],
          }))
          .reverse()
      );
    };
    getData();
  }, [userInfo]);

  if (!userComments)
    return (
      <Flex justify="center">
        <Loader color="violet" />
      </Flex>
    );
  return userComments.length > 0 ? (
    <Table<Comment>
      headers={text[lang].headers}
      rowComponent={CommentRow}
      contentType={text[lang].type}
      content={userComments}
      keyExtractor={(item) => item._id}
      breakpoint={1000}
      colSpans={[2, 8, 3]}
    />
  ) : (
    <EmptyState
      title={text[lang].emptyStateTitle}
      text={text[lang].emptyStateText}
    />
  );
};
