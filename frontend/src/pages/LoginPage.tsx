import React from 'react';
import { SubmitAccountInfo } from '../components/SubmitAccountInfo';

// URL: /login

export const LoginPage: React.FC = () => {
  return <SubmitAccountInfo variant="signIn" />;
};
