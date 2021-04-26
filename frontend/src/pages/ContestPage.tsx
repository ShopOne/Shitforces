import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import {
  getAccountInformation,
  getContestInfo,
  getContestProblems,
  getSubmission,
  updateContestRating,
} from '../functions/HttpRequest';
import { getContestId } from '../functions/getContestId';

import { getCookie } from '../functions/getCookie';
import { ProblemInfo, SubmissionInfo } from '../types';
import { ProblemsTab } from './contestPage/ProblemsTab';
import './ContestPage.css';

// URL: /contest/$contestId
export const ContestPage: React.FC = () => {
  const [contestName, setContestName] = useState('');
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
    const asyncFunctions = async () => {
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
    };

    asyncFunctions();
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
