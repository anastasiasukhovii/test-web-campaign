import { Language } from 'src/utils/lang/languageContext';

type CommentStatus = 'Approval' | 'Pending' | 'Rejected';
export const statusText: Record<
  CommentStatus,
  [Record<Language, string>, string]
> = {
  Approval: [{ en: 'Approved', ko: '승인됨' }, '#C2DEFF'],
  Pending: [{ en: 'Requested', ko: '요청중' }, '#FFE3BC'],
  Rejected: [{ en: 'Rejected', ko: '거부됨' }, '#FFBFD4'],
};

export const statusTextDot: Record<
  CommentStatus,
  string
> = {
  Approval: '#0F77F0',
  Pending: '#FF9500',
  Rejected: '#FF0055',
};

type ReportedCommentStatus = 'Pending' | 'Deleted' | 'Denied';
export const statusTextReported: Record<
  ReportedCommentStatus,
  [Record<Language, string>, string]
> = {
  Pending: [{ en: 'Comment reported', ko: '신고됨' }, '#FFE3BC'],
  Deleted: [{ en: 'Comment banned', ko: '금지됨' }, '#F7F7F7'],
  Denied: [{ en: 'Report deleted', ko: '삭제됨' }, '#FFBFD4'],
};

export const statusTextReportedDot: Record<
  ReportedCommentStatus,
  string
> = {
  Pending: '#FF9500', 
  Deleted: '#808080',
  Denied: '#FF0055', 
};