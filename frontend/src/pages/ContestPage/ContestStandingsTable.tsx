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
import {
  createEnglishIndex,
  createEnglishString,
} from '../../functions/createEnglishIndex';
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
    <Tr
      className={isMe ? 'table-info standings-row' : 'standings-row'}
      _hover={{ background: 'gray.300' }}
    >
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

const userSortComp = (sortAccountType: [string, boolean]) => {
  return (
    a: AccountInfoOnContestStandings,
    b: AccountInfoOnContestStandings
  ): number => {
    const sortRev: number = sortAccountType[1] ? 1 : -1;
    if (sortAccountType[0] == 'allPoint') {
      if (a.rank !== b.rank) return (a.rank - b.rank) * sortRev;

      return (a.penalty - b.penalty) * sortRev;
    } else {
      const problemIndex = createEnglishString(sortAccountType[0]);
      if (a.acceptList[problemIndex] && !b.acceptList[problemIndex]) {
        return -1 * sortRev;
      } else if (!a.acceptList[problemIndex] && b.acceptList[problemIndex]) {
        return sortRev;
      } else if (a.acceptList[problemIndex] && b.acceptList[problemIndex]) {
        const at = a.acceptTimeList[problemIndex] || 0;
        const bt = b.acceptTimeList[problemIndex] || 0;

        return (at - bt) * sortRev;
      } else {
        const ap = a.penaltySubmissionCountList[problemIndex];
        const bp = b.penaltySubmissionCountList[problemIndex];

        return (ap - bp) * sortRev;
      }
    }
  };
};

const dedupAccount = (
  accounts: AccountInfoOnContestStandings[]
): AccountInfoOnContestStandings[] => {
  const uniqueAccounts = new Map<string, AccountInfoOnContestStandings>();
  for (const account of accounts) {
    uniqueAccounts.set(account.accountName, account);
  }

  return Array.from(uniqueAccounts.values());
};

const useContestStandingsTable = (
  problems: ProblemInfo[],
  standings: ContestStandingsInfo,
  myAccountName: string | null
) => {
  const [accountNameToSearch, setAccountNameToSearch] = useState('');
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [sortAccountType, setSortAccountType] = useState<[string, boolean]>([
    'allPoint',
    true,
  ]);
  const onChangeAccountName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      event.preventDefault();
      setAccountNameToSearch(event.target.value);
    },
    []
  );

  const onClickReset = useCallback(() => setAccountNameToSearch(''), []);

  const SearchResult = useMemo(() => {
    const allUsername = dedupAccount(standings.accountStandings);

    const matchedUser = allUsername.filter((v) =>
      v.accountName.startsWith(accountNameToSearch)
    );

    const sortedUser = matchedUser.sort(userSortComp(sortAccountType));

    return sortedUser;
  }, [
    standings.accountStandings,
    accountNameToSearch,
    sortAccountType[0],
    sortAccountType[1],
  ]);

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
    setSortAccountType,
    sortAccountType,
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
    setSortAccountType,
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
        setSortAccountType={setSortAccountType}
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
  setSortAccountType: ([type, isAsc]: [string, boolean]) => void;
};

type SortIconProps = {
  setSortAccountType: (isAsc: boolean) => void;
};

const SortIcon: VFC<SortIconProps> = ({ setSortAccountType }) => {
  return (
    <div className="sort-icons">
      <TriangleUpIcon
        onClick={() => setSortAccountType(true)}
        className="icon-image"
      />
      <TriangleDownIcon
        onClick={() => setSortAccountType(false)}
        className="icon-image"
      />
    </div>
  );
};

const StandingsTable: VFC<StandingsTableProps> = ({
  standings,
  problems,
  paginatedAccounts,
  myAccountName,
  setSortAccountType,
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
    <div style={{ overflowX: 'scroll' }}>
      <Table responsive="true" className="standing-table">
        <Thead>
          <Tr className="text-center text-nowrap">
            <Th style={{ minWidth: '3em' }}>順位</Th>
            <Th style={{ minWidth: '10em' }}>ユーザ</Th>
            <Th style={{ minWidth: '4em' }}>
              得点
              <SortIcon
                setSortAccountType={(isAsc) =>
                  setSortAccountType(['allPoint', isAsc])
                }
              />
            </Th>
            {standings.acPerSubmit.map((_, index) => (
              <Th key={index} style={{ minWidth: '4em' }}>
                {createEnglishIndex(index)}
                <SortIcon
                  setSortAccountType={(isAsc) =>
                    setSortAccountType([createEnglishIndex(index), isAsc])
                  }
                />
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
    </div>
  );
};
