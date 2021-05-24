import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { ContestStandingsTable } from '../../components/ContestStandingsTable';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getContestStandingsInfo } from '../../functions/HttpRequest';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import { ProblemInfo, ContestStandingsInfo } from '../../types';
interface Props {
  problems: ProblemInfo[];
  standingsVersion: number;
}

export const ContestStandingsElement: React.FC<Props> = ({
  problems,
  standingsVersion,
}) => {
  const { accountName } = useAuthentication();
  const [standings, setStandings] = useState<ContestStandingsInfo | null>(null);
  const [nowStandingsVersion, setNowStandingsVersion] = useState(0);

  const getStandings = () => {
    getContestStandingsInfo(null, findContestIdFromPath()).then((standingsInfo) => {
      setStandings(standingsInfo);
    });
  };

  if (nowStandingsVersion !== standingsVersion) {
    setNowStandingsVersion(standingsVersion);
    getStandings();
  }

  useEffect(() => {
    getStandings();
  }, []);

  let myRank = '';
  if (standings?.requestAccountRank) {
    myRank = `順位: ${standings.requestAccountRank}`;
  }

  return (
    <>
      <p>{myRank}</p>
      {standings && (
        <ContestStandingsTable
          myAccountName={accountName}
          problems={problems}
          standings={standings}
        />
      )}
      <Button onClick={getStandings} variant="secondary">
        更新
      </Button>
    </>
  );
};
