import React, { useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  postAccountInformation,
  putAccountName,
} from '../functions/HttpRequest';
import { getCookie } from '../functions/getCookie';

interface AuthenticationContextValue {
  accountName: string | null;
  changeAccountName(
    accountName: string,
    newAccountName: string,
    password: string
  ): Promise<void>;
  signIn(accountName: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  signUp(accountName: string, password: string): Promise<void>;
}

const AuthenticationContext = React.createContext<AuthenticationContextValue>({
  accountName: null,
  changeAccountName: async () => undefined,
  signIn: async () => undefined,
  signOut: async () => undefined,
  signUp: async () => undefined,
});

export function useAuthentication(): AuthenticationContextValue {
  return useContext(AuthenticationContext);
}

export const AuthenticationProvider: React.FC = ({ children }) => {
  const history = useHistory();

  const [accountName, setAccountName] = useState<string | null>(
    () => getCookie()['_sforce_account_name'] ?? null
  );

  const signUp = useCallback(
    async (accountName: string, password: string) => {
      await postAccountInformation('/api/signup', accountName, password);
      setAccountName(getCookie()['_sforce_account_name'] ?? null);
      history.push(`/account/${accountName}`);
    },
    [history]
  );

  const signIn = useCallback(
    async (accountName: string, password: string) => {
      await postAccountInformation('/api/login', accountName, password);
      setAccountName(getCookie()['_sforce_account_name'] ?? null);
      history.push(`/account/${accountName}`);
    },
    [history]
  );

  const signOut = useCallback(async () => {
    document.cookie = '_sforce_account_name=; max-age=0; path=/';
    setAccountName(null);
    history.push('/');
  }, [history]);

  const changeAccountName = useCallback(
    async (accountName: string, newAccountName: string, password: string) => {
      await putAccountName(accountName, newAccountName, password);
      setAccountName(getCookie()['_sforce_account_name'] ?? null);
    },
    [history]
  );

  return (
    <AuthenticationContext.Provider
      value={{
        accountName,
        changeAccountName,
        signIn,
        signOut,
        signUp,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
