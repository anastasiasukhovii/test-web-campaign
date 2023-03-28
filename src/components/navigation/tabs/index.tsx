import { Select, Tabs as TabsMantine, TabsProps } from '@mantine/core';
import { Subheading1 } from '@components/typography';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface IProps extends TabsProps {
  children: ReturnType<typeof Tab>[];
}

export const Tab = (props: {
  value: string;
  component: JSX.Element;
  title?: string;
}) => (
  <TabsMantine.Panel value={props.value}>{props.component}</TabsMantine.Panel>
);

const Tabs = ({ children, ...tabsProps }: IProps) => {
  const router = useRouter();
  const [screen, setScreen] = useState<string>();
  useEffect(() => {
    if (!router.isReady) return;
    const activeTab = router.query.tab
      ? router.query.tab
      : children[0].props.value;
    setScreen(activeTab);
  }, [router.isReady]);

  if (!screen) return null;
  return (
    <TabsMantine
      value={screen}
      onTabChange={(tab) => setScreen(tab ?? screen)}
      color="gray"
      {...tabsProps}
      className={[styles.tabsElement, tabsProps.className].join(' ')}>
      <div className={styles.tabContainer}>
        <TabsMantine.List grow mt="xl">
          {children.map((node) => (
            <TabsMantine.Tab value={node.props.value} key={node.props.value}>
              <Subheading1>{node.props.title ?? node.props.value}</Subheading1>
            </TabsMantine.Tab>
          ))}
        </TabsMantine.List>
      </div>
      <Select
        className={styles.select}
        data={children.map((node) => node.props.value)}
        value={screen}
        onChange={(tab) => setScreen(tab ?? screen)}
      />
      {children.map((node) => (
        <TabsMantine.Panel value={node.props.value} key={node.props.value}>
          {node.props.component}
        </TabsMantine.Panel>
      ))}
    </TabsMantine>
  );
};

export default Tabs;
