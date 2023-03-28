import { BodyText, Heading2, Heading3 } from '@components/typography';
import { Accordion, Flex, Stack } from '@mantine/core';
import { SubTitle } from 'chart.js';
import React from 'react';
import { TbMail, TbPhone } from 'react-icons/tb';
import { FAQInfo } from 'src/data/FAQInfo';
import styles from 'styles/terms.module.scss';

const Help = () => {
  return (
    <div className={styles.container}>
      <Heading2 style={{ margin: '1rem 0' }}>Help</Heading2>
      <BodyText>For assistance, please contact us at: </BodyText>
      <Flex gap="sm" align={'center'} my={'sm'}>
        <TbMail size="20" />
        <BodyText>help@updoot.com</BodyText>
      </Flex>
      <Flex gap="sm" align={'center'} my={'sm'}>
        <TbPhone size="20" />
        <BodyText style={{ whiteSpace: 'pre-line' }}>
          {'+852 1234 5678 \n Monday-Friday \n 9:00-17:00'}
        </BodyText>
      </Flex>
      <Heading3>FAQ</Heading3>
      <Accordion defaultValue="" my={'md'}>
        {Object.entries(FAQInfo).map(([title, text]) => (
          <Accordion.Item value={title} key={title}>
            <Accordion.Control>{title}</Accordion.Control>
            <Accordion.Panel style={{ whiteSpace: 'pre-line' }}>
              <BodyText>{text}</BodyText>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default Help;
