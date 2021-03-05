import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, Tab, Tabs, Form, Table } from 'react-bootstrap';
import { PagingElement } from '../components/PagingElement';
import { getCookieArray } from '../functions/GetCookieArray';
import {
  getAccountInformation,
  getContestInfo,
  getContestProblems,
  getRankingInfo,
  getSubmission,
  postSubmission, updateContestRating,
} from '../functions/HttpRequest';
import './ContestPage.css';

const KEY_OF_MY_SUBMISSIONS = 'mySubmit';

// URL: /contest/$contestId

function createEnglishIndex(index: number, num: number) {
  const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const ALPHABETS_NUM = 26;
  let res = ALPHABETS[index % ALPHABETS_NUM];
  if (num > ALPHABETS_NUM) {
    res += index / ALPHABETS_NUM;
  }
  return res;
}

function getContestId() {
  const splitPath = window.location.pathname.split('/');
  return splitPath.slice(-1)[0];
}

function formatSecondToMMSS(ms: number): string {
  const mm = Math.round(ms / 60);
  const ss = ('00' + Math.round(ms % 60)).slice(-2);
  return `${mm}:${ss}`;
}

interface RankingTableProps {
  acPerSubmit: any[];
  problems: any[];
  rankingList: any[];
}

const RankingTable: React.FC<RankingTableProps> = ({
  acPerSubmit,
  problems,
  rankingList,
}) => {
  if (problems.length !== acPerSubmit.length) {
    return <div />;
  }

  const problemsNum = problems.length;
  const problemTr = () => {
    const items = [];
    for (let i = 0; i < problemsNum; i++) {
      items.push(
        <th>
          {`${createEnglishIndex(i, problemsNum)} (${acPerSubmit[i].first} / ${
            acPerSubmit[i].second
          })`}
        </th>
      );
    }
    return items;
  };

  const rankingInfo = () => {
    /**
     * @param {Object} account - 順位表に表示するためのアカウント情報
     * @param {String} account.accountName
     * @param {Array} account.acceptList - ACした問題リスト
     * @param {ranking} account.ranking - このアカウントの現在順位
     * @param {Array} account.acceptTimeList - 提出までに経過した秒数
     * @param {Number} account.score
     * @param {Number} account.penalty
     */
    return rankingList.map((account: any, idx: number) => {
      const probElement = [];
      let acTimeListIdx = 0;
      for (let i = 0; i < problemsNum; i++) {
        if (account.acceptList.some((ac: any) => ac === i)) {
          probElement.push(
            <td>
              <p className={'contestPage-ranking-submitResult'}>AC</p>
              <p className={'contestPage-ranking-submitTime'}>{formatSecondToMMSS(account.acceptTimeList[acTimeListIdx])}</p>
            </td>);
          acTimeListIdx++;
        } else {
          probElement.push(<td> </td>);
        }
      }
      return (
        <tr key={account.accountName + idx} className={'contestPage-ranking-tr'}>
          <td>{account.ranking}</td>
          <td>{account.accountName}</td>
          <td>{account.score}</td>
          {probElement}
          <td>{account.penalty}</td>
        </tr>
      );
    });
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>順位</th>
          <th>アカウント</th>
          <th>総得点</th>
          {problemTr()}
          <th>ペナルティ</th>
        </tr>
      </thead>
      <tbody>{rankingInfo()}</tbody>
    </Table>
  );
};

RankingTable.propTypes = {
  acPerSubmit: PropTypes.array.isRequired,
  problems: PropTypes.array.isRequired,
  rankingList: PropTypes.array.isRequired,
};

interface SubmissionTableProps {
  problemNum: number;
  submissions: any[];
}

const SubmissionTable: React.FC<SubmissionTableProps> = ({
  problemNum,
  submissions,
}) => {
  const [displaySubmissions, setDisplaySubmissions] = useState<any>([]);

  if (submissions.length === 0) {
    return <div />;
  }

  const SUBMISSIONS_IN_ONE_PAGE = 5;
  const pageNum = Math.ceil(submissions.length / SUBMISSIONS_IN_ONE_PAGE);
  const changeDisplaySubmissions = (page: any) => {
    const newSubmissions = submissions.filter(
      (_: any, idx: number) =>
        page * SUBMISSIONS_IN_ONE_PAGE <= idx &&
        idx < (page + 1) * SUBMISSIONS_IN_ONE_PAGE
    );
    setDisplaySubmissions(newSubmissions);
  };

  const createTableBody = () => {
    /**
     * @param {Object} submit - 提出情報
     * @param {String} submit.statement - 提出した際の答案
     * @param {String} submit.result - 提出結果
     * @param {String} submit.submitTimeAMPM - 提出時間のフォーマット済の文字列
     */
    return displaySubmissions.map((submit: any, idx: number) => {
      return (
        <tr key={idx}>
          <td key={idx + 'idx'}>
            {createEnglishIndex(submit.indexOfContest, problemNum)}
          </td>
          <td key={idx + 'stm'}>{submit.statement}</td>
          <td key={idx + 'res'}>{submit.result}</td>
          <td key={idx + 'time'}>{submit.submitTimeAMPM}</td>
        </tr>
      );
    });
  };

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>問題</th>
            <th>提出</th>
            <th>結果</th>
            <th>提出時間</th>
          </tr>
        </thead>
        <tbody>{createTableBody()}</tbody>
      </Table>
      <PagingElement pageNum={pageNum} pageChanged={changeDisplaySubmissions} />
    </div>
  );
};

