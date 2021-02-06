import React from 'react';
import { SubmitAccountInfo } from './share-element/SubmitAccountInfo';

// URL: /sighup
export const SignUpPage: React.FC = () => {
  return (
    <div>
      <SubmitAccountInfo
        fetchTo="/api/signup"
        successText="アカウントの作成に成功しました"
        failedText="アカウントの作成に失敗しました"
      />
    </div>
  );
};
