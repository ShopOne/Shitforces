import {
  VFC,
  useState,
  useCallback,
  ChangeEventHandler,
  useMemo,
  FormEventHandler,
} from 'react';
import { Form, Button } from 'react-bootstrap';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { isValidAccountNameOrPassWord } from '../../functions/AccountInfoSubmitValidation';

export const AccountNameChangeForm: VFC = () => {
  const { accountName, changeAccountName } = useAuthentication();
  const [newAccountName, setNewAccountName] = useState('');
  const [password, setPassword] = useState('');
  const onChangeNewAccountName = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setNewAccountName(event.target.value);
  }, []);
  const onChangePassword = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setPassword(event.target.value);
    },
    []
  );
  const canSubmit = useMemo(
    () =>
      accountName !== newAccountName &&
      isValidAccountNameOrPassWord(newAccountName) &&
      isValidAccountNameOrPassWord(password),
    [accountName, newAccountName, password]
  );
  const onSubmit = useCallback<FormEventHandler<HTMLElement>>(
    (event) => {
      event.preventDefault();
      if (!accountName || !canSubmit) return;
      changeAccountName(accountName, newAccountName, password)
        .then(() => {
          alert('アカウント名の変更が完了しました');
        })
        .catch((e) => {
          console.error(e);
          alert(
            'アカウント名の変更に失敗しました。名前が重複しているかパスワードが間違っています。'
          );
        });
    },
    [accountName, changeAccountName, canSubmit, newAccountName, password]
  );

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        <Form.Label>新しいアカウント名</Form.Label>
        <Form.Control
          value={newAccountName}
          onChange={onChangeNewAccountName}
        />
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
        アカウント名変更
      </Button>
    </Form>
  );
};
