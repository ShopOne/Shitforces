import { VFC, useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { TwitterShareButton, TwitterIcon } from 'react-share';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getAccountContestPartHistory } from '../../functions/HttpRequest';
import { AccountContestPartHistory } from '../../types';

interface AccountRatingChangeHistoryProps {
  name: string;
}
export const AccountRatingChangeHistory: VFC<AccountRatingChangeHistoryProps> = ({
  name,
}) => {
  const [histories, setHistories] = useState<AccountContestPartHistory[]>([]);
  const { accountName } = useAuthentication();
  const getHistory: () => Promise<AccountContestPartHistory[]> = async () => {
    const rawHistories = await getAccountContestPartHistory(name);

    return rawHistories.sort(
      (a: AccountContestPartHistory, b: AccountContestPartHistory) => {
        return b.indexOfParticipation - a.indexOfParticipation;
      }
    );
  };

  useEffect(() => {
    const asyncFunction = async () => {
      const data = await getHistory();
      setHistories(data);
    };
    asyncFunction();
  }, [window.location.href]);
  const historyTableBody = () => {
    return histories.map((history: AccountContestPartHistory) => {
      const diff = history.newRating - history.prevRating;
      const getSignedNumber = (number: number): string => {
        switch (true) {
          case diff > 0:
            return `+${number}`;
          case diff === 0:
            return `±${number}`;
          default:
            return `${number}`;
        }
      };
      const signedNumber = getSignedNumber(diff);
      const resultText =
        `${name}さんの${history.contestName}の結果\n` +
        `パフォーマンス: ${history.performance}\n` +
        `レーティング: ${history.prevRating} → ${history.newRating}(${signedNumber})`;

      return (
        <tr
          style={{ textAlign: 'center', fontSize: '1.25rem' }}
          key={history.indexOfParticipation}
        >
          <td>{history.rank}</td>
          <td>{history.contestName}</td>
          <td>{history.performance}</td>
          <td>{history.newRating}</td>
          <td>{signedNumber}</td>
          {name === accountName && (
            <td>
              <TwitterShareButton
                url={window.location.href}
                title={resultText}
                hashtags={['Shitforces', 'くそなぞなぞ']}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            </td>
          )}
        </tr>
      );
    });
  };

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
        <tbody>{historyTableBody()}</tbody>
      </Table>
      <p>
        HackerRankからShitforcesへレートの引き継ぎをした場合、初回の差分は正しく表示されません。ご了承下さい。
      </p>
    </div>
  );
};
