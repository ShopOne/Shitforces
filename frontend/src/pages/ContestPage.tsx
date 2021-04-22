import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Tabs from 'react-bootstrap/Tabs';
import { Link } from 'react-router-dom';
import { PagingElement } from '../components/PagingElement';
import { RankingTable } from '../components/RankingTable';
import { useAuthentication } from '../contexts/AuthenticationContext';
import {
  getAccountInformation,
  getContestInfo,
  getContestProblems,
  getRankingInfo,
  getSubmission,
  postSubmission,
  updateContestRating,
} from '../functions/HttpRequest';
import { getCookie } from '../functions/getCookie';
import { ProblemInfo, RankingInfo, SubmissionInfo } from '../types';
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
  problems: ProblemInfo[];
  rankingVersion: number;
}

const RankingElement: React.FC<RankingElementProps> = ({
  problems,
  rankingVersion,
}) => {
  const { accountName } = useAuthentication();
  const [ranking, setRanking] = useState<RankingInfo | null>(null);
  const [nowRankingVersion, setNowRankingVersion] = useState(0);

  const getRanking = () => {
    getRankingInfo(null, getContestId()).then((rankingInfo) => {
      setRanking(rankingInfo);
    });
  };

  if (nowRankingVersion !== rankingVersion) {
    setNowRankingVersion(rankingVersion);
    getRanking();
  }

  useEffect(() => {
    getRanking();
  }, []);

  let myRank = '';
  if (ranking?.requestAccountRank) {
    myRank = `順位: ${ranking.requestAccountRank}`;
  }

  return (
    <>
      <p>{myRank}</p>
      {ranking && (
        <RankingTable
          myAccountName={accountName}
          problems={problems}
          ranking={ranking}
        />
      )}
      <Button onClick={getRanking} variant="secondary">
        更新
      </Button>
    </>
  );
};

RankingElement.propTypes = {
  problems: PropTypes.array.isRequired,
  rankingVersion: PropTypes.number.isRequired,
};

interface ProblemsTabProps {
  contestName: string;
  problems: ProblemInfo[];
  submissions: SubmissionInfo[];
}
interface SubmitFormProps {
  tabKey: string;
  answerInput: React.RefObject<HTMLInputElement>;
  submitAnswer: () => void;
  nowSubmissions: any[];
  lengthOfTab: number;
}

const AnswerSubmitForm: React.VFC<SubmitFormProps> = ({
  tabKey,
  answerInput,
  submitAnswer,
  nowSubmissions,
  lengthOfTab,
}) => {
  if (tabKey !== KEY_OF_MY_SUBMISSIONS) {
    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement> | undefined
    ) => {
      if (e?.key === 'Enter' && e?.ctrlKey) {
        // or just (e.key==="Enter")
        submitAnswer();
      }
    };

    return (
      <div>
        <Form.Label>答え</Form.Label>
        <Form.Control
          type={'text'}
          onKeyDown={handleKeyDown}
          ref={answerInput}
          placeholder="Ctrl+Enterで提出"
        />
        <Button type={'primary'} onClick={submitAnswer}>
          提出
        </Button>
      </div>
    );
  } else {
    return (
      <SubmissionTable submissions={nowSubmissions} problemNum={lengthOfTab} />
    );
  }
};

