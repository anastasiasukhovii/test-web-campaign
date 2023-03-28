import { NextPage } from 'next';
import { TbHeartHandshake, TbStar, TbWallet } from 'react-icons/tb';

import Table, { TransactionRow } from '@components/table';
import { Flex, Stack } from '@mantine/core';
import styles from 'styles/admin/financial.module.scss';
import { useState, useEffect } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Company, Transaction } from 'src/utils/types';
import StatCard from '@components/statCard';
import WalletCard from '@components/walletCard';
import { useLanguage } from 'src/utils/lang/languageContext';
import { CompanyData } from '.';

const fetchCompanyWalletDetails = async (companyId: string) => {
  const { message: companyInfo } = await api.company.get(`/${companyId}`);
  const balanceRes = await fetch(
    `/api/balance/sd/${companyInfo.walletAddress}`
  );
  const { balance } = await balanceRes.json();
  return { balance, companyInfo };
};

const text = {
  en: {
    SDTotal: '$SD total assets',
    WMCollected: '$WM collected',
    SDSpending: '$SD total spendings',
    tableTitle: 'Transaction History',
    transaction: 'Transaction',
    headers: ['Date', 'Amount', 'Action'],
  },
  ko: {
    SDTotal: '전체 스타더스트 자산',
    WMCollected: '모은 위매이크',
    SDSpending: '총 스타더스트 지출',
    tableTitle: '거래 내역',
    transaction: '거래',
    headers: ['날짜', '금액', '유형'],
  },
};

const Financial: NextPage = () => {
  const { userInfo } = useAuth();
  const { lang } = useLanguage();
  const [balance, setBalance] = useState(0);
  const [companyInfo, setCompanyInfo] = useState<Company>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData>();

  useEffect(() => {
    if (!userInfo) return;
    type ResType = { asSender: Transaction[]; asReceiver: Transaction[] };
    api.company
      .get(`/transactionsByCompanyId/${userInfo.companyId}`)
      .then(({ message: txs }: { message: ResType }) =>
        setTransactions(
          [
            ...txs.asSender.map((tx) => ({ ...tx, amount: -tx.amount })),
            ...txs.asReceiver,
          ].sort((a, b) => b.timestamp - a.timestamp)
        )
      );
    fetchCompanyWalletDetails(userInfo.companyId!).then((res) => {
      setCompanyInfo(res.companyInfo);
      setBalance(res.balance);
    });

    const getCompanyData = async () => {
      //Company statistics
      const companyVoteSD = await api.company.get(
        `/voteAmount/${userInfo.companyId}`
      );
      const {
        voteCount: totalVotes,
        SDCollected,
        WMBalance: WMCollected,
        totalSDSpent,
      } = companyVoteSD.message;
      setCompanyData({ totalVotes, SDCollected, WMCollected, totalSDSpent });
    };
    getCompanyData();
  }, [userInfo]);

  return (
    <Stack spacing="xl">
      <Flex gap="lg" className={styles.topContainer}>
        <WalletCard
          address={companyInfo?.walletAddress}
          icon={TbWallet}
          title={companyInfo?.companyName}
        />
        <Flex gap="lg" className={styles.outline2}>
          <StatCard
            icon={<TbStar color="#6a00ff" size={24} />}
            data={balance}
            description={text[lang].SDTotal}
          />
          <StatCard
            icon={<TbHeartHandshake color="#6a00ff" size={24} />}
            data={companyData?.WMCollected}
            description={text[lang].WMCollected}
          />
          <StatCard
            icon={<TbStar color="#6a00ff" size={24} />}
            data={companyData?.totalSDSpent}
            description={text[lang].SDSpending}
          />
        </Flex>
      </Flex>
      <Table<Transaction>
        title={text[lang].tableTitle}
        headers={text[lang].headers}
        contentType={text[lang].transaction}
        rowComponent={TransactionRow}
        content={transactions}
        keyExtractor={(item) => item.txnId}
        breakpoint={576}
        colSpans={[1, 1, 1]}
      />
    </Stack>
  );
};

export default Financial;
