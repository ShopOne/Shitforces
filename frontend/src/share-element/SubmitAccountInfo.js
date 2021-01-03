import React from "react";
import PropTypes from 'prop-types';
import {Button, Form} from "react-bootstrap";
import isValidAccountNameOrPassWord from "../share-func/AccountInfoSubmitValidation";
import {postAccountInformation} from "../share-func/HttpRequest";
const TEXT_TERM = "アルファベット、数字、-_から成る、4字以上20字以下の文字列を入力して下さい。";

export default class SubmitAccountInfo extends React.Component {
  constructor(props) {
    super(props);
    this.submitMethod = this.submitMethod.bind(this);
    this.accountNameInput = React.createRef();
    this.passwordInput = React.createRef();
  }
  submitMethod() {
    const accountName = this.accountNameInput.current.value;
    const password = this.passwordInput.current.value;
    if (!(isValidAccountNameOrPassWord(accountName) && isValidAccountNameOrPassWord(password))) {
      alert("不正な入力です");
    } else {
      postAccountInformation(this.props.fetchTo, accountName, password)
        .then(() => {
          alert(this.props.successText);
          window.location.href = "/account/" + accountName;
        })
        .catch(() => {
          alert(this.props.failedText);
        });
    }
  }
  render() {
    return(
      <div>
        <p>{TEXT_TERM}</p>
        <Form>
          <Form.Group controlId={"formEmail"}>
            <Form.Label>ユーザーID</Form.Label>
            <Form.Control type={"email"} ref={this.accountNameInput}/>
          </Form.Group>
          <Form.Group controlId={"formPassword"}>
            <Form.Label>パスワード</Form.Label>
            <Form.Control type={"password"} ref={this.passwordInput}/>
          </Form.Group>
        </Form>
        <Button variant={"primary"} onClick={this.submitMethod}>
          送信
        </Button>
      </div>
    );
  }
}
SubmitAccountInfo.propTypes = {
  fetchTo: PropTypes.string,
  successText: PropTypes.string,
  failedText: PropTypes.string
};
