import { VFC } from 'react';
import { Button } from 'react-bootstrap';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getRatingColor } from '../../functions/getRatingColor';

interface AccountInformationBodyProps {
  name: string;
  rating: number;
}

export const AccountInformationBody: VFC<AccountInformationBodyProps> = ({
  name,
  rating,
}) => {
  const { accountName, signOut } = useAuthentication();
  const ratingColor = getRatingColor(rating);

  return (
    <div>
      <p>アカウント名: {name}</p>
      <p>
        レート: <span style={{ color: ratingColor }}>{rating}</span>
      </p>
      {accountName !== null && (
        <Button variant="primary" onClick={signOut}>
          ログアウト
        </Button>
      )}
    </div>
  );
};
