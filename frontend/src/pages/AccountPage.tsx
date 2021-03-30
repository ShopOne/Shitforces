import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { isValidAccountNameOrPassWord } from '../functions/AccountInfoSubmitValidation';
import { getAccountInformation } from '../functions/HttpRequest';

// URL: /account/$accountName

interface AccountInformationBodyProps {
  name: string;
  rating: number;
}

const AccountInformationBody: React.FC<AccountInformationBodyProps> = (
  props
) => {
  const { accountName, signOut } = useAuthentication();

  return (
    <div>
      <p>アカウント名: {props.name}</p>
      <p>レート: {props.rating}</p>
      {accountName !== null && (
        <Button variant="primary" onClick={signOut}>
          ログアウト
        </Button>
      )}
    </div>
  );
};

AccountInformationBody.propTypes = {
  name: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
};

const AccountNameChangeForm: React.FC = () => {
  const { accountName, changeAccountName } = useAuthentication();

  const [newAccountName, setNewAccountName] = useState('');
  const [password, setPassword] = useState('');

  const onChangeNewAccountName = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setNewAccountName(event.target.value);
  }, []);

  const onChangePassword = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setPassword(event.target.value);
  }, []);

  const canSubmit = useMemo(
    () =>
      accountName !== newAccountName &&
      isValidAccountNameOrPassWord(newAccountName) &&
      isValidAccountNameOrPassWord(password),
    [accountName, newAccountName, password]
  );

  const onSubmit = useCallback<React.FormEventHandler<HTMLElement>>(
    (event) => {
      event.preventDefault();

      if (!accountName || !canSubmit) return;

      try {
        changeAccountName(accountName, newAccountName, password);
        alert('アカウント名の変更が完了しました');
      } catch (e) {
        console.error(e);
        alert(
          'アカウント名の変更に失敗しました。名前が重複しているかパスワードが間違っています。'
        );
      }
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

interface AccountInfoTabsProps {
  name: string;
  rating: number;
}
const AccountInfoTabs: React.FC<AccountInfoTabsProps> = (props) => {
  const [key, setKey] = useState<string | null>('profile');
  return (
    <Tabs id="account-info-tab" activeKey={key} onSelect={(k) => setKey(k)}>
      <Tab eventKey="profile" title="プロフィール">
        <AccountInformationBody name={props.name} rating={props.rating} />
      </Tab>
      <Tab eventKey="changeName" title="アカウント名の変更">
        <AccountNameChangeForm />
      </Tab>
    </Tabs>
  );
};
AccountInfoTabs.propTypes = {
  name: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
};

const AccountNotFound: React.FC = () => {
  return (
    <div>
      <p>アカウントが見つかりませんでした</p>
    </div>
  );
};

export const AccountPage: React.FC = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const getAccount = useCallback(() => {
    const splitUrl = window.location.href.split('/');
    const accountName = splitUrl[splitUrl.length - 1];
    getAccountInformation(accountName)
      .then((account) => {
        setName(account.name);
        setRating(account.rating);
      })
      .catch(() => {
        setName('');
        setRating(null);
      });
  }, []);

  useEffect(() => {
    getAccount();
  }, []);

  let page;

  if (name !== '' && rating !== null) {
    page = <AccountInfoTabs name={name} rating={rating} />;
  } else {
    page = <AccountNotFound />;
  }
  return <div>{page}</div>;
};