SubmissionTable.propTypes = {
  problemNum: PropTypes.number.isRequired,
  submissions: PropTypes.array.isRequired,
};

interface RankingElementProps {
  problems: any[];
  rankingVersion: number;
}

const RankingElement: React.FC<RankingElementProps> = ({
  problems,
  rankingVersion,
}) => {
  const [partNum, setPartNum] = useState(0);
  const [rankingList, setRankingList] = useState([]);
  const [accountRank, setAccountRank] = useState();
  const [nowRankingVersion, setNowRankingVersion] = useState(0);
  const [acPerSubmit, setAcPerSubmit] = useState([]);
  const ACCOUNTS_IN_ONE_PAGE = 20;

  const getRanking = (newPage: any) => {
    getRankingInfo(newPage,  getContestId()).then((rankingInfo) => {
      setPartNum(rankingInfo.partAccountNum);
      setRankingList(rankingInfo.rankingList);
      setAccountRank(rankingInfo.requestAccountRank);
      setAcPerSubmit(rankingInfo.acPerSubmit);
    });
  };

  if (nowRankingVersion !== rankingVersion) {
    setNowRankingVersion(rankingVersion);
    getRanking(0);
  }

  useEffect(() => {
    getRanking(0);
  }, []);

  const pageNum = Math.ceil(partNum / ACCOUNTS_IN_ONE_PAGE);
  let myRank = '';
  if (accountRank) {
    myRank = `順位: ${accountRank}`;
  }

  return (
    <div>
      <p>{myRank}</p>
      <RankingTable
        problems={problems}
        rankingList={rankingList}
        acPerSubmit={acPerSubmit}
      />
      <PagingElement
        pageNum={pageNum}
        pageChanged={getRanking}
        reloadButton={true}
      />
    </div>
  );
};

RankingElement.propTypes = {
  problems: PropTypes.array.isRequired,
  rankingVersion: PropTypes.number.isRequired,
};

interface ProblemsTabProps {
  contestName: string;
  problems: any[];
  submissions: any[];
}

