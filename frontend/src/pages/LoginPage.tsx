import { VFC } from 'react';
import { SubmitAccountInfo } from '../components/SubmitAccountInfo';

// URL: /login

const LoginPage: VFC = () => {
  return <SubmitAccountInfo variant="signIn" />;
};

export default LoginPage;
