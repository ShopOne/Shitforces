import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td } from '@chakra-ui/react';
import React, {
  ChangeEventHandler,
  FC,
  VFC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Alert from 'react-bootstrap/Alert';
import Pagination from 'react-bootstrap/Pagination';
import Button from 'react-bootstrap/esm/Button';
import { createEnglishIndex } from '../../functions/createEnglishIndex';
import { formatSecondToMMSS } from '../../functions/formatSecondToMMSS';
import {
  ProblemInfo,
  ContestStandingsInfo,
  AccountInfoOnContestStandings,
} from '../../types';
import './ContestStandingsTable.css';
import SearchBar from './SearchBar';

const ACCOUNTS_PER_PAGE = 20;

interface ContestStandingsTableRowProps {
  account: AccountInfoOnContestStandings;
  isMe: boolean;
  problems: ProblemInfo[];
}

type RowTemplateProps = {
  rank: number;
  accountName: string;
  score: number;
  penalty: number;
  penaltySubmitCountSum: number;
};
const RowTemplate: React.VFC<RowTemplateProps> = ({
  rank,
  accountName,
  score,
  penalty,
  penaltySubmitCountSum,
}) => (
  <>
    <Td className="align-middle text-center">{rank}</Td>
    <Td className="align-middle font-weight-bold">{accountName}</Td>
    <Td className="align-middle text-center">
      <span className="font-weight-bold text-primary">{score}</span>
      {penaltySubmitCountSum === 0 ? null : (
        <span className={'wa-color'}>{`(${penaltySubmitCountSum})`}</span>
      )}
      <div className="text-muted">{formatSecondToMMSS(penalty)}</div>
    </Td>
  </>
);

type PlayerStatusProps = {
  problemId: number;
  point: number;
  time: number;
  penaltySubmitCount: number;
};
const PlayerStatusOfProblem: VFC<PlayerStatusProps> = ({
  problemId,
  point,
  time,
  penaltySubmitCount,
}) => (
  <Td key={problemId} className="align-middle text-center">
    <span className="font-weight-bold text-success">{point}</span>
    {penaltySubmitCount === 0 ? null : (
      <span className={'wa-color'}>{`(${penaltySubmitCount})`}</span>
    )}
    <div className="text-muted">{formatSecondToMMSS(time)}</div>
  </Td>
);

export const ContestStandingsTableRow: React.FC<ContestStandingsTableRowProps> = ({
  account,
  isMe,
  problems,
}) => {
  return (
    <Tr className={isMe ? 'table-info' : undefined}>
      <RowTemplate
        rank={account.rank}
        accountName={account.accountName}
        score={account.score}
        penalty={account.penalty}
        penaltySubmitCountSum={account.penaltySubmissionCountList.reduce(
          (s, e, idx) => {
            let res = s;
            if (account.acceptList[idx]) {
              res += e;
            }

            return res;
          },
          0
        )}
      />

      {problems.map((problem) => {
        const penaltySubmit =
          account.penaltySubmissionCountList[problem.indexOfContest];
        if (!account.acceptList[problem.indexOfContest]) {
          let status = <div>{'-'}</div>;
          if (account.penaltySubmissionCountList[problem.indexOfContest] > 0) {
            status = <div className={'wa-color'}>{`(${penaltySubmit})`}</div>;
          }

          return (
            <Td key={problem.id} className="align-middle text-center">
              {status}
            </Td>
          );
        }

        // timeがnullであることは無いが、コンパイルのため || 0 としている
        return (
          <PlayerStatusOfProblem
            key={problem.id}
            problemId={problem.id}
            point={problem.point}
            time={account.acceptTimeList[problem.indexOfContest] || 0}
            penaltySubmitCount={penaltySubmit}
          />
        );
      })}
    </Tr>
  );
};

const useContestStandingsTable = (
  problems: ProblemInfo[],
  standings: ContestStandingsInfo,
  myAccountName: string | null
) => {
  const [accountNameToSearch, setAccountNameToSearch] = useState('');
  const [paginationIndex, setPaginationIndex] = useState(0);
  const onChangeAccountName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      event.preventDefault();
      setAccountNameToSearch(event.target.value);
    },
    []
  );

  const onClickReset = useCallback(() => setAccountNameToSearch(''), []);

  const SearchResult = useMemo(() => {
    const uniqueAccounts = new Map<string, AccountInfoOnContestStandings>();
    for (const account of standings.accountStandings) {
      uniqueAccounts.set(account.accountName, account);
    }

    const allUsername = Array.from(uniqueAccounts.values());

    const matchedUser = allUsername.filter((v) =>
      v.accountName.startsWith(accountNameToSearch)
    );

    const sortedMatchedUser = matchedUser.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;

      return a.penalty - b.penalty;
    });

    return sortedMatchedUser;
  }, [standings.accountStandings, accountNameToSearch]);

  const paginationLength = useMemo(
    () => Math.ceil(SearchResult.length / ACCOUNTS_PER_PAGE),
    [SearchResult.length]
  );

  const paginatedAccounts = useMemo(
    () =>
      SearchResult.filter(
        (v, i) =>
          (paginationIndex * ACCOUNTS_PER_PAGE <= i &&
            i < (paginationIndex + 1) * ACCOUNTS_PER_PAGE) ||
          v.accountName === myAccountName
      ),
    [myAccountName, SearchResult, paginationIndex]
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

  useEffect(() => {
    if (paginationLength === 0) {
      if (paginationIndex !== 0) setPaginationIndex(0);

      return;
    }

    if (paginationLength <= paginationIndex) {
      setPaginationIndex(paginationLength - 1);
    }
  }, [paginationIndex, paginationLength]);

  return {
    onChangeAccountName,
    accountNameToSearch,
    onClickReset,
    paginatedAccounts,
    paginationItems,
  };
};

