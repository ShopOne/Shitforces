import { VFC, useEffect, useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { ContestTable } from '../components/ContestTable';
import { PagingElement } from '../components/PagingElement';
import {
  getUpcomingContests,
  getActiveContests,
  getPastContests,
} from '../functions/HttpRequest';
import { ContestInfo } from '../types';

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
  const [pageNum, setPageNum] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);

  const updatePage = useCallback(
    (page) => {
      getPastContests(page).then((pastContestsInfo) => {
        setPastContests(pastContestsInfo.contests);
        setCurrentPage(page);
      });
    },
    [pageNum]
  );

  useEffect(() => {
    getUpcomingContests().then((upcomingContestsInfo) => {
      setUpcomingContests(upcomingContestsInfo.contests);
    });

    getActiveContests().then((activeContestsInfo) => {
      setActiveContests(activeContestsInfo.contests);
    });

    getPastContests(0).then((pastContestsInfo) => {
      setPageNum(
        Math.ceil(pastContestsInfo.allContestNum / CONTEST_IN_ONE_PAGE)
      );
      setPastContests(pastContestsInfo.contests);
    });
  }, []);

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
        currentPage={currentPage}
        onChange={updatePage}
        savePaging={true}
        totalPages={pageNum}
      />
      <Link to={'/ranking'}>
        <Button variant={'primary'}>順位表へ</Button>
      </Link>
    </>
  );
};

export const MainPage: VFC = () => {
  return <ContestList />;
};
