import React, { useCallback, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { isValidAccountNameOrPassWord } from '../functions/AccountInfoSubmitValidation';

const TEXT_TERM =
  'アルファベット、数字、-_から成る、4字以上20字以下の文字列を入力して下さい。';

interface Props {
  variant: 'signIn' | 'signUp';
}

export const SubmitAccountInfo: React.FC<Props> = ({ variant }) => {
  const { signIn, signUp } = useAuthentication();

  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');

  const onChangeAccountName = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setAccountName(event.target.value);
  }, []);

  const onChangePassword = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setPassword(event.target.value);
  }, []);

  const canSubmit = useMemo(
    () =>
      isValidAccountNameOrPassWord(accountName) &&
      isValidAccountNameOrPassWord(password),
    [accountName, password]
  );

  const onSubmit = useCallback<React.FormEventHandler<HTMLElement>>(
    (event) => {
      console.log('submit', event);
      event.preventDefault();

      if (!canSubmit) return;

      switch (variant) {
        case 'signIn':
          try {
            signIn(accountName, password);
            alert('ログインに成功しました');
          } catch (e) {
            console.error(e);
            alert(
              'ログインに失敗しました。メールアドレスかパスワードが間違っています'
            );
          }
          break;
        case 'signUp':
          try {
            signUp(accountName, password);
            alert('アカウントの作成に成功しました');
          } catch (e) {
            console.error(e);
            alert('アカウントの作成に失敗しました');
          }
          break;
      }
    },
    [variant, signIn, signUp, canSubmit, accountName, password]
  );

  return (
    <div>
      <p>{TEXT_TERM}</p>
      <Form onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>ユーザーID</Form.Label>
          <Form.Control value={accountName} onChange={onChangeAccountName} />
        </Form.Group>
        <Form.Group>
          <Form.Label>パスワード</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={onChangePassword}
          />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          送信
        </Button>
      </Form>
    </div>
  );
};
