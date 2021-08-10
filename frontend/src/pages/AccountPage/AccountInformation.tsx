import { VFC } from 'react';
import { Button } from 'react-bootstrap';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getRatingColor } from '../../functions/getRatingColor';

interface AccountInformationProps {
  name: string;
  rating: number;
}

export const AccountInformation: VFC<AccountInformationProps> = ({
  name,
  rating,
}) => {
  const { accountName, signOut } = useAuthentication();
  const ratingColor = getRatingColor(rating);

  return (
    <div style={{ fontSize: '1.25rem', width: '95%', margin: '0 auto' }}>
      {/* <p>アカウント名: {name}</p>
      <p>
        レート: <span style={{ color: ratingColor }}>{rating}</span>
      </p> */}
      <table>
        <tbody>
          <tr>
            <th style={{ fontWeight: 600, paddingRight: 20 }}>アカウント名</th>
            <td>{name}</td>
          </tr>
          <tr>
            <th style={{ fontWeight: 600, paddingRight: 20 }}>レート</th>
            <td>
              <span style={{ color: ratingColor }}>{rating}</span>
            </td>
          </tr>
        </tbody>
      </table>
      {accountName !== null && (
        <Button variant="primary mt-5 mb-3" onClick={signOut}>
          ログアウト
        </Button>
      )}
    </div>
  );
};
