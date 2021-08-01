import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { ContestStandingsTable } from '../../components/ContestStandingsTable';
import { ContestStandingsTableForRaid } from '../../components/ContestStandingsTableForRaid';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getContestStandingsInfo } from '../../functions/HttpRequest';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import { ProblemInfo, ContestStandingsInfo } from '../../types';
interface Props {
  problems: ProblemInfo[];
  standingsVersion: number;
  contestType: string;
}

export const ContestStandingsElement: React.FC<Props> = ({
  problems,
  standingsVersion,
  contestType,
}) => {
  const { accountName } = useAuthentication();
  const [standings, setStandings] = useState<ContestStandingsInfo | null>(null);
  const [nowStandingsVersion, setNowStandingsVersion] = useState(0);

  const getStandings = () => {
    getContestStandingsInfo(null, findContestIdFromPath()).then(
      (standingsInfo) => {
        setStandings(standingsInfo);
      }
    );
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

  const getStandingsTable = () => {
    if (contestType === 'RAID') {
      return (
        standings && (
          <ContestStandingsTableForRaid
            problems={problems}
            standings={standings}
          />
        )
      );
    } else {
      return (
        standings && (
          <ContestStandingsTable
            myAccountName={accountName}
            problems={problems}
            standings={standings}
          />
        )
      );
    }
  };
  return (
    <>
      <p>{myRank}</p>
      {getStandingsTable()}
      <Button onClick={getStandings} variant="secondary">
        更新
      </Button>
    </>
  );
};
