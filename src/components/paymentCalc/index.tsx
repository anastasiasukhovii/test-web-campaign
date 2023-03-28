import { Flex, Stack } from '@mantine/core';
import { CSSProperties } from 'react';
import { BodyText } from '@components/typography';
import styles from './styles.module.scss';
import { Language, useLanguage } from 'src/utils/lang/languageContext';
import { Currency } from 'src/utils/types';

type PaymentCalcProps = {
  balance?: number;
  cost: number;
  currency: Currency;
};

interface PaymentDataI {
  value: string;
  fw?: CSSProperties['fontWeight'];
  color?: CSSProperties['color'];
}

const PaymentCalculation = ({ balance, cost, currency }: PaymentCalcProps) => {
  const { lang } = useLanguage();
  const labels: Record<Language, string[]> = {
    en: [
      `${currency} Balance`,
      `${currency === 'Stardust' ? 'Payment' : 'Donation'} amount`,
      `Balance after ${currency === 'Stardust' ? 'payment' : 'donation'}`,
    ],
    ko: [`${currency} 균형`, '비용', '나머지'],
  };
  const values: PaymentDataI[] = [
    { value: `${balance!} $${currency === 'Stardust' ? 'SD' : 'WM'}` },
    { value: `${cost} $${currency === 'Stardust' ? 'SD' : 'WM'}`, fw: 700 },
    {
      value: `${balance! - cost} $${currency === 'Stardust' ? 'SD' : 'WM'}`,
      color: balance! < cost ? 'red' : undefined,
    },
  ];
  const isResult = values.length - 1;
  return (
    <>
      <Stack spacing="sm" className={styles.calcContainer}>
        {values.map((data, index) => (
          <Flex
            key={index}
            justify="space-between"
            className={index === isResult ? styles.resultRow : undefined}>
            <BodyText>{labels[lang][index]}</BodyText>
            <BodyText fw={data.fw} color={data.color}>
              {data.value}
            </BodyText>
          </Flex>
        ))}
      </Stack>
      {balance! < cost && (
        <Flex align="center" p="sm">
          <BodyText color="red">Insufficient {currency} Balance</BodyText>
        </Flex>
      )}
    </>
  );
};
export default PaymentCalculation;
