import { VFC, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import { PagingElement } from '../components/PagingElement';
import { getLatestContests } from '../functions/HttpRequest';
import { ContestInfo } from '../types';

// URL: /

const CONTEST_IN_ONE_PAGE = 10;

const ContestList: VFC = () => {
  const [contests, setContests] = useState<ContestInfo[] | null>(null);
  const [pageNum, setPageNum] = useState<number>(0);

  const updatePage = (newPage: number) => {
    getLatestContests(newPage).then((latestContestsInfo) => {
      setContests(latestContestsInfo.contests);
    });
  };
  useEffect(() => {
    getLatestContests(0).then((latestContestsInfo) => {
      setPageNum(
        Math.ceil(latestContestsInfo.allContestNum / CONTEST_IN_ONE_PAGE)
      );
      setContests(latestContestsInfo.contests);
    });
  }, []);

  return (
    <>
      <Table bordered hover size="sm" striped>
        <thead>
          <tr>
            <th className="text-center">開始時刻</th>
            <th className="text-center">コンテスト名</th>
            <th className="text-center">種類</th>
            <th className="text-center">時間</th>
            <th className="text-center">Rated対象</th>
          </tr>
        </thead>
        <tbody>
          {contests?.map((contest) => (
            <tr key={contest.id}>
              <td className="text-center">{contest.startTimeAMPM}</td>
              <td>
                <Link to={`/contest/${contest.id}`}>{contest.name}</Link>
              </td>
              <td className="text-center">{contest.contestType}</td>
              <td className="text-center">
                {Math.floor(
                  (contest.unixEndTime - contest.unixStartTime) / (60 * 1000)
                )}
                分
              </td>
              <td className="text-center">
                {contest.ratedBound > 0 ? `~ ${contest.ratedBound - 1}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <PagingElement pageChanged={updatePage} pageNum={pageNum} />
      <Link to={'/ranking'}>
        <Button variant={'primary'}>順位表へ</Button>
      </Link>
    </>
  );
};

export const MainPage: VFC = () => {
  return <ContestList />;
};
