import {
  ChangeEventHandler,
  FormEventHandler,
  FC,
  useCallback,
  useMemo,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useHistory } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { isValidAccountNameOrPassWord } from '../functions/AccountInfoSubmitValidation';

const TEXT_TERM =
  'アルファベット、数字、-_から成る、4字以上20字以下の文字列を入力して下さい。';

interface Props {
  variant: 'signIn' | 'signUp';
}

export const SubmitAccountInfo: FC<Props> = ({ variant }) => {
  const { accountName, signIn, signUp } = useAuthentication();
  const [show, setShow] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('');
  const [accountNameInput, setAccountNameInput] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleClose = () => {
    if (accountName) {
      history.push(`account/${accountName}`);
    } else {
      setShow(false);
    }
  };
  const handleShow = () => setShow(true);

  const onChangeAccountName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setAccountNameInput(event.target.value);
    },
    []
  );

  const onChangePassword = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setPassword(event.target.value);
    },
    []
  );

  const canSubmit = useMemo(
    () =>
      isValidAccountNameOrPassWord(accountNameInput) &&
      isValidAccountNameOrPassWord(password),
    [accountNameInput, password]
  );

  const onSubmit = useCallback<FormEventHandler<HTMLElement>>(
    async (event) => {
      event.preventDefault();

      if (!canSubmit) return;

      switch (variant) {
        case 'signIn':
          try {
            await signIn(accountNameInput, password);
            setAlertText('ログインに成功しました');
            setAccountNameInput(accountNameInput);
            handleShow();
          } catch (e) {
            console.error(e);
            if (e.message === '403') {
              setAlertText(
                  '複数回のパスワード間違いによりアカウントが一時的にロックされています ' +
                  'しばらくお待ちいただくか、Twitterから @shitforces までDMでご連絡下さい'
              );
            } else {
              setAlertText(
                  'ログインに失敗しました。メールアドレスかパスワードが間違っています'
              );
            }
            handleShow();
          }
          break;
        case 'signUp':
          try {
            await signUp(accountNameInput, password);
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
    [variant, signIn, signUp, canSubmit, accountNameInput, password]
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
          <Form.Control
            value={accountNameInput}
            onChange={onChangeAccountName}
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
          送信
        </Button>
      </Form>
    </div>
  );
};
