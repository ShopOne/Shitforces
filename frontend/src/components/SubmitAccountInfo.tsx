import React, { useCallback, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { isValidAccountNameOrPassWord } from '../functions/AccountInfoSubmitValidation';

const TEXT_TERM =
  'アルファベット、数字、-_から成る、4字以上20字以下の文字列を入力して下さい。';

interface Props {
  variant: 'signIn' | 'signUp';
}

export const SubmitAccountInfo: React.FC<Props> = ({ variant }) => {
  const { signIn, signUp } = useAuthentication();
  const [show, setShow] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuthentication();
  const history = useHistory();

  const handleClose = () => {
    const name = auth.accountName;
    if (name) {
      history.push(`account/${name}`);
    } else {
      setShow(false);
    }
  };
  const handleShow = () => setShow(true);

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
    async (event) => {
      event.preventDefault();

      if (!canSubmit) return;

      switch (variant) {
        case 'signIn':
          try {
            await signIn(accountName, password);
            setAlertText('ログインに成功しました');
            setAccountName(accountName);
            handleShow();
          } catch (e) {
            console.error(e);
            setAlertText(
              'ログインに失敗しました。メールアドレスかパスワードが間違っています'
            );
            handleShow();
          }
          break;
        case 'signUp':
          try {
            await signUp(accountName, password);
            setAlertText('アカウントの作成に成功しました');
            handleShow();
          } catch (e) {
            console.error(e);
            setAlertText('アカウントの作成に失敗しました');
            handleShow();
          }
          break;
      }
    },
    [variant, signIn, signUp, canSubmit, accountName, password]
  );

  return (
    <div>
      <p>{TEXT_TERM}</p>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>ログイン情報</Modal.Title>
        </Modal.Header>
        <Modal.Body>{alertText}</Modal.Body>
        <Modal.Footer>
          <Button variant={'primary'} onClick={handleClose}>
            閉じる
          </Button>
        </Modal.Footer>
      </Modal>
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
