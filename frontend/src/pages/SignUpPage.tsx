import { VFC } from 'react';
import { SubmitAccountInfo } from '../components/SubmitAccountInfo';

// URL: /sighup
const SignUpPage: VFC = () => {
  return <SubmitAccountInfo variant="signUp" />;
};

// eslint-disable-next-line import/no-default-export
export default SignUpPage;