const ProblemsTab: React.FC<ProblemsTabProps> = ({ problems, submissions }) => {
  const answerInput = React.createRef<HTMLInputElement>();
  const [comment, setComment] = useState('');
  const [key, setKey] = useState(KEY_OF_MY_SUBMISSIONS);
  const [changeColor, setChangeColor] = useState(true);
  const [firstTabRender, setFirstTabRender] = useState(false);
  const [nowSubmissions, setNowSubmission] = useState<any[]>([]);
  const [rankingVersion, setRankingVersion] = useState(0);
  const TAB_ID = 'tabId';
  if (
    !firstTabRender &&
    ((problems.length !== 0 && submissions.length !== 0) ||
      nowSubmissions.length !== 0)
  ) {
    setFirstTabRender(true);
  }

  const submitAnswer = (): void => {
    if (answerInput.current?.value === '') {
      return setComment('答えが空です');
    }
    if (answerInput.current?.value.indexOf(':') !== -1) {
      return setComment(': を含む答えは提出できません');
    }
    setComment('');

    postSubmission(getContestId(), key, answerInput.current.value)
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
    return problems.map((problem: ProblemInfo, index: number) => {
      const problemTitle = createEnglishIndex(index, problems.length);
      return (
        <Tab
          eventKey={index.toString()}
          key={problem.indexOfContest}
          title={problemTitle}
        >
          <h6>{'point: ' + problem.point}</h6>
          <div className={'div-pre'}>
            <p>{problem.statement}</p>
          </div>
        </Tab>
      );
    });
  };

  const selectTab = (key: any) => {
    setComment('');
    setChangeColor(true);
    setKey((key ?? '').toString());
    if (answerInput.current) {
      answerInput.current.value = '';
    }
  };

  useEffect(() => {
    const getSubmitResultArray = () => {
      //初期化時はprops、そうでない場合nowSubmissionsが新しい値 更新されている場合、要素数が多い
      let useSubmissions;
      if (nowSubmissions.length < submissions.length) {
        useSubmissions = submissions;
      } else {
        useSubmissions = nowSubmissions;
      }
      const tryingArray = new Array(problems.length).fill('NO_SUB');
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
      problems.map((_: ProblemInfo, index: number) => {
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

  return (
    <div>
      <Tabs id={TAB_ID} activeKey={key} onSelect={selectTab}>
        {getProblemTabList()}
        <Tab eventKey={'mySubmit'} key={'mySubmit'} title={'自分の提出'} />
      </Tabs>
      <AnswerSubmitForm
        tabKey={key}
        answerInput={answerInput}
        submitAnswer={submitAnswer}
        nowSubmissions={nowSubmissions}
        lengthOfTab={problems.length}
      />
      <p>{comment}</p>
      <hr />
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
  const [submissions, setSubmissions] = useState<SubmissionInfo[]>([]);
  const [problems, setProblems] = useState<ProblemInfo[]>([]);
  const [ratingUpdateButtonStyle, setRatingUpdateButtonStyle] = useState({
    display: 'none',
  });
  const [contestEditButtonStyle, setContestEditButtonStyle] = useState({
    display: 'none',
  });
  const ratingUpdate = () => {
    updateContestRating(getContestId())
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
    const contestId = getContestId();
    (async () => {
      const contestInfo = await getContestInfo(contestId).catch(() => null);
      if (contestInfo === null) {
        setContestName('コンテストが見つかりません');
        return;
      }
      const problems = await getContestProblems(contestId).catch(() => []);
      let submissions: SubmissionInfo[];
      const cookieArray = getCookie();
      if (cookieArray['_sforce_account_name']) {
        const accountName = cookieArray['_sforce_account_name'];
        submissions = await getSubmission(getContestId(), accountName);
        const accountInfo = await getAccountInformation(accountName);
        if (
          accountInfo.auth === 'ADMINISTER' &&
          !contestInfo.ratingCalculated &&
          contestInfo.ratedBound > 0 &&
          contestInfo.unixEndTime < Date.now()
        ) {
          setRatingUpdateButtonStyle({ display: 'block' });
        }
        if (
          contestInfo.contestCreators.find(
            (creator) => creator.accountName === accountName
          )
        ) {
          setContestEditButtonStyle({ display: 'block' });
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
      <Button
        onClick={ratingUpdate}
        variant={'info'}
        style={ratingUpdateButtonStyle}
      >
        {'レート更新'}
      </Button>
      <Button
        onClick={ratingUpdate}
        variant={'info'}
        style={ratingUpdateButtonStyle}
      >
        {'レート更新'}
      </Button>
      <Link to={`/contest/${getContestId()}/edit`}>
        <Button variant={'info'} style={contestEditButtonStyle}>
          {'コンテスト編集'}
        </Button>
      </Link>
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
