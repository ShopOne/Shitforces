import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { VFC } from 'react';
import { Link } from 'react-router-dom';
import { ContestInfo } from '../types';

type Props = { contests: ContestInfo[] | null };

export const ContestChakraTable: VFC<Props> = ({ contests }) => {
  const doubledContests = contests?.concat(contests);

  return (
    <>
      <Table variant="striped" colorScheme="gray">
        <Thead>
          <Tr>
            <Th w="200px">開始時刻</Th>
            <Th>コンテスト名</Th>
            <Th w="200px">種類</Th>
            <Th w="200px">時間</Th>
            <Th w="200px">Rated対象</Th>
          </Tr>
        </Thead>
        <Tbody>
          {doubledContests?.map((contest) => (
            <Tr key={contest.id}>
              <Td>{contest.startTimeAMPM}</Td>
              <Td>
                <Link to={`/contest/${contest.id}`}>{contest.name}</Link>
              </Td>
              <Td>{contest.contestType}</Td>
              <Td>
                {Math.floor(
                  (contest.unixEndTime - contest.unixStartTime) / (60 * 1000)
                )}
                分
              </Td>
              <Td>
                {contest.ratedBound > 0 ? `~ ${contest.ratedBound - 1}` : '-'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};
