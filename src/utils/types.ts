interface PCBase {
  _id: string;
  type: 'Proposal' | 'Campaign';
  artistId?: string[];
  author: string;
  brand?: string[];
  comments?: number;
  companyId?: string;
  costPerVote: number;
  details?: string;
  encryptedSeed?: string;
  endTime: EpochTimeStamp;
  likes?: string[];
  rewardPerComment: number;
  shares?: number;
  startTime?: EpochTimeStamp;
  supportingMaterials?: string[];
  target: number;
  title: string;
  titleImage?: string;
  votes?: number;
  walletAddress?: string;
  approvalRate: number;
  approvedSponsors: number;
  countDown: number;
  collectedSD: number;
  collectedWM: number;
}

export interface Approval {
  username: string;
  status: 'Approval' | 'Pending' | 'Rejected';
  type: 'Comment' | 'Proposal';
  typeId: string;
  timestamp: EpochTimeStamp;
}

export interface Company {
  id: string;
  companyName: string;
  email: string;
  username: string;
  walletAddress: string;
  encryptedSeed: string;
  profilePicture: string;
  brand: string[];
}

export interface Artist {
  _id: string;
  brand: string;
  companyId: string;
  name: string;
  profilePic: string;
  company: Company;
}

export interface Bookmark {
  email: string;
  campaignBookmarks: string[];
  proposalBookmarks: string[];
}

export interface Campaign extends PCBase {
  proposalId: string;
  typeId: string;
  twitterLink?: string;
  fbLink?: string;
  igLink?: string;
  status: 'Draft' | 'Launched';
  targetWM: number;
  donateRate?: number;
}

export interface Comment {
  _id: string;
  approvalId: string;
  content: string;
  isReported: boolean;
  parentCommentId?: string;
  rewardId?: string;
  type: 'Campaign' | 'Proposal';
  typeId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  user: User[];
  approval: Approval;
  report?: Report[];
}

export interface Like {
  type: 'Proposal' | 'Campaign';
  typeId: string;
  username: string;
  timestamp: number;
}

export interface Proposal extends PCBase {
  sponsors: string[];
  status: 'Pending' | 'Approval' | 'Rejected' | 'Draft' | 'Launched';
}
export type TxType =
  | 'Comment Reward'
  | 'Vote'
  | 'Create Proposal'
  | 'Refund'
  | 'Donate WM'
  | 'Donate SD';

export interface Transaction {
  amount: number;
  receiverAddress: string;
  senderAddress: string;
  status: 'Success' | 'Failed';
  timestamp: EpochTimeStamp;
  txnId: string;
  type: TxType;
}

export interface User {
  _id: string;
  companyId?: string;
  brand?: string;
  email: string;
  encryptedSeed: string;
  managerRole?: string;
  profilePicture: string;
  role: 'Fan' | 'Staff' | 'Manager';
  username: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalSponsor extends User {
  companyId: string;
  brand: string;
}

export interface Report {
  _id: string;
  reporterEmail: string;
  reportedCommentId: string;
  reason: string;
  details?: string;
  status: 'Pending' | 'Deleted' | 'Denied';
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  _id: string;
  timestamp: EpochTimeStamp;
  txnId: string;
  type: 'Campaign' | 'Proposal';
  typeId: string;
  username: string;
}

export interface Activity {
  _id: string;
  count: number;
}

export type PCType = 'Proposal' | 'Campaign';
export type Currency = 'Stardust' | 'WeMake';
