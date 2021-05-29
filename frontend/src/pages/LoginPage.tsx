import { VFC } from 'react';
import { SubmitAccountInfo } from '../components/SubmitAccountInfo';

// URL: /login

const LoginPage: VFC = () => {
  return <SubmitAccountInfo variant="signIn" />;
};

// eslint-disable-next-line import/no-default-export
export default LoginPage;
