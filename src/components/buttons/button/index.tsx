import React, { ButtonHTMLAttributes } from 'react';

import {
  Heading4,
  Subheading1,
  Subheading2,
  Subheading3,
} from '@components/typography';
import styles from './styles.module.scss';

interface IProps {
  type?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'purple' | 'black' | 'red' | 'green';
}

const Button = (
  props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IProps> & IProps
) => {
  const HTMLButtonProps: Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof IProps
  > = { ...props };
  props = {
    ...props,
    size: props.size ?? 'md',
    type: props.type ?? 'primary',
    color: props.color ?? 'purple',
  };
  const typography = {
    sm: Subheading3,
    md: Subheading2,
    lg: Subheading1,
    xl: Heading4,
  };
  const Typography = typography[props.size!];
  return (
    <button
      {...HTMLButtonProps}
      className={[
        styles[props.size!],
        styles[props.disabled ? 'disabled' : `${props.type!}-${props.color!}`],
        props.className,
      ].join(' ')}>
      <Typography color="inherit">{props.children}</Typography>
    </button>
  );
};

export default Button;
