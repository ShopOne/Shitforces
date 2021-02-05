import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import getCookieArray from './share-func/GetCookieArray';
import { getAccountInformation } from './share-func/HttpRequest';

// URL: /account/$accountName

function AccountInformationBody(props) {
  const logOutAccount = () => {
    document.cookie = `_sforce_account_name=; max-age=0; path=/`;
    window.location.href = '/';
  };
  const getLogOutButtonIfMyAccount = () => {
    const cookieArray = getCookieArray();
    if (cookieArray['_sforce_account_name'] === props.name) {
      return (
        <Button variant={'primary'} onClick={logOutAccount}>
          ログアウト
        </Button>
      );
    }
  };
  return (
    <div>
      <p>アカウント名: {props.name}</p>
      <p>レート: {props.rating}</p>
      {getLogOutButtonIfMyAccount()}
    </div>
  );
}
function AccountNotFound() {
  return (
    <div>
      <p>アカウントが見つかりませんでした</p>
    </div>
  );
}
AccountInformationBody.propTypes = {
  rating: PropTypes.number,
  name: PropTypes.string,
};

export default class AccountPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      rating: '',
    };
  }
  componentDidMount() {
    this.getAccount();
  }

  getAccount() {
    const splitUrl = window.location.href.split('/');
    const accountName = splitUrl[splitUrl.length - 1];
    getAccountInformation(accountName)
      .then((account) => {
        this.setState({
          name: account.name,
          rating: account.rating,
        });
      })
      .catch(() => {
        this.setState({
          name: '',
          rating: '',
        });
      });
  }
  render() {
    let page;
    if (this.state.name !== '' && this.state.rating !== '') {
      page = (
        <AccountInformationBody
          name={this.state.name}
          rating={this.state.rating}
        />
      );
    } else {
      page = <AccountNotFound />;
    }
    return <div>{page}</div>;
  }
}
