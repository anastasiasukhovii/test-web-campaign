import React, { CSSProperties, HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface TypographyProps extends HTMLAttributes<HTMLDivElement> {
  fw?: CSSProperties['fontWeight'];
  ta?: CSSProperties['textAlign'];
}

export const Heading1 = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
    }}
    className={`${styles.heading1} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);

export const Heading2 = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
    }}
    className={`${styles.heading2} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);

export const Heading3 = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
    }}
    className={`${styles.heading3} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);

export const Heading4 = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
    }}
    className={`${styles.heading4} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);

export const Subheading1 = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
      
    }}
    className={`${styles.subheading1} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);

export const Subheading2 = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
    }}
    className={`${styles.subheading2} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);

export const Subheading3 = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
    }}
    className={`${styles.subheading3} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);

export const BodyText = ({ fw, ta, ...htmlProps }: TypographyProps) => (
  <div
    {...htmlProps}
    style={{
      whiteSpace: 'pre-line',
      ...htmlProps.style,
      color: htmlProps.color,
      textAlign: ta ?? htmlProps.style?.textAlign,
      fontWeight: fw ?? htmlProps.style?.fontWeight,
    }}
    className={`${styles.body} ${htmlProps.className}`}>
    {htmlProps.children}
  </div>
);
