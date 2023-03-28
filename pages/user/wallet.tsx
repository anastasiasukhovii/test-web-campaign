import { Flex, Loader, Stack } from '@mantine/core';
import styles from 'styles/user/wallet.module.scss';
import { Heading1, Subheading1, Subheading2 } from '@components/typography';
import Table, { TransactionRow } from '@components/table';
import { TbArrowBigUpLine, TbWallet } from 'react-icons/tb';
import React, { useEffect, useState } from 'react';
import { Transaction } from 'src/utils/types';
import { useLanguage } from 'src/utils/lang/languageContext';
import { useAuth } from 'src/utils/auth/authContext';
import api from 'src/utils/api';
import WalletCard from '@components/walletCard';
import Button from '@components/buttons/button';

const text = {
  en: {
    title: 'Wallet',
    wmWallet: '$WEMAKE ID',
    balance: 'Balance',
    tableTitle: 'Transaction History',
    type: 'Transaction',
    headers: ['Date', '$WEMAKE', 'Action'],
    topUpBtn: 'Top Up',
  },
  ko: {
    title: '지갑',
    wmWallet: '$WEMAKE ID',
    balance: '잔액',
    tableTitle: '거래 내역',
    type: '거래',
    headers: ['날짜', '$WEMAKE', '유형'],
    topUpBtn: '충전하기',
  },
};

const Wallet = () => {
  const [balance, setBalance] = useState<number>();
  const [transactions, setTransactions] = useState<Transaction[]>();
  const { userInfo } = useAuth();
  const { lang } = useLanguage();

  useEffect(() => {
    if (!userInfo) return;
    const getData = async () => {
      const balanceRes = await fetch(
        `/api/balance/wm/${userInfo.walletAddress}`
      );
      const { balance }: { balance: number } = await balanceRes.json();

      const {
        message: transactions,
      }: { message: { SDTxns: Transaction[]; WMTxns: Transaction[] } } =
        await api.user.get(`/transactionByUsername/all/${userInfo.username}`);

      const formattedTxs = transactions.WMTxns.map((tx) => ({
        ...tx,
        amount:
          tx.senderAddress === userInfo.walletAddress ? -tx.amount : tx.amount,
      }));
      setBalance(balance);
      setTransactions(formattedTxs.reverse());
    };
    getData();
  }, [userInfo]);

  return (
    <div>
      <Heading1>{text[lang].title}</Heading1>
      <Flex py="3rem" wrap="wrap" gap="xl" className={styles.topContainer}>
        <WalletCard
          address={userInfo?.walletAddress}
          icon={TbWallet}
          title={text[lang].wmWallet}
        />
        <div className={styles.wallet}>
          <Stack pr="3rem" w="100%">
            <Subheading1 fw={700}>{text[lang].balance}</Subheading1>
            <Flex gap="xl" justify="space-between">
              <Stack className={styles.numberDisplay}>
                <Heading1 style={{ fontSize: 'inherit' }} color="#6a00ff">
                  {balance ? '-' : '-'}
                </Heading1>
                <Subheading2 color="inherit" fw="inherit">
                  $USD
                </Subheading2>
              </Stack>
              <Stack className={styles.numberDisplay}>
                <Heading1 style={{ fontSize: 'inherit' }} color="#6a00ff">
                  {balance ? balance : <Loader variant="dots" color="gray" />}
                </Heading1>
                <Subheading2 color="inherit" fw="inherit">
                  $WEMAKE
                </Subheading2>
              </Stack>
            </Flex>
          </Stack>
        </div>
        <Button style={{ flex: 1, minWidth: 'fit-content' }} disabled>
          <TbArrowBigUpLine /> {text[lang].topUpBtn}
        </Button>
      </Flex>

      {transactions ? (
        <Table<Transaction>
          title={text[lang].tableTitle}
          contentType={text[lang].type}
          headers={text[lang].headers}
          content={transactions}
          rowComponent={TransactionRow}
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

export default Wallet;
