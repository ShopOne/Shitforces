import { VFC, useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import { PagingElement } from '../components/PagingElement';
import { getAccountRankingInfo } from '../functions/HttpRequest';
import { getRatingColor } from '../functions/getRatingColor';
import { AccountInfo } from '../types';

const ACCOUNT_RANKING_ONE_PAGE = 20;
interface AccountRankingTableProps {
  accounts: AccountInfo[];
  rankStart: number;
}
export const AccountRankingTable: VFC<AccountRankingTableProps> = ({
  accounts,
  rankStart,
}) => {
  const tableBody = (() => {
    const cols = accounts.map((account, idx) => {
      const ratingColor = getRatingColor(account.rating);

      return (
        <tr key={account.name}>
          <td>{idx + rankStart}</td>
          <td>
            <Link to={`account/${account.name}`} style={{ color: ratingColor }}>
              {account.name}
            </Link>
          </td>
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

const RankingPage: VFC = () => {
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
      <PagingElement
        currentPage={nowPage}
        onChange={getRanking}
        savePaging={true}
        totalPages={pageNum}
      />
    </>
  );
};

export default RankingPage;