const ProblemsTab: React.FC<ProblemsTabProps> = ({ problems, submissions }) => {
  const answerInput = React.createRef<HTMLInputElement>();
  const [comment, setComment] = useState('');
  const [key, setKey] = useState(KEY_OF_MY_SUBMISSIONS);
  const [changeColor, setChangeColor] = useState(true);
  const [firstTabRender, setFirstTabRender] = useState(false);
  const [nowSubmissions, setNowSubmission] = useState<any[]>([]);
  const [rankingVersion, setRankingVersion] = useState(0);
  const TAB_ID = 'tabId';

  useEffect(() => {
    const getSubmitResultArray = () => {
      //初期化時はprops、そうでない場合nowSubmissionsが新しい値 更新されている場合、要素数が多い
      let useSubmissions;
      if (nowSubmissions.length < submissions.length) {
        useSubmissions = submissions;
      } else {
        useSubmissions = nowSubmissions;
      }
      const tryingArray = new Array(problems.length);
      tryingArray.fill('NO_SUB');
      useSubmissions.map((submit: any) => {
        if (submit.result === 'ACCEPTED') {
          tryingArray[submit.indexOfContest] = 'ACCEPTED';
        } else if (submit.result === 'WRONG_ANSWER') {
          if (tryingArray[submit.indexOfContest] === 'NO_SUB') {
            tryingArray[submit.indexOfContest] = 'WRONG_ANSWER';
          }
        }
      });
      return tryingArray;
    };
    const setColor = () => {
      const submitResult = getSubmitResultArray();
      problems.map((_: any, index: number) => {
        const element = document.getElementById(TAB_ID + '-tab-' + index);
        element?.classList.remove('bg-success', 'text-white', 'bg-warning');
        if (submitResult) {
          switch (submitResult[index]) {
            case 'ACCEPTED':
              element?.classList.add('bg-success');
              element?.classList.add('text-white');
              break;
            case 'WRONG_ANSWER':
              element?.classList.add('bg-warning');
              element?.classList.add('text-white');
              break;
          }
        }
      });
    };
    setColor();
    setChangeColor(false);
    setFirstTabRender(false);
    //初期化時のみ
    if (nowSubmissions.length === 0) {
      setNowSubmission(submissions);
    }
  }, [changeColor, firstTabRender]);

  if (problems.length === 0 && submissions.length === 0) {
    return <div />;
    // 最初の色つけタイミングのみこの様に処理する必要がある
  } else if (
    !firstTabRender &&
    ((problems.length !== 0 && submissions.length !== 0) ||
      nowSubmissions.length !== 0)
  ) {
    setFirstTabRender(true);
  }

  const getElement = () => {
    if (key !== KEY_OF_MY_SUBMISSIONS) {
      return (
        <div>
          <Form.Label>答え</Form.Label>
          <Form.Control type={'text'} ref={answerInput} />
          <Button type={'primary'} onClick={submitAnswer}>
            提出
          </Button>
        </div>
      );
    } else {
      return (
        <SubmissionTable
          submissions={nowSubmissions}
          problemNum={problems.length}
        />
      );
    }
  };

  const submitAnswer = () => {
    if (answerInput.current?.value === '') {
      setComment('答えが空です');
      return;
    }
    if (answerInput.current?.value.indexOf(':') !== -1) {
      setComment(': を含む答えは提出できません');
      return;
    }
    setComment('');
    postSubmission( getContestId(), key, answerInput.current.value)
      .then((submitResult) => {
        const newSubmissions = nowSubmissions.slice();
        newSubmissions.unshift(submitResult);
        setNowSubmission(newSubmissions);
        setComment(submitResult.result);
        // RankingElement再読込のため、バージョニング
        setRankingVersion(rankingVersion + 1);
      })
      .catch((e) => {
        if (e.message === '403') {
          setComment('5秒間隔を空けて提出して下さい');
        } else if (e.message === '400') {
          setComment('ログインして下さい');
        } else {
          setComment('提出に失敗しました 再ログインを試してみて下さい');
        }
      });
  };

  const getProblemTabList = () => {
    return problems.map((problem: any, index: any) => {
      const problemTitle = createEnglishIndex(index, problems.length);
      return (
        <Tab eventKey={index} key={problem.indexOfContest} title={problemTitle}>
          <h6>{'point: ' + problem.point}</h6>
          <p>{problem.statement}</p>
        </Tab>
      );
    });
  };

  const selectTab = (key: any) => {
    setComment('');
    setChangeColor(true);
    setKey(key);
    if (answerInput.current) {
      answerInput.current.value = '';
    }
  };

  return (
    <div>
      <Tabs id={TAB_ID} activeKey={key} onSelect={selectTab}>
        {getProblemTabList()}
        <Tab eventKey={'mySubmit'} key={'mySubmit'} title={'自分の提出'}/>
      </Tabs>
      {getElement()}
      <p>{comment}</p>
      <RankingElement problems={problems} rankingVersion={rankingVersion} />
    </div>
  );
};

ProblemsTab.propTypes = {
  contestName: PropTypes.string.isRequired,
  problems: PropTypes.array.isRequired,
  submissions: PropTypes.array.isRequired,
};

export const ContestPage: React.FC = () => {
  const [contestName, setContestName] = useState('コンテストが見つかりません');
  const [statement, setStatement] = useState('');
  const [time, setTime] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [ratingUpdateButtonStyle, setRatingUpdateButtonStyle] = useState({display: 'none'});
  const ratingUpdate = () => {
    updateContestRating( getContestId())
        .then(() => {
          alert('レート更新が完了しました');
          location.reload();
        })
        .catch((e) => {
          alert('レート更新に失敗しました');
          console.log(e);
        });
  };

  useEffect(() => {
    const contestId =  getContestId();
    (async () => {
      const contestInfo = await getContestInfo(contestId).catch(
        () => null
      );
      if (contestInfo === null) {
        setContestName('コンテストが見つかりません');
        return;
      }
      const problems = await getContestProblems(
        contestId
      ).catch(() => []);
      let submissions;
      const cookieArray = getCookieArray();
      if (cookieArray['_sforce_account_name']) {
        const accountName = cookieArray['_sforce_account_name'];
        submissions = await getSubmission(
           getContestId(),
          accountName
        );
        const accountInfo = await getAccountInformation(accountName)
        if (accountInfo.auth === 'ADMINISTER' &&
            contestInfo.ratingCalculated === false &&
            contestInfo.ratedBound > 0 &&
            contestInfo.unixEndTime < Date.now()) {
          setRatingUpdateButtonStyle({display: 'block'});
        }
      } else {
        submissions = [];
      }
      setContestName(contestInfo.name);
      setStatement(contestInfo.statement);
      setTime(`${contestInfo.startTimeAMPM} ~ ${contestInfo.endTimeAMPM}`);
      setProblems(problems);
      setSubmissions(submissions);
    })();
  }, []);

  return (
    <div>
      <Button onClick={ratingUpdate} variant={'info'} style={ratingUpdateButtonStyle}>{'レート更新'}</Button>
      <p id={'contestPage-contestName'}>{contestName}</p>
      <p>
        <pre>{statement}</pre>
      </p>
      <p id={'contestPage-timeSpan'}>{time}</p>
      <ProblemsTab
        problems={problems}
        contestName={contestName}
        submissions={submissions}
      />
    </div>
  );
};
