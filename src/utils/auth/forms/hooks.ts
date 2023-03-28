import { useForm } from '@mantine/form';
import { isPossiblePhoneNumber, Value } from 'react-phone-number-input';
import {
  ChangePassword,
  SignUp1_Credentials,
  SignUp2_Credentials,
} from '../dataTypes';
import { signUp1_initialValues, signUp2_initialValues } from './formData';

// Sign Up
const useSignUp = () => {
  const signUp1_hook = useForm<SignUp1_Credentials>({
    initialValues: signUp1_initialValues,
    validate: {
      //TODO: Check that user does not already exist
      username: (value) => (value.length > 0 ? null : 'Required'),
      phone_number: (value: Value | undefined) =>
        value && isPossiblePhoneNumber(value)
          ? null
          : 'Invalid telephone number',
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const signUp2_hook = useForm<SignUp2_Credentials>({
    initialValues: signUp2_initialValues,
    validate: {
      password: (value) =>
        value.length >= 8 &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          value
        )
          ? null
          : value.length < 8
          ? 'Must be at least 8 characters'
          : 'Must contain uppercase, lowercase, number and special case characters',
      confirm_password: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
    },
  });
  return { signUp1_hook, signUp2_hook };
};

const useChangePassword = () => {
  const changePasswordHook = useForm<ChangePassword>({
    initialValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
    validate: {
      old_password: (value) =>
        value.length >= 8 &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          value
        )
          ? null
          : value.length < 8
          ? 'Must be at least 8 characters'
          : 'Must contain uppercase, lowercase, number and special case characters',
      new_password: (value) =>
        value.length >= 8 &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          value
        )
          ? null
          : value.length < 8
          ? 'Must be at least 8 characters'
          : 'Must contain uppercase, lowercase, number and special case characters',
      confirm_password: (value, values) =>
        value === values.new_password ? null : 'Passwords did not match',
    },
  });
  return changePasswordHook;
};

export { useSignUp, useChangePassword };
