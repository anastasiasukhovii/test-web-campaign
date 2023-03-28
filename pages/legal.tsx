import { BodyText, Heading2, Heading3 } from '@components/typography';
import { Accordion, Stack } from '@mantine/core';
import React from 'react';
import { legalTerms } from 'src/data/legalTerms';
import styles from 'styles/terms.module.scss';

const Legal = () => {
  return (
    <Stack spacing={'md'} className={styles.container}>
      <Heading2>Legal</Heading2>
      {legalTerms['INTRODUCTION']}
      <Heading3 style={{ margin: '1rem 0 ' }}>Terms and Conditions</Heading3>
      <Accordion defaultValue="">
        {Object.entries(legalTerms).map(([title, text], index) => {
          if (index == 0) return;
          return (
            <Accordion.Item value={title} key={title}>
              <Accordion.Control>{title}</Accordion.Control>
              <Accordion.Panel style={{ whiteSpace: 'pre-line' }}>
                {text}
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Stack>
  );
};

export default Legal;
