import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PagingElement } from '../components/PagingElement';
import { getLatestContests } from '../functions/HttpRequest';
import { ContestInfo } from '../types';

// URL: /

const CONTEST_IN_ONE_PAGE = 10;

interface ContestCardProps {
  contest: ContestInfo;
}

const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  return (
    <Card>
      <Link to={`/contest/${contest.id}`}>
        <Card.Header>{contest.name}</Card.Header>
      </Link>
      <Card.Text>{`Type: ${contest.contestType} ${
        (contest as any).startTime
      } ~ ${(contest as any).endTime}`}</Card.Text>
    </Card>
  );
};

const ContestList: React.FC = () => {
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

  let contestCards: React.ReactNode = <div />;

  if (contests !== null) {
    contestCards = contests.map((contest: any) => {
      return <ContestCard contest={contest} key={contest.name} />;
    });
  }

  return (
    <div>
      {contestCards ? <div>{contestCards}</div> : <p>loading...</p>}
      <br />
      <PagingElement pageChanged={updatePage} pageNum={pageNum} />
    </div>
  );
};

export const MainPage: React.FC = () => {
  return <ContestList />;
};
