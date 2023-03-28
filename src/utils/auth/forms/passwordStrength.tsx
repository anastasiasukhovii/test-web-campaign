import { Subheading3 } from '@components/typography';
import { Input, PasswordInput } from '@mantine/core';
import { useLanguage } from 'src/utils/lang/languageContext';

interface IProps {
  value: string;
  onChange: (value: string) => void;
}
interface Req {
  re: RegExp;
  label: string[];
}

const requirements: Req[] = [
  { re: /[0-9]/, label: ['1 number', '1 숫자'] },
  { re: /[a-z]/, label: ['1 lowercase letter', '1 소문자'] },
  { re: /[A-Z]/, label: ['1 uppercase letter', '1 대문자'] },
  {
    re: /[$&+,:;=?@#|'<>.^*()%!-]/,
    label: ['1 special character', '1 특수 문자'],
  },
];
const PasswordRequirement = ({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) => {
  return (
    <Subheading3 color={meets ? '#6a00ff' : '#808080'}>{label}</Subheading3>
  );
};

const PasswordStrength = ({ value, onChange }: IProps) => {
  const { lang } = useLanguage();
  const regExpChecks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={lang === 'en' ? requirement.label[0] : requirement.label[1]}
      meets={requirement.re.test(value)}
    />
  ));

  return (
    <div>
      <PasswordInput
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        size="lg"
        radius={10}
        placeholder={
          lang === 'en' ? 'Enter password here' : '비밀번호를 입력하세요'
        }
      />
      <Input.Description
        mt={10}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem 1.625rem',
          maxWidth: '26rem',
        }}>
        <PasswordRequirement
          label={lang === 'en' ? '8 characters minimum' : '8 최소 문자'}
          meets={value.length > 7}
        />
        {regExpChecks}
      </Input.Description>
    </div>
  );
};

export default PasswordStrength;
