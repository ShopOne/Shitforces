import { VFC, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { ADMINISTRATOR } from '../constants';
import { getCookie } from '../functions/getCookie';
import { AccountInformationBody } from './AccountPage/AccountInformationBody';
import { AccountRatingChangeHistory } from './AccountPage/AccountRatingChangeHistory';
import { CreateContestElement } from './AccountPage/CreateContestElement';
import { AccountNameChangeForm } from './AccountPage/NameChangeForm';

export interface AccountInfoTabsProps {
  name: string;
  rating: number;
  auth: string;
}
export const AccountInfoTabs: VFC<AccountInfoTabsProps> = ({
  name,
  rating,
  auth,
}) => {
  const [selectedTab, setSelectedTab] = useState<string | null>('profile');
  const cookie = getCookie();
  const isMe = cookie['_sforce_account_name'] === name;

  return (
    <Tabs
      id={'account-info-tab'}
      activeKey={selectedTab}
      onSelect={(k) => setSelectedTab(k)}
      className="mb-4"
    >
      <Tab eventKey={'profile'} key={'profile'} title={'プロフィール'}>
        <AccountInformationBody name={name} rating={rating} />
      </Tab>
      <Tab eventKey={'history'} key={'history'} title={'参加履歴'}>
        <AccountRatingChangeHistory name={name} />
      </Tab>
      {isMe && (
        <Tab eventKey="changeName" key="changeName" title="アカウント名の変更">
          <AccountNameChangeForm />
        </Tab>
      )}
      {auth === ADMINISTRATOR && (
        <Tab
          eventKey="createContest"
          key="createContest"
          title="コンテスト作成"
        >
          <CreateContestElement />
        </Tab>
      )}
    </Tabs>
  );
};
