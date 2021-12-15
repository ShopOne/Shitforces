import { useColorMode } from '@chakra-ui/react';
import { VFC, useEffect, useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { AccountRankingTable } from '../components/AccountRankingTable';
import { ContestTable } from '../components/ContestTable';
import { PagingElement } from '../components/PagingElement';
import {
  getUpcomingContests,
  getActiveContests,
  getPastContests,
  getAccountRankingInfo,
} from '../functions/HttpRequest';
import { ContestInfo, AccountInfo } from '../types';

// import Ranking from './RankingPage';
// URL: /

const CONTEST_IN_ONE_PAGE = 10;

const ContestList = () => {
  const [upcomingContests, setUpcomingContests] = useState<
    ContestInfo[] | null
  >(null);
  const [activeContests, setActiveContests] = useState<ContestInfo[] | null>(
    null
  );
  const [pastContests, setPastContests] = useState<ContestInfo[] | null>(null);
  const [contestPageNum, setContestPageNum] = useState<number>(0);
  const [contestCurrentPage, setContestCurrentPage] = useState(0);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);

  const updateContestPage = useCallback(
    (page) => {
      getPastContests(page).then((pastContestsInfo) => {
        setPastContests(pastContestsInfo.contests);
        setContestCurrentPage(page);
      });
    },
    [contestPageNum]
  );

  useEffect(() => {
    getUpcomingContests().then((upcomingContestsInfo) => {
      setUpcomingContests(upcomingContestsInfo.contests);
    });

    getActiveContests().then((activeContestsInfo) => {
      setActiveContests(activeContestsInfo.contests);
    });

    getPastContests(0).then((pastContestsInfo) => {
      setContestPageNum(
        Math.ceil(pastContestsInfo.allContestNum / CONTEST_IN_ONE_PAGE)
      );
      setPastContests(pastContestsInfo.contests);
    });

    getAccountRankingInfo(0)
      .then((res) => {
        setAccounts(res.accounts);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const { colorMode, toggleColorMode } = useColorMode();

  // workaround for overriding color-mode to system color-mode.
  if (colorMode === 'dark') {
    toggleColorMode();
  }

  return (
    <>
      <h2>開催中のコンテスト</h2>
      {activeContests && activeContests.length > 0 ? (
        <ContestTable contests={activeContests} />
      ) : (
        <div>現在開催中のコンテストはありません</div>
      )}
      <h2>予定されたコンテスト</h2>
      <ContestTable contests={upcomingContests} />
      <h2>終了したコンテスト</h2>
      <ContestTable contests={pastContests} />
      <PagingElement
        currentPage={contestCurrentPage}
        onChange={updateContestPage}
        savePaging={true}
        totalPages={contestPageNum}
      />
      <h2>ランキング</h2>
      <AccountRankingTable accounts={accounts} rankStart={1} />
      <Link to={'/ranking'}>
        <Button variant={'primary'}>順位表へ</Button>
      </Link>
    </>
  );
};

export const MainPage: VFC = () => {
  return <ContestList />;
};
