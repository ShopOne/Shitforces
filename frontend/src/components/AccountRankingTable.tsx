import { VFC } from 'react';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import { getRatingColor } from '../functions/getRatingColor';
import { AccountInfo } from '../types';

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
