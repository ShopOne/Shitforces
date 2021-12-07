import { VFC, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { RatingChart } from '../../components/RatingChart';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getAccountContestPartHistory } from '../../functions/HttpRequest';
import { getRatingColor } from '../../functions/getRatingColor';
import { AccountContestPartHistory } from '../../types';

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
  const [contestResults, setContestResults] = useState<
    AccountContestPartHistory[]
  >([]);

  const getContestResults: () => Promise<
    AccountContestPartHistory[]
  > = async () => {
    const ContestResults = await getAccountContestPartHistory(name);

    return ContestResults.sort(
      (a: AccountContestPartHistory, b: AccountContestPartHistory) => {
        return a.indexOfParticipation - b.indexOfParticipation;
      }
    );
  };

  useEffect(() => {
    getContestResults().then((response) => setContestResults(response));
  }, [window.location.href]);

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
      {contestResults.length != 0 && (
        <RatingChart contestResults={contestResults} />
      )}
      {accountName !== null && (
        <Button variant="primary mt-5 mb-3" onClick={signOut}>
          ログアウト
        </Button>
      )}
    </div>
  );
};
