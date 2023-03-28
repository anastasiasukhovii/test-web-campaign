import styles from './styles.module.scss';
import { Flex, Stack, StackProps } from '@mantine/core';
import { BodyText, Subheading1, Subheading2 } from '@components/typography';
import React, { CSSProperties, Key } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { getFormattedTimestamp } from 'src/utils/dates';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

interface IProps<T> extends StackProps {
  breakpoint: number;
  colSpans: CSSProperties['flex'][];
  content: T[];
  contentType: string;
  headers: string[];
  keyExtractor?: (item: T, index?: number) => Key;
  rowComponent: (props: T) => JSX.Element;
}

type TimeRecord = { timestamp: EpochTimeStamp } | { createdAt: string };
const Table = <T extends TimeRecord>(props: IProps<T>) => {
  const {
    breakpoint,
    colSpans,
    content,
    contentType,
    headers,
    keyExtractor,
    title,
    rowComponent: Row,
    ...stackProps
  } = props;
  const isMobile = useMediaQuery(`(max-width: ${props.breakpoint}px)`);
  const { lang } = useLanguage();
  const emptyStateText = {
    en: `No ${contentType.toLowerCase()}s yet.`,
    ko: `아직 ${contentType.toLowerCase()} 없습니다.`,
  };
  return (
    <React.Fragment key={props.key}>
      <Stack
        {...stackProps}
        className={[props.className, styles.table].join(' ')}>
        {(title || !isMobile) && (
          <Subheading1 className={styles.title}>{title}</Subheading1>
        )}
        <Flex gap="md">
          {!isMobile &&
            headers.map((header, index) => (
              <Subheading2 key={index} style={{ flex: colSpans[index] }}>
                {header}
              </Subheading2>
            ))}
        </Flex>
        {content.length > 0 ? (
          content.map((item, index, arr) => {
            const key = keyExtractor ? keyExtractor(item, index) : index;
            const itemTime =
              'timestamp' in item ? item.timestamp : item.createdAt;
            const prev = arr[index - 1] ?? {};
            const prevTime =
              'timestamp' in prev ? prev.timestamp : prev.createdAt;
            const itemDate = getFormattedTimestamp(itemTime, lang).date;
            const prevDate = getFormattedTimestamp(prevTime, lang).date;
            return (
              <React.Fragment key={key}>
                {isMobile &&
                  (prevTime ? (
                    itemDate !== prevDate && (
                      <Flex w="100%" className={styles.date}>
                        <BodyText fw={700}>{itemDate}</BodyText>
                      </Flex>
                    )
                  ) : (
                    <Flex w="100%" className={styles.date}>
                      <BodyText fw={700}>{itemDate}</BodyText>
                    </Flex>
                  ))}
                {item && <Row {...item} />}
              </React.Fragment>
            );
          })
        ) : (
          <Flex w="100%" justify="center" p="lg">
            <Subheading2 fw={700} ta="center">
              {emptyStateText[lang]}
            </Subheading2>
          </Flex>
        )}
      </Stack>
    </React.Fragment>
  );
};

export * from './rows';
export default Table;
