import { FC, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { ADMINISTRATOR } from '../../constants';
import {
  getAccountInformation,
  getContestInfo,
  getContestProblems,
  getSubmission,
  updateContestRating,
} from '../../functions/HttpRequest';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import { getCookie } from '../../functions/getCookie';
import {
  AccountInfo,
  ContestInfo,
  ContestType,
  ProblemInfo,
  SubmissionInfo,
} from '../../types';
import './index.css';
import { ProblemsTab } from './ProblemsTab';

// URL: /contest/$contestId
const ContestPage: FC = () => {
  const {
    ratingUpdate,
    ratingUpdateButtonStyle,
    contestEditButtonStyle,
    contestName,
    statement,
    time,
    problems,
    submissions,
    contestType,
  } = useContestPage();

  return (
    <div>
      <Button
        onClick={ratingUpdate}
        variant={'info'}
        style={ratingUpdateButtonStyle}
      >
        {'レート更新'}
      </Button>
      <Link to={`/contest/${findContestIdFromPath()}/edit`}>
        <Button variant={'info'} style={contestEditButtonStyle}>
          コンテスト編集
        </Button>
      </Link>
      <p id={'contestPage-contestName'}>{contestName}</p>
      <p>
        {/* FIXME: <pre> cannot appear as a descendant of <p>.*/}
        <pre>{statement}</pre>
      </p>
      <p id={'contestPage-timeSpan'}>{time}</p>
      {problems && contestName && submissions && contestType && (
        <ProblemsTab
          problems={problems}
          contestName={contestName}
          submissions={submissions}
          contestType={contestType}
        />
      )}
    </div>
  );
};

const useContestPage = () => {
  const [contestName, setContestName] = useState('');
  const [statement, setStatement] = useState('');
  const [contestType, setContestType] = useState<ContestType | null>(null);
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
    updateContestRating(findContestIdFromPath())
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
    const contestId = findContestIdFromPath();

    const request = {
      contestInfo(contestId: string) {
        return getContestInfo(contestId);
      },
      problems(contestId: string) {
        return getContestProblems(contestId);
      },
      submissions(accountName: string | undefined) {
        if (accountName === undefined) return [];

        return getSubmission(findContestIdFromPath(), accountName);
      },
      accountInfo(contestId: string | undefined) {
        if (contestId === undefined) return null;

        return getAccountInformation(contestId);
      },
    };

    const fetchResources = (
      contestId: string,
      accountName: string | undefined
    ) => {
      // TODO: standingsをこちらで取得する

      return Promise.all([
        request.contestInfo(contestId),
        request.problems(contestId),
        request.submissions(accountName),
        request.accountInfo(accountName),
      ]);
    };

    const fetchData = async () => {
      const cookieArray = getCookie();
      const accountName = cookieArray['_sforce_account_name'];
      const resources = await fetchResources(contestId, accountName).catch(
        (error) => {
          console.error(error);
        }
      );

      if (resources === undefined || resources?.includes(null)) {
        if (!(resources && resources[0])) {
          return setContestName('コンテストが見つかりません');
        }
      }

      const [contestInfo, problems, submissions, accountInfo] = resources;

      setContestName(contestInfo.name);
      setStatement(contestInfo.statement);
      setContestType(contestInfo.contestType);
      setTime(`${contestInfo.startTimeAMPM} ~ ${contestInfo.endTimeAMPM}`);
      setProblems(problems);
      setSubmissions(submissions);

      if (accountInfo) {
        const youCanUpdateRating = (
          accountInfo: AccountInfo,
          contestInfo: ContestInfo
        ) => {
          const isRated = (rateBound: number) => rateBound > 0;

          return (
            accountInfo.auth === ADMINISTRATOR &&
            !contestInfo.ratingCalculated &&
            contestInfo.unixEndTime < Date.now() &&
            isRated(contestInfo.ratedBound)
          );
        };

        if (youCanUpdateRating(accountInfo, contestInfo)) {
          setRatingUpdateButtonStyle({ display: 'block' });
        }
        if (
          contestInfo.contestCreators.find(
            (creator) => creator.accountName === accountName
          )
        ) {
          setContestEditButtonStyle({ display: 'block' });
        }
      }
    };

    fetchData();
  }, []);

  return {
    ratingUpdate,
    ratingUpdateButtonStyle,
    contestEditButtonStyle,
    contestName,
    statement,
    time,
    problems,
    submissions,
    contestType,
  };
};

export default ContestPage;