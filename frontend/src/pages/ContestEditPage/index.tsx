import { FC, useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {
  getContestInfo,
  getContestProblems,
  getProblemAnswer,
  patchContestInfo,
  putContestInfo,
} from '../../functions/HttpRequest';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import { getCookie } from '../../functions/getCookie';
import { ContestCreator, ProblemInfo } from '../../types';
import './ContestEditPage.css';
import { EditProblemsElement } from './EditProblemElement';

// URL: /contest/$contestName/edit

export class EditProblemInfo {
  statement: string;
  id: number;
  point: number | undefined;
  answer: string[];
  isQuiz: boolean;
  constructor(
    statement: string,
    id: number,
    point: number,
    answer: string[],
    izQuiz: boolean
  ) {
    this.statement = statement;
    this.id = id;
    this.point = point;
    this.answer = answer;
    this.isQuiz = izQuiz;
  }
}

const ContestEditPage: FC = () => {
  const [isValidAccess, setIsValidAccess] = useState<boolean>(false);
  const [statement, setStatement] = useState<string>('');
  const [penalty, setPenalty] = useState<string>('');
  const [problems, setProblems] = useState<EditProblemInfo[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const contestId = findContestIdFromPath();
      const contestInfo = await getContestInfo(contestId).catch(() => null);
      const contestProblems = await getContestProblems(contestId).catch(
        () => null
      );
      const cookie = getCookie();
      const accountName = cookie['_sforce_account_name'] ?? null;

      if (
        !contestInfo ||
        !contestProblems ||
        !contestInfo.contestCreators.find(
          (creator: ContestCreator) => creator.accountName === accountName
        )
      ) {
        return;
      }
      const answers: string[][] = await Promise.all(
        contestProblems.map((problem) => {
          return getProblemAnswer(problem.id);
        })
      );
      const problems = contestProblems.map(
        (problem: ProblemInfo, idx: number) => {
          if (answers[idx].length === 0) {
            answers[idx].push('');
          }

          return new EditProblemInfo(
            problem.statement,
            idx,
            problem.point,
            answers[idx],
            problem.quiz
          );
        }
      );
      if (problems.length === 0) {
        problems.push(new EditProblemInfo('', 0, 1, [''], false));
      }
      setStatement(contestInfo.statement);
      setPenalty(contestInfo.penalty.toString());
      setProblems(problems);
      setIsValidAccess(true);
      setStartTime(contestInfo.unixStartTime);
    })();
  }, []);
  if (!isValidAccess) {
    return null;
  }

  const updateContestInfoFunction = () => {
    const nowDate = new Date();
    const nowTime = nowDate.getTime();
    const updateFunction = (() => {
      if (nowTime < startTime) {
        return putContestInfo;
      } else {
        return patchContestInfo;
      }
    })();
    const sendProblems = problems.map((problem) => {
      let point = problem.point;
      if (point === undefined) {
        point = 0;
      }

      return {
        statement: problem.statement,
        point: point,
        answer: problem.answer,
        isQuiz: problem.isQuiz,
      };
    });
    updateFunction(
      findContestIdFromPath(),
      parseInt(penalty),
      statement,
      sendProblems
    )
      .then(() => {
        alert('コンテストの編集が完了しました');
        window.location.href = `/contest/${findContestIdFromPath()}`;
      })
      .catch((e) => {
        alert('コンテストの編集に失敗しました');
        console.log(e);
      });
  };

  return (
    <div style={{ width: 'inherit' }}>
      <div
        style={{
          width: 'full',
          height: 'full',
          marginTop: 30,
          padding: 20,
        }}
      >
        <div style={{ color: '#6B7280', lineHeight: '120%' }}>
          <p>コンテスト開始後に点数、答え、問題数は変更できません</p>
          <p>
            Quizモードにした場合、順位として有効な提出は最初の一回のみとなります
          </p>
          <p>問題を選択肢形式にする場合等にご利用下さい</p>
          <p>
            <span style={{ fontWeight: 700 }}>New</span>: ドラッグ &
            ドロップで問題順序が入れ替えられるようになりました
          </p>
        </div>
        <div style={{ width: 'full', marginTop: 50 }}>
          <Form>
            <Form.Row>
              <Col>
                <Form.Label>コンテスト説明</Form.Label>
                <InputGroup className={'mb-3'}>
                  <Form.Control
                    placeholder={'くそなぞなぞコンテストです\n問題が出ます'}
                    as="textarea"
                    value={statement}
                    onChange={(e) => {
                      setStatement(e.target.value);
                    }}
                  />
                </InputGroup>
              </Col>
              <Col>
                <Form.Label>ペナルティ(秒)</Form.Label>
                <InputGroup className={'mb-3'}>
                  <Form.Control
                    placeholder={'300'}
                    value={penalty}
                    type={'number'}
                    onChange={(e) => {
                      setPenalty(e.target.value);
                    }}
                  />
                </InputGroup>
              </Col>
            </Form.Row>
            <div style={{ marginTop: 30 }}>
              <Form.Row>
                <Col>
                  <EditProblemsElement
                    problems={problems}
                    setProblems={setProblems}
                  />
                </Col>
              </Form.Row>
            </div>
            <br />
            <Button onClick={updateContestInfoFunction} variant={'success'}>
              確定
            </Button>
          </Form>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}></div>
    </div>
  );
};

export default ContestEditPage;
