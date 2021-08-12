import React, { useState, useEffect } from 'react';
import { useAuthentication } from '../../contexts/AuthenticationContext';
import { getContestStandingsInfo } from '../../functions/HttpRequest';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import { ProblemInfo, ContestStandingsInfo } from '../../types';
import { ContestStandingsTable } from './ContestStandingsTable';
import { ContestStandingsTableForRaid } from './ContestStandingsTableForRaid';
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

  const getStandings = async () => {
    const standingsInfo = await getContestStandingsInfo(
      null,
      findContestIdFromPath()
    );
    setStandings(standingsInfo);
  };

  useEffect(() => {
    getStandings();
  }, [standingsVersion]);

  const accountRank = standings?.requestAccountRank;

  return (
    <>
      <p>{accountRank ? `順位: ${accountRank}` : ''}</p>
      {contestType === 'RAID'
        ? standings && (
            <ContestStandingsTableForRaid
              problems={problems}
              standings={standings}
            />
          )
        : standings && (
            <ContestStandingsTable
              myAccountName={accountName}
              problems={problems}
              standings={standings}
              getStandings={getStandings}
            />
          )}
    </>
  );
};
