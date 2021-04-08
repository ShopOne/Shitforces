import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import { PagingElement } from '../components/PagingElement';
import { getAccountRankingInfo } from '../functions/HttpRequest';
import { AccountInfo } from '../types';

const ACCOUNT_RANKING_ONE_PAGE = 20;
interface AccountRankingTableProps {
  accounts: AccountInfo[];
  rankStart: number;
}
export const AccountRankingTable: React.FC<AccountRankingTableProps> = ({
  accounts,
  rankStart,
}) => {
  const tableBody = (() => {
    const cols = accounts.map((account, idx) => {
      let ratingColor;
      if (account.rating === 0) {
        ratingColor = 'black';
      } else if (account.rating < 400) {
        ratingColor = 'gray';
      } else if (account.rating < 800) {
        ratingColor = 'brown';
      } else if (account.rating < 1200) {
        ratingColor = 'green';
      } else if (account.rating < 1600) {
        // cyan
        ratingColor = '#00C0C0';
      } else if (account.rating < 2000) {
        ratingColor = 'blue';
      } else if (account.rating < 2400) {
        // yellow
        ratingColor = '#C0C000';
      } else if (account.rating < 2800) {
        ratingColor = 'orange';
      } else {
        ratingColor = 'red';
      }
      return (
        <tr key={account.name}>
          <td>{idx + rankStart}</td>
          <Link to={`account/${account.name}`}>
            <td style={{ color: ratingColor }}>{account.name}</td>
          </Link>
          <td>{account.partNum}</td>
          <td>{account.rating}</td>
        </tr>
      );
    });
    return <tbody>{cols}</tbody>;
  })();
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>順位</th>
          <th>アカウント名</th>
          <th>参加回数</th>
          <th>レーティング</th>
        </tr>
      </thead>
      {tableBody}
    </Table>
  );
};
export const RankingPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [nowPage, setNowPage] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const getRanking = (page: number) => {
    getAccountRankingInfo(page)
      .then((res) => {
        setPageNum(Math.ceil(res.validAccountNum / ACCOUNT_RANKING_ONE_PAGE));
        setNowPage(page);
        setAccounts(res.accounts);
      })
      .catch((e) => {
        console.error(e);
      });
  };
  useEffect(() => {
    getRanking(0);
  }, []);
  return (
    <>
      <AccountRankingTable
        accounts={accounts}
        rankStart={nowPage * ACCOUNT_RANKING_ONE_PAGE + 1}
      />
      <PagingElement pageChanged={getRanking} pageNum={pageNum} />
    </>
  );
};
