import { VFC, useEffect, useState } from 'react';
import { AccountRankingTable } from '../components/AccountRankingTable';
import { PagingElement } from '../components/PagingElement';
import { getAccountRankingInfo } from '../functions/HttpRequest';
import { AccountInfo } from '../types';

const ACCOUNT_RANKING_ONE_PAGE = 20;
const RankingPage: VFC = () => {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [nowPage, setNowPage] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const getRanking = (page: number) => {
    getAccountRankingInfo(page)
      .then((res) => {
        setPageNum(Math.ceil(res.validAccountNum / ACCOUNT_RANKING_ONE_PAGE));
        setNowPage(page);
        setAccounts(res.accounts);
      })
      .catch((e) => {
        console.error(e);
      });
  };
  useEffect(() => {
    getRanking(0);
  }, []);

  return (
    <>
      <AccountRankingTable
        accounts={accounts}
        rankStart={nowPage * ACCOUNT_RANKING_ONE_PAGE + 1}
      />
      <PagingElement
        currentPage={nowPage}
        onChange={getRanking}
        savePaging={true}
        totalPages={pageNum}
      />
    </>
  );
};

export default RankingPage;
