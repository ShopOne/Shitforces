import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination';
import Table from 'react-bootstrap/Table';
import { toProblemLabel } from '../functions/toProblemLabel';
import { ProblemInfo, RankingInfo, RankingInfoAccount } from '../types';

const ACCOUNTS_PER_PAGE = 20;

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
      //null | number[] ?
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
  const [accountNameToSearch, setAccountNameToSearch] = useState('');

  const onChangeAccountName = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setAccountNameToSearch(event.target.value);
  }, []);

  const onClickReset = useCallback(() => {
    setAccountNameToSearch('');
  }, []);

  const sortedProblems = useMemo(
    () => problems.sort((a, b) => a.indexOfContest - b.indexOfContest),
    [problems]
  );

  const filteredAccounts = useMemo(() => {
    const uniqueAccounts = new Map<string, RankingInfoAccount>();
    for (const account of ranking.rankingList) {
      uniqueAccounts.set(account.accountName, account);
    }

    let accounts = Array.from(uniqueAccounts.values());

    accounts = accounts.filter((v) =>
      v.accountName.startsWith(accountNameToSearch)
    );

    accounts = accounts.sort((a, b) => {
      if (a.ranking !== b.ranking) return a.ranking - b.ranking;
      return a.penalty - b.penalty;
    });

    return accounts;
  }, [ranking.rankingList, accountNameToSearch]);

  const paginationLength = useMemo(
    () => Math.ceil(filteredAccounts.length / ACCOUNTS_PER_PAGE),
    [filteredAccounts.length]
  );

  const [paginationIndex, setPaginationIndex] = useState(0);

  useEffect(() => {
    if (paginationLength === 0) {
      if (paginationIndex !== 0) setPaginationIndex(0);
      return;
    }

    if (paginationLength <= paginationIndex) {
      setPaginationIndex(paginationLength - 1);
    }
  }, [paginationIndex, paginationLength]);

  const pagenatedAccounts = useMemo(
    () =>
      filteredAccounts.filter(
        (v, i) =>
          (paginationIndex * ACCOUNTS_PER_PAGE <= i &&
            i < (paginationIndex + 1) * ACCOUNTS_PER_PAGE) ||
          v.accountName === myAccountName
      ),
    [myAccountName, filteredAccounts, paginationIndex]
  );

  const paginationItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < Math.max(1, paginationLength); i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === paginationIndex}
          onClick={() => {
            setPaginationIndex(i);
          }}
        >
          {i + 1}
        </Pagination.Item>
      );
    }
    return items;
  }, [paginationIndex, paginationLength]);

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

  if (problems.length !== ranking.acPerSubmit.length) {
    return <Alert variant="danger">Error</Alert>;
  }

  return (
    <>
      <div className="mb-4">
        <Form inline>
          <Form.Label className="mr-2" htmlFor="ranking-table-form-username">
            ユーザ名
          </Form.Label>
          <Form.Control
            className="mr-2"
            id="ranking-table-form-username"
            onChange={onChangeAccountName}
            value={accountNameToSearch}
          />
          <Button onClick={onClickReset} variant="secondary">
            リセット
          </Button>
        </Form>
      </div>

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
        </thead>
        <tbody>
          {acPerSubmitRow}
          {pagenatedAccounts.map((account, i) => (
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

      <div className="mb-4">
        <Pagination className="justify-content-center">
          {paginationItems}
        </Pagination>
      </div>
    </>
  );
};
