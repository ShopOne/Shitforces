import React, { FC, VFC, useMemo } from 'react';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import { createEnglishIndex } from '../../functions/createEnglishIndex';
import {
  ProblemInfo,
  ContestStandingsInfo,
  AccountInfoOnContestStandings,
} from '../../types';

function formatSecondToMMSS(ms: number): string {
  const mm = Math.floor(ms / 60);
  const ss = `00${Math.floor(ms % 60)}`.slice(-2);

  return `${mm}:${ss}`;
}

interface ContestStandingsTableRowProps {
  everyoneAccount: AccountInfoOnContestStandings;
  problems: ProblemInfo[];
}

type RowTemplateProps = {
  score: number;
  penalty: number;
};
const RowTemplate: React.VFC<RowTemplateProps> = ({ score, penalty }) => (
  <>
    <td className="align-middle text-center">
      <div className="font-weight-bold text-primary">{score}</div>
      <div className="text-muted">{formatSecondToMMSS(penalty)}</div>
    </td>
  </>
);

type PlayerStatusProps = {
  problemId: number;
  point: number;
  time: number;
};
const PlayerStatusOfProblem: VFC<PlayerStatusProps> = ({
  problemId,
  point,
  time,
}) => (
  <td key={problemId} className="align-middle text-center">
    <div className="font-weight-bold text-success">{point}</div>
    <div className="text-muted">{formatSecondToMMSS(time)}</div>
  </td>
);

export const ContestStandingsTableRow: React.FC<ContestStandingsTableRowProps> = ({
  everyoneAccount,
  problems,
}) => {
  return (
    <tr>
      <RowTemplate
        score={everyoneAccount.score}
        penalty={everyoneAccount.penalty}
      />

      {problems.map((problem) => {
        if (!everyoneAccount.acceptList[problem.indexOfContest]) {
          return (
            <td key={problem.id} className="align-middle text-center">
              -
            </td>
          );
        }

        // timeがnullであることは無いが、コンパイルのため || 0 としている
        return (
          <PlayerStatusOfProblem
            key={problem.id}
            problemId={problem.id}
            point={problem.point}
            time={everyoneAccount.acceptTimeList[problem.indexOfContest] || 0}
          />
        );
      })}
    </tr>
  );
};

interface Props {
  problems: ProblemInfo[];
  standings: ContestStandingsInfo;
}

export const ContestStandingsTableForRaid: FC<Props> = ({
  problems,
  standings,
}) => {
  const firstAcceptRow = useMemo(
    () => (
      <tr className="small text-center text-nowrap">
        <th colSpan={1} className="align-middle font-weight-normal">
          最速正解者
        </th>
        {standings.firstAcceptedList.map((account) => {
          if (account === null) {
            return <th />;
          } else {
            return (
              <th
                key={account.name}
                className="align-middle font-weight-normal"
              >
                {account.name}
              </th>
            );
          }
        })}
      </tr>
    ),
    [standings.firstAcceptedList]
  );

  const acPerSubmitRow = useMemo(
    () => (
      <tr className="small text-center text-nowrap">
        <th colSpan={1} className="align-middle font-weight-normal">
          <span className="font-weight-bold text-success">正解者数</span> /
          提出者数
        </th>
        {standings.acPerSubmit.map(({ first, second }, i) => (
          <th key={i} className="align-middle font-weight-normal">
            <span className="font-weight-bold text-success">{first}</span> /{' '}
            {second}
          </th>
        ))}
      </tr>
    ),
    [standings.acPerSubmit]
  );

  if (problems.length && problems.length !== standings.acPerSubmit.length) {
    return <Alert variant="danger">Error</Alert>;
  }

  return (
    <>
      <Table size="sm" striped bordered hover responsive>
        <thead>
          <tr className="text-center text-nowrap">
            <th style={{ minWidth: '4em' }}>得点</th>
            {standings.acPerSubmit.map((_, index) => (
              <th key={index} style={{ minWidth: '4em' }}>
                {createEnglishIndex(index)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {acPerSubmitRow}
          {standings.accountStandings.map((account, i) => (
            <ContestStandingsTableRow
              key={i}
              everyoneAccount={account}
              problems={problems}
            />
          ))}
          {firstAcceptRow}
        </tbody>
        <tfoot>{acPerSubmitRow}</tfoot>
      </Table>
    </>
  );
};
