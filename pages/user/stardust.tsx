import { Flex, Loader, Stack } from '@mantine/core';
import styles from 'styles/user/wallet.module.scss';
import { Heading1, Subheading1, BodyText } from '@components/typography';
import Table, { TransactionRow } from '@components/table';
import api from 'src/utils/api';
import { Transaction } from 'src/utils/types';
import { TbStar } from 'react-icons/tb';
import { useAuth } from 'src/utils/auth/authContext';
import { useEffect, useState } from 'react';
import { useLanguage } from 'src/utils/lang/languageContext';
import WalletCard from '@components/walletCard';

const StardustWallet = () => {
  const { userInfo } = useAuth();
  const [balance, setBalance] = useState<number>();
  const [transactions, setTransactions] = useState<Transaction[]>();
  const { lang } = useLanguage();

  const text = {
    en: {
      title: 'Stardust',
      sdWallet: '$SD ID',
      balance: 'Balance',
      tableTitle: 'Transaction History',
      headers: ['Date', 'Amount', 'Action'],
      transaction: 'Transaction',
    },
    ko: {
      title: '스타더스트',
      sdWallet: '스타더스트 지갑',
      balance: '잔액',
      tableTitle: '거래 내역',
      headers: ['날짜', '금액', '유형'],
      transaction: '거래',
    },
  };

  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const balanceRes = await fetch(
        `/api/balance/sd/${userInfo.walletAddress}`
      );
      const { balance }: { balance: number } = await balanceRes.json();

      const {
        message: transactions,
      }: { message: { SDTxns: Transaction[]; WMTxns: Transaction[] } } =
        await api.user.get(`/transactionByUsername/all/${userInfo.username}`);

      const formattedTxs = transactions.SDTxns.map((tx) => ({
        ...tx,
        amount:
          tx.senderAddress === userInfo.walletAddress ? -tx.amount : tx.amount,
      }));
      setBalance(balance);
      setTransactions(formattedTxs.reverse());
    };
    getData();
  }, [userInfo]);

  if (!userInfo) return <></>;
  return (
    <div>
      <Heading1>{text[lang].title}</Heading1>
      <Flex gap="md" py="3rem" className={styles.topContainer}>
        <WalletCard
          address={userInfo.walletAddress}
          icon={TbStar}
          title={text[lang].sdWallet}
        />
        <div className={styles.wallet}>
          <Stack pr="3rem" spacing={10}>
            <Subheading1 fw={700}>{text[lang].balance}</Subheading1>
            <BodyText fw={700} color="#6a00ff">
              $SD{' '}
              {balance?.toFixed(2) ?? (
                <Loader variant="dots" size="xs" color="gray" />
              )}
            </BodyText>
          </Stack>
        </div>
      </Flex>
      {transactions ? (
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
      ) : (
        <Flex justify="center" my={100}>
          <Loader color="violet" />
        </Flex>
      )}
    </div>
  );
};

export default StardustWallet;
