import { VFC, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { RankingTable } from '../../components/RankingTable';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getRankingInfo } from '../../functions/HttpRequest';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import { ProblemInfo, RankingInfo } from '../../types';
interface Props {
  problems: ProblemInfo[];
  rankingVersion: number;
}

export const RankingElement: VFC<Props> = ({ problems, rankingVersion }) => {
  const { accountName } = useAuthentication();
  const [ranking, setRanking] = useState<RankingInfo | null>(null);
  const [nowRankingVersion, setNowRankingVersion] = useState(0);

  const getRanking = () => {
    getRankingInfo(null, findContestIdFromPath()).then((rankingInfo) => {
      setRanking(rankingInfo);
    });
  };

  if (nowRankingVersion !== rankingVersion) {
    setNowRankingVersion(rankingVersion);
    getRanking();
  }

  useEffect(() => {
    getRanking();
  }, []);

  let myRank = '';
  if (ranking?.requestAccountRank) {
    myRank = `順位: ${ranking.requestAccountRank}`;
  }

  return (
    <>
      <p>{myRank}</p>
      {ranking && (
        <RankingTable
          myAccountName={accountName}
          problems={problems}
          ranking={ranking}
        />
      )}
      <Button onClick={getRanking} variant="secondary">
        更新
      </Button>
    </>
  );
};
