import { useEffect, useState, VFC } from 'react';
import { getAccountInformation } from '../../functions/HttpRequest';
import { AccountInfoTabs } from '../AccountInfoTabs';
import { AccountNotFound } from './AccountNotFound';

// URL: /account/$accountName

const AccountPage: VFC = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [auth, setAuth] = useState<string | null>(null);
  const getAccountName = () => {
    const splitUrl = window.location.href.split('/');

    return splitUrl[splitUrl.length - 1];
  };
  const getAccount = async () => {
    try {
      setName('');
      setRating(null);
      setAuth(null);
      const { name, rating, auth } = await getAccountInformation(
        getAccountName()
      );
      setName(name);
      setRating(rating);
      setAuth(auth);
    } catch (error) {
      setName('');
      setRating(null);
    }
  };

  useEffect(() => {
    getAccount();
  }, [window.location.href]);

  return (
    <div>
      {name !== '' && rating !== null && auth ? (
        <AccountInfoTabs name={name} rating={rating} auth={auth} />
      ) : (
        <AccountNotFound />
      )}
    </div>
  );
};

export default AccountPage;
