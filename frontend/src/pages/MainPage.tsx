import { VFC, useEffect, useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { ContestTable } from '../components/ContestTable';
import { PagingElement } from '../components/PagingElement';
import { getUpcomingContests } from '../functions/HttpRequest';
import { ContestInfo } from '../types';

// URL: /

const CONTEST_IN_ONE_PAGE = 10;

const ContestList = () => {
  const [upcomingContests, setContests] = useState<ContestInfo[] | null>(null);
  const [pageNum, setPageNum] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);

  const updatePage = useCallback(() => {
    getUpcomingContests().then((upcomingContestsInfo) => {
      setContests(upcomingContestsInfo.contests);
      setCurrentPage(0);
    });
  }, [pageNum]);

  useEffect(() => {
    getUpcomingContests().then((latestContestsInfo) => {
      setPageNum(
        Math.ceil(latestContestsInfo.allContestNum / CONTEST_IN_ONE_PAGE)
      );
      setContests(latestContestsInfo.contests);
    });
  }, []);

  return (
    <>
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
