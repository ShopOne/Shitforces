import { VFC, createRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Tabs from 'react-bootstrap/Tabs';
import { SelectCallback } from 'react-bootstrap/esm/helpers';
import { PagingElement } from '../../components/PagingElement';
import {
  getContestSubmissionsOfRaid,
  postSubmission,
} from '../../functions/HttpRequest';
import { createEnglishIndex } from '../../functions/createEnglishIndex';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import {
  ContestSubmissionOfRaid,
  ContestType,
  ProblemInfo,
  SubmissionInfo,
  SubmissionResultType,
} from '../../types';
import { AnswerSubmitForm } from './AnswerSubmitForm';
import { ContestStandingsElement } from './ContestStandingsElement';
import { SubmissionTable } from './SubmissionTable';

interface ProblemTabElementProps {
  problemInfo: ProblemInfo;
  contestType: string;
}
const ProblemTabElement: VFC<ProblemTabElementProps> = ({
  problemInfo,
  contestType,
}) => {
  const SUBMISSION_IN_ONE_PAGE = 10;
  const [submissionsOfRaid, setSubmissionsOfRaid] = useState<
    ContestSubmissionOfRaid[]
  >([]);
  const [page, setPage] = useState(0);
  const getSubmissionTableOfRaid = () => {
    const tBody: JSX.Element[] = [];
    submissionsOfRaid.forEach(
      (submission: ContestSubmissionOfRaid, index: number) => {
        if (
          page * SUBMISSION_IN_ONE_PAGE <= index &&
          index < (page + 1) * SUBMISSION_IN_ONE_PAGE
        ) {
          tBody.push(
            <tr key={submission.statement}>
              <td>{submission.statement}</td>
              <td>{submission.submitCount}</td>
              <td>{submission.accepted ? 'ACCEPTED' : 'WRONG_ANSWER'}</td>
            </tr>
          );
        }
      }
    );
    // デザイン調節用
    let cnt = 0;
    while (tBody.length < SUBMISSION_IN_ONE_PAGE) {
      // : を含む提出は出来ないのでkeyは被らない
      tBody.push(
        <tr key={`${cnt}:`}>
          <td style={{ visibility: 'hidden' }}>{'A'}</td>
          <td style={{ visibility: 'hidden' }}>{'B'}</td>
          <td style={{ visibility: 'hidden' }}>{'C'}</td>
        </tr>
      );
      cnt++;
    }

    return (
      <div style={{ background: '#ccccff', zIndex: 4 }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>解答</th>
              <th>提出回数</th>
              <th>結果</th>
            </tr>
          </thead>
          <tbody>{tBody}</tbody>
        </Table>
        <PagingElement
          totalPages={Math.ceil(
            submissionsOfRaid.length / SUBMISSION_IN_ONE_PAGE
          )}
          currentPage={page}
          onChange={setPage}
          savePaging={false}
          marginPx={10}
        />
      </div>
    );
  };
  const setSubmissions = async () => {
    const submissions = await getContestSubmissionsOfRaid(
      findContestIdFromPath(),
      problemInfo.indexOfContest
    );
    setSubmissionsOfRaid(submissions);
  };
  const getOverLayForRaid = () => {
    return (
      <OverlayTrigger
        rootClose={true}
        trigger={'click'}
        delay={0}
        defaultShow={false}
        onToggle={setSubmissions}
        flip={true}
        overlay={getSubmissionTableOfRaid()}
        placement={'right-start'}
      >
        <Button variant={'primary'}>みんなの解答を見る</Button>
      </OverlayTrigger>
    );
  };

  return (
    <>
      <h6>{`point: ${problemInfo.point}`}</h6>
      {problemInfo.quiz ? (
        <h4 style={{ color: 'red' }}>※この問題は最初の提出のみ有効です！！</h4>
      ) : null}
      {contestType === 'RAID' ? getOverLayForRaid() : null}
      <div className={'div-pre'}>
        <p>{problemInfo.statement}</p>
      </div>
    </>
  );
};

interface ProblemsTabProps {
  contestName: string;
  problems: ProblemInfo[];
  submissions: SubmissionInfo[];
  contestType: ContestType;
}

const KEY_OF_SUBMISSIONS_TAB = 'mySubmit';
export const ProblemsTab: VFC<ProblemsTabProps> = ({
  problems,
  submissions,
  contestType,
}) => {
  const {
    TAB_ID,
    selectedTab,
    selectTab,
    answerInput,
    submitAnswer,
    nowSubmissions,
    comment,
    standingsVersion,
    myScore,
  } = useProblemsTab(problems, submissions);

  return (
    <>
      <Tabs id={TAB_ID} activeKey={selectedTab} onSelect={selectTab}>
        {problems.map((problem, index: number) => (
          <Tab
            eventKey={index.toString()}
            key={problem.indexOfContest}
            title={createEnglishIndex(index)}
          >
            <ProblemTabElement
              problemInfo={problem}
              contestType={contestType}
            />
          </Tab>
        ))}
        <Tab eventKey={'mySubmit'} key={'mySubmit'} title={'自分の提出'} />
      </Tabs>
      {selectedTab !== KEY_OF_SUBMISSIONS_TAB ? (
        <AnswerSubmitForm
          answerInput={answerInput}
          submitAnswer={submitAnswer}
        />
      ) : (
        <SubmissionTable submissions={nowSubmissions} score={myScore} />
      )}
      <p>{comment}</p>
      <hr />
      {/* TODO: contestランキングをリフトアップする。problemsTabとContestStandingsは従属関係にないため。*/}
      <ContestStandingsElement
        problems={problems}
        standingsVersion={standingsVersion}
        contestType={contestType}
      />
    </>
  );
};

const useProblemsTab = (
  problems: ProblemInfo[],
  submissions: SubmissionInfo[]
) => {
  const answerInput = createRef<HTMLInputElement>();
  const [comment, setComment] = useState('');
  const [selectedTab, setSelectedTab] = useState(KEY_OF_SUBMISSIONS_TAB);
  const [changeColor, setChangeColor] = useState(true);
  const [firstTabRender, setFirstTabRender] = useState(false);
  const [nowSubmissions, setNowSubmission] = useState<SubmissionInfo[]>([]);
  const [standingsVersion, setStandingsVersion] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myAccountFavs, setMyAccountFavs] = useState<boolean[]>([]);
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

    postSubmission(
      findContestIdFromPath(),
      selectedTab,
      answerInput.current.value
    )
      .then((submitResult) => {
        const newSubmissions = nowSubmissions.slice();

        newSubmissions.unshift(submitResult);
        setNowSubmission(newSubmissions);
        setComment(submitResult.result);
        // ContestStandingsElement再読込のため、バージョニング
        setStandingsVersion(standingsVersion + 1);
      })
      .catch((e) => {
        if (e.message === '401') {
          setComment('5秒間隔を空けて提出して下さい');
        } else if (e.message === '400') {
          setComment('ログインして下さい');
        } else {
          setComment('提出に失敗しました 再ログインを試してみて下さい');
        }
      });
  };

  const selectTab: SelectCallback = (key) => {
    setComment('');
    setChangeColor(true);
    setSelectedTab((key ?? '').toString());
    if (answerInput.current) {
      answerInput.current.value = '';
    }
  };

  useEffect(() => {
    (async () => {
      const getSubmitResultArray = () => {
        //初期化時はprops、そうでない場合nowSubmissionsが新しい値 更新されている場合、要素数が多い
        const useSubmissions =
          nowSubmissions.length < submissions.length
            ? submissions
            : nowSubmissions;

        const submissionResults: (
          | SubmissionResultType
          | 'NO_SUB'
        )[] = new Array(problems.length).fill('NO_SUB');
        useSubmissions.map((submit: SubmissionInfo) => {
          if (submit.result === 'ACCEPTED') {
            submissionResults[submit.indexOfContest] = 'ACCEPTED';
          } else if (submit.result === 'WRONG_ANSWER') {
            if (submissionResults[submit.indexOfContest] === 'NO_SUB') {
              submissionResults[submit.indexOfContest] = 'WRONG_ANSWER';
            }
          }
        });

        return submissionResults;
      };

      let sumScore = 0;
      const setColor = () => {
        const submitResult = getSubmitResultArray();
        problems.map((problemInfo: ProblemInfo, index: number) => {
          const element = document.getElementById(`${TAB_ID}-tab-${index}`);
          element?.classList.remove('bg-success', 'text-white', 'bg-warning');

          switch (submitResult[index]) {
            case 'ACCEPTED':
              element?.classList.add('bg-success');
              element?.classList.add('text-white');
              sumScore += problemInfo.point;
              break;
            case 'WRONG_ANSWER':
              element?.classList.add('bg-warning');
              element?.classList.add('text-white');
              break;
          }
        });
      };
      setColor();
      setChangeColor(false);
      setFirstTabRender(false);
      setMyScore(sumScore);
      //初期化時のみ
      if (nowSubmissions.length === 0) {
        setNowSubmission(submissions);
      }
    })();
  }, [changeColor, firstTabRender]);
  useEffect(() => {
    const ele = answerInput.current;
    ele?.focus();
  }, [selectedTab]);

  return {
    TAB_ID,
    selectedTab,
    selectTab,
    answerInput,
    submitAnswer,
    nowSubmissions,
    comment,
    standingsVersion,
    myScore,
  };
};
