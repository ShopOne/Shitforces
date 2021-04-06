import React, { useMemo } from 'react';
import { Alert, Table } from 'react-bootstrap';
import { toProblemLabel } from '../functions/toProblemLabel';
import { ProblemInfo, RankingInfo, RankingInfoAccount } from '../types';

function formatSecondToMMSS(ms: number): string {
  const mm = Math.floor(ms / 60);
  const ss = ('00' + Math.floor(ms % 60)).slice(-2);
  return `${mm}:${ss}`;
}

interface RankingTableRowProps {
  account: RankingInfoAccount;
  isMe: boolean;
  problems: ProblemInfo[];
}

export const RankingTableRow: React.FC<RankingTableRowProps> = ({
  account,
  isMe,
  problems,
}) => {
  const probElement = [];
  for (let i = 0; i < problems.length; i++) {
    if (account.acceptList.some((ac: any) => ac === i)) {
      probElement.push(
        <td>
          <p className={'contestPage-ranking-submitResult'}>AC</p>
          <p className={'contestPage-ranking-submitTime'}>
            {formatSecondToMMSS(account.acceptTimeList[i])}
          </p>
        </td>
      );
    } else {
      probElement.push(<td> </td>);
    }
  }

  return (
    <tr className={isMe ? 'table-info' : undefined}>
      <td className="align-middle text-center">{account.ranking}</td>
      <td className="align-middle font-weight-bold">{account.accountName}</td>
      <td className="align-middle text-center">
        <div className="font-weight-bold text-primary">{account.score}</div>
        <div className="text-muted">{account.penalty}</div>
      </td>
      {problems.map((problems) => {
        const i = account.acceptList.findIndex(
          (v) => v === problems.indexOfContest
        );
        if (i === -1) {
          return (
            <td key={problems.id} className="align-middle text-center">
              -
            </td>
          );
        }
        return (
          <td key={problems.id} className="align-middle text-center">
            <div className="font-weight-bold text-success">
              {problems.point}
            </div>
            <div className="text-muted">
              {formatSecondToMMSS(
                account.acceptTimeList[problems.indexOfContest]
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
};

interface Props {
  myAccountName: string | null;
  problems: ProblemInfo[];
  ranking: RankingInfo;
}

export const RankingTable: React.FC<Props> = ({
  myAccountName,
  problems,
  ranking,
}) => {
  if (problems.length !== ranking.acPerSubmit.length) {
    return <Alert variant="danger">Error</Alert>;
  }

  const sortedProblems = useMemo(
    () => problems.sort((a, b) => a.indexOfContest - b.indexOfContest),
    [problems]
  );

  const acPerSubmitRow = useMemo(
    () => (
      <tr className="small text-center text-nowrap">
        <th colSpan={3} className="align-middle font-weight-normal">
          <span className="font-weight-bold text-success">正解者数</span> /
          提出者数
        </th>
        {ranking.acPerSubmit.map(({ first, second }, i) => (
          <th key={i} className="align-middle font-weight-normal">
            <span className="font-weight-bold text-success">{first}</span> /{' '}
            {second}
          </th>
        ))}
      </tr>
    ),
    [ranking.acPerSubmit]
  );

  return (
    <Table size="sm" striped bordered hover responsive>
      <thead>
        <tr className="text-center text-nowrap">
          <th style={{ minWidth: '3em' }}>順位</th>
          <th style={{ minWidth: '10em' }}>ユーザ</th>
          <th style={{ minWidth: '4em' }}>得点</th>
          {sortedProblems.map((problem) => (
            <th key={problem.id} style={{ minWidth: '4em' }}>
              {toProblemLabel(problem.indexOfContest)}
            </th>
          ))}
        </tr>
        {acPerSubmitRow}
      </thead>
      <tbody>
        {ranking.rankingList.map((account, i) => (
          <RankingTableRow
            key={i}
            account={account}
            problems={sortedProblems}
            isMe={account.accountName === myAccountName}
          />
        ))}
      </tbody>
      <tfoot>{acPerSubmitRow}</tfoot>
    </Table>
  );
};
