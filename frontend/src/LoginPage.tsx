import React from 'react';
import { SubmitAccountInfo } from './share-element/SubmitAccountInfo';

// URL: /login
export class LoginPage extends React.Component {
  render() {
    return (
      <div>
        <SubmitAccountInfo
          fetchTo={'/api/login'}
          successText={'ログインに成功しました'}
          failedText={
            'ログインに失敗しました。メールアドレスかパスワードが間違っています'
          }
        />
      </div>
    );
  }
}
