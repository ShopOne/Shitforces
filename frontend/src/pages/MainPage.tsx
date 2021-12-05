import { VFC, useEffect, useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { ContestTable } from '../components/ContestTable';
import { PagingElement } from '../components/PagingElement';
import {
  getUpcomingContests,
  getActiveContests,
} from '../functions/HttpRequest';
import { ContestInfo } from '../types';

// URL: /

// const CONTEST_IN_ONE_PAGE = 10;

const ContestList = () => {
  const [upcomingContests, setUpcomingContests] = useState<
    ContestInfo[] | null
  >(null);
  const [activeContests, setActiveContests] = useState<ContestInfo[] | null>(
    null
  );
  const [pageNum, setPageNum] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);

  const updatePage = useCallback(() => {
    getUpcomingContests().then((upcomingContestsInfo) => {
      setUpcomingContests(upcomingContestsInfo.contests);
      setCurrentPage(0);
    });
  }, [pageNum]);

  useEffect(() => {
    getUpcomingContests().then((upcomingContestsInfo) => {
      setPageNum(
        0 // Math.ceil(upcomingContestsInfo.allContestNum / CONTEST_IN_ONE_PAGE)
      );
      setUpcomingContests(upcomingContestsInfo.contests);
    });

    getActiveContests().then((activeContestsInfo) => {
      setPageNum(
        0 // Math.ceil(activeContestsInfo.allContestNum / CONTEST_IN_ONE_PAGE)
      );
      setActiveContests(activeContestsInfo.contests);
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
