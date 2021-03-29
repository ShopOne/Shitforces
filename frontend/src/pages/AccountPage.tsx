import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { isValidAccountNameOrPassWord } from '../functions/AccountInfoSubmitValidation';
import {
  getAccountInformation,
  putAccountName,
} from '../functions/HttpRequest';

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

interface AccountNameChangeFormProps {
  name: string;
}

const AccountNameChangeForm: React.FC<AccountNameChangeFormProps> = (props) => {
  const accountNameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const changeAccountName = () => {
    const newName = accountNameInput.current?.value;
    const password = passwordInput.current?.value;
    if (
      newName === undefined ||
      !isValidAccountNameOrPassWord(newName) ||
      password === undefined ||
      !isValidAccountNameOrPassWord(password)
    ) {
      alert('不正な入力です');
      return;
    }
    putAccountName(props.name, newName, password)
      .then(() => {
        alert('アカウント名の変更が完了しました');
        window.location.href = `/account/${newName}`;
      })
      .catch(() => {
        alert(
          'アカウント名の変更に失敗しました。名前が重複しているかパスワードが間違っています。'
        );
      });
  };
  return (
    <Form>
      <Form.Group controlId="passwordInput" />
      <Form.Label>新しいアカウント名</Form.Label>
      <Form.Control ref={accountNameInput} />
      <Form.Group controlId="passwordInput" />
      <Form.Label>パスワード</Form.Label>
      <Form.Control type="password" ref={passwordInput} />
      <Button variant="primary" onClick={changeAccountName}>
        アカウント名変更
      </Button>
    </Form>
  );
};

AccountNameChangeForm.propTypes = {
  name: PropTypes.string.isRequired,
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
        <AccountNameChangeForm name={props.name} />
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
