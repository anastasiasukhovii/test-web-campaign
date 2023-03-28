import { ReactNode } from 'react';
import { Container } from '@mantine/core';
import styles from './authLayout.module.scss';

const AuthLayout = (props: { children: ReactNode }) => {
  return (
    <div className={styles.authPageWrapper}>
      <div className={styles.authPage}>
        <img src="/authPageLogo.svg" className={styles.logo} />
        <Container size={450} px={0}>
          {props.children}
        </Container>
      </div>
    </div>
  );
};

export default AuthLayout;
