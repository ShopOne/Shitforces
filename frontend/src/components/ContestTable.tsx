import { VFC } from 'react';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import { ContestInfo } from '../types';

type Props = { contests: ContestInfo[] | null };

export const ContestTable: VFC<Props> = ({ contests }) => {
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
    </>
  );
};
