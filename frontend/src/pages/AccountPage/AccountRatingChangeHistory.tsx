import { VFC, useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { TwitterShareButton, TwitterIcon } from 'react-share';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getAccountContestPartHistory } from '../../functions/HttpRequest';
import { getRatingColor } from '../../functions/getRatingColor';
import { AccountContestPartHistory } from '../../types';

interface AccountRatingChangeHistoryProps {
  name: string;
}
// eslint-disable-next-line max-lines-per-function
export const AccountRatingChangeHistory: VFC<AccountRatingChangeHistoryProps> = ({
  name,
}) => {
  const [contestResults, setContestResults] = useState<
    AccountContestPartHistory[]
  >([]);
  const { accountName } = useAuthentication();
  const isMe = name === accountName;
  const getContestResults: () => Promise<
    AccountContestPartHistory[]
  > = async () => {
    const ContestResults = await getAccountContestPartHistory(name);

    return ContestResults.sort(
      (a: AccountContestPartHistory, b: AccountContestPartHistory) => {
        return b.indexOfParticipation - a.indexOfParticipation;
      }
    );
  };
  type HistoryTableProps = {
    contestResult: AccountContestPartHistory;
  };
  const HistoryTable: VFC<HistoryTableProps> = ({ contestResult }) => {
    const diff = contestResult.newRating - contestResult.prevRating;
    const getSignedNumber = (number: number): string => {
      switch (true) {
        case number > 0:
          return `+${number}`;
        case number === 0:
          return `±${number}`;
        default:
          return `${number}`;
      }
    };
    const signedNumber = getSignedNumber(diff);
    const ratingColor = getRatingColor(contestResult.newRating);
    const resultText =
      `${name}さんの${contestResult.contestName}の結果\n` +
      `パフォーマンス: ${contestResult.performance}\n` +
      `レーティング: ${contestResult.prevRating} → ${contestResult.newRating}(${signedNumber})`;

    return (
      <tr
        style={{ textAlign: 'center', fontSize: '1.125rem' }}
        key={contestResult.indexOfParticipation}
      >
        <td>{contestResult.rank}</td>
        <td>{contestResult.contestName}</td>
        <td>{contestResult.performance}</td>
        <td>
          <span style={{ color: ratingColor }}>{contestResult.newRating}</span>
        </td>
        <td>{signedNumber}</td>
        {isMe && (
          <td>
            <TwitterShareButton
              url={window.location.href}
              title={resultText}
              hashtags={['Shitforces', 'くそなぞなぞ']}
            >
              <TwitterIcon size={28} round />
            </TwitterShareButton>
          </td>
        )}
      </tr>
    );
  };

  useEffect(() => {
    const updateContestResults = async () => {
      const contestResults = await getContestResults();
      setContestResults(contestResults);
    };
    updateContestResults();
  }, [window.location.href]);

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr style={{ textAlign: 'center' }}>
            <th>順位</th>
            <th>コンテスト名</th>
            <th>パフォーマンス</th>
            <th>新レーティング</th>
            <th>差分</th>
          </tr>
        </thead>
        <tbody>
          {contestResults.map((history) => (
            <HistoryTable key={history.contestName} contestResult={history} />
          ))}
        </tbody>
      </Table>
      <p style={{ color: '#6B7280', textAlign: 'center', padding: 12 }}>
        HackerRankからShitforcesへレートの引き継ぎをした場合、初回の差分は正しく表示されません。ご了承下さい。
      </p>
    </div>
  );
};