interface Props {
  myAccountName: string | null;
  problems: ProblemInfo[];
  standings: ContestStandingsInfo;
  getStandings: () => void;
}

export const ContestStandingsTable: FC<Props> = ({
  myAccountName,
  problems,
  standings,
  getStandings,
}) => {
  const {
    onChangeAccountName,
    accountNameToSearch,
    paginatedAccounts,
    paginationItems,
  } = useContestStandingsTable(problems, standings, myAccountName);

  if (problems.length && problems.length !== standings.acPerSubmit.length) {
    return <Alert variant="danger">Error</Alert>;
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: 40,
          height: 30,
        }}
      >
        <SearchBar
          changeAccountName={onChangeAccountName}
          searchTerm={accountNameToSearch}
        />
        <Button onClick={getStandings} variant="secondary">
          ランキング更新
        </Button>
      </div>
      <StandingsTable
        standings={standings}
        problems={problems}
        paginatedAccounts={paginatedAccounts}
        myAccountName={myAccountName}
      />

      <Pagination className="justify-content-center">
        {paginationItems}
      </Pagination>
      <div className="mb-4" />
    </>
  );
};

type StandingsTableProps = {
  standings: ContestStandingsInfo;
  problems: ProblemInfo[];
  paginatedAccounts: AccountInfoOnContestStandings[];
  myAccountName: string | null;
};

const SortIcon: VFC = () => {
  return (
    <div className="sort-icons">
      <TriangleUpIcon className="icon-image" />
      <TriangleDownIcon className="icon-image" />
    </div>
  );
};

const StandingsTable: VFC<StandingsTableProps> = ({
  standings,
  problems,
  paginatedAccounts,
  myAccountName,
}) => {
  const sortedProblems = useMemo(
    () => problems.sort((a, b) => a.indexOfContest - b.indexOfContest),
    [problems]
  );
  const firstAcceptRow = useMemo(
    () => (
      <Tr className="small text-center text-nowrap">
        <Th colSpan={3} className="align-middle font-weight-normal">
          最速正解者
        </Th>
        {standings.firstAcceptedList.map((account, index) => {
          if (account === null) {
            return <Th key={index} />;
          } else {
            return (
              <Th
                key={account.name}
                className="align-middle font-weight-normal"
              >
                {account.name}
              </Th>
            );
          }
        })}
      </Tr>
    ),
    [standings.firstAcceptedList]
  );

  const acPerSubmitRow = useMemo(
    () => (
      <Tr className="small text-center text-nowrap">
        <Th colSpan={3} className="align-middle font-weight-normal">
          <span className="font-weight-bold text-success">正解者数</span> /
          提出者数
        </Th>
        {standings.acPerSubmit.map(({ first, second }, i) => (
          <Th key={i} className="align-middle font-weight-normal">
            <span className="font-weight-bold text-success">{first}</span> /{' '}
            {second}
          </Th>
        ))}
      </Tr>
    ),
    [standings.acPerSubmit]
  );

  return (
    <Table
      size="sm"
      variant="striped"
      bordered="true"
      hover="true"
      responsive="true"
      class="standing-table"
    >
      <Thead>
        <Tr className="text-center text-nowrap">
          <Th style={{ minWidth: '3em' }}>順位</Th>
          <Th style={{ minWidth: '10em' }}>ユーザ</Th>
          <Th style={{ minWidth: '4em' }}>
            得点
            <SortIcon />
          </Th>
          {standings.acPerSubmit.map((_, index) => (
            <Th key={index} style={{ minWidth: '4em' }}>
              {createEnglishIndex(index)}
              <SortIcon />
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {acPerSubmitRow}
        {paginatedAccounts.map((account, i) => (
          <ContestStandingsTableRow
            key={i}
            account={account}
            problems={sortedProblems}
            isMe={account.accountName === myAccountName}
          />
        ))}
        {firstAcceptRow}
      </Tbody>
      <Tfoot>{acPerSubmitRow}</Tfoot>
    </Table>
  );
};
