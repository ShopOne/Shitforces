import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { isValidAccountNameOrPassWord } from '../functions/AccountInfoSubmitValidation';
import { postAccountInformation } from '../functions/HttpRequest';

const TEXT_TERM =
  'アルファベット、数字、-_から成る、4字以上20字以下の文字列を入力して下さい。';

interface SubmitAccountInfoProps {
  failedText: string;
  fetchTo: string;
  successText: string;
}

export const SubmitAccountInfo: React.FC<SubmitAccountInfoProps> = ({
  failedText,
  fetchTo,
  successText,
}) => {
  const accountNameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  const onSubmit = useCallback(() => {
    const accountName = accountNameInput.current?.value;
    const password = passwordInput.current?.value;
    if (
      !(
        accountName &&
        password &&
        isValidAccountNameOrPassWord(accountName) &&
        isValidAccountNameOrPassWord(password)
      )
    ) {
      alert('不正な入力です');
    } else {
      postAccountInformation(fetchTo, accountName, password)
        .then(() => {
          alert(successText);
          window.location.href = '/account/' + accountName;
        })
        .catch(() => {
          alert(failedText);
        });
    }
  }, [failedText, fetchTo, successText]);

  return (
    <div>
      <p>{TEXT_TERM}</p>
      <Form>
        <Form.Group controlId={'formEmail'}>
          <Form.Label>ユーザーID</Form.Label>
          <Form.Control type={'email'} ref={accountNameInput} />
        </Form.Group>
        <Form.Group controlId={'formPassword'}>
          <Form.Label>パスワード</Form.Label>
          <Form.Control type={'password'} ref={passwordInput} />
        </Form.Group>
      </Form>
      <Button variant={'primary'} onClick={onSubmit}>
        送信
      </Button>
    </div>
  );
};

SubmitAccountInfo.propTypes = {
  failedText: PropTypes.string.isRequired,
  fetchTo: PropTypes.string.isRequired,
  successText: PropTypes.string.isRequired,
};
