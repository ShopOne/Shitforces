/* eslint-disable max-lines-per-function */
import { Box, Flex, Heading, useColorMode, VStack } from '@chakra-ui/react';
import { VFC, useEffect, useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { ContestChakraTable } from '../components/ContestChakraTable';
import { ContestTable } from '../components/ContestTable';
import { FutureContestChakraTable } from '../components/FutureContextTable';
import { PagingElement } from '../components/PagingElement';
import { PastContestChakraTable } from '../components/PastContestChakraTable';
import {
  getUpcomingContests,
  getActiveContests,
  getPastContests,
} from '../functions/HttpRequest';
import { ContestInfo } from '../types';

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
  }, []);

  const { colorMode, toggleColorMode } = useColorMode();

  // workaround for overriding color-mode to system color-mode.
  if (colorMode === 'dark') {
    toggleColorMode();
  }

  return (
    <>
      <Box my="4" mx="2">
        <Heading
          as="h2"
          fontWeight="thin"
          size="lg"
          pl="6"
          color="orange.500"
          width="130px"
          border="4px"
          borderRadius={'2xl'}
        >
          開催中
        </Heading>
        {activeContests && activeContests.length > 0 ? (
          <ContestChakraTable contests={activeContests} />
        ) : (
          <div>現在開催中のコンテストはありません</div>
        )}

        <Heading
          as="h2"
          fontWeight="thin"
          size="lg"
          pl="6"
          color="green.500"
          width="100px"
          border="4px"
          borderRadius={'2xl'}
          mt="12"
        >
          予定
        </Heading>
        <FutureContestChakraTable contests={upcomingContests} />

        <Heading
          as="h2"
          fontWeight="thin"
          size="lg"
          pl="6"
          color="gray.500"
          width="100px"
          border="4px"
          borderRadius={'2xl'}
          mt="12"
        >
          終了
        </Heading>
        <PastContestChakraTable contests={pastContests} />
        <Box display="flex" justifyContent="center" alignItems="center" mt="4">
          <PagingElement
            currentPage={contestCurrentPage}
            onChange={updateContestPage}
            savePaging={true}
            totalPages={contestPageNum}
          />
        </Box>
        {/*
        pageのクエリパラメータを全てで使っているので、同じページに二つPagingElementがあるとページが同期しちゃう
        というか上位10~20人だけでもいいかも
        <h2>ランキング</h2>
        <Ranking />
        */}
      </Box>
      <Box mt="12">
        <Link to={'/ranking'}>
          <Button variant={'primary'}>順位表へ</Button>
        </Link>
      </Box>
    </>
  );
};

export const MainPage: VFC = () => {
  return <ContestList />;
};
