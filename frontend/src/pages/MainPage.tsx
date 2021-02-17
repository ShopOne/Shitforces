import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getLatestContests } from '../functions/HttpRequest';

// URL: /

interface ContestCardProps {
  contest: any;
}

const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  return (
    <Card>
      <Link to={`/contest/${contest.id}`}>
        <Card.Header>{contest.name}</Card.Header>
      </Link>
      <Card.Text>{`Type: ${contest.contestType} ${contest.startTime} ~ ${contest.endTime}`}</Card.Text>
    </Card>
  );
};

ContestCard.propTypes = {
  contest: PropTypes.object,
};

const ContestList: React.FC = () => {
  const [contests, setContests] = useState<any>(null);

  useEffect(() => {
    getLatestContests().then((contests) => {
      setContests(contests);
    });
  }, []);

  let contestCards = <div />;

  if (contests !== null) {
    contestCards = contests.map((contest: any) => {
      return <ContestCard contest={contest} key={contest.name} />;
    });
  }

  return (
    <div>{contestCards ? <div>{contestCards}</div> : <p>loading...</p>}</div>
  );
};

export const MainPage: React.FC = () => {
  return <ContestList />;
};
