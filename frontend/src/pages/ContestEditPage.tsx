import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { MutableListElement } from '../components/MutableListElement';
import {
  getContestInfo,
  getContestProblems,
  getProblemAnswer,
  patchContestInfo,
  putContestInfo,
} from '../functions/HttpRequest';
import { findContestIdFromPath } from '../functions/findContestIdFromPath';
import { getCookie } from '../functions/getCookie';
import { ContestCreator } from '../types';
import './ContestEditPage.css';

// URL: /contest/$contestName/edit

class EditProblemInfo {
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
interface EditProblemsElementProps {
  problems: EditProblemInfo[];
  setProblems(problems: EditProblemInfo[]): void;
}
const EditProblemsElement: React.FC<EditProblemsElementProps> = ({
  problems,
  setProblems,
}) => {
  const updateProblemStatement = (idx: number, statement: string) => {
    const newProblems = [...problems];
    newProblems[idx].statement = statement;
    setProblems(newProblems);
  };
  const updateProblemQuizMode = (idx: number, isQuiz: boolean) => {
    const newProblems = [...problems];
    newProblems[idx].isQuiz = isQuiz;
    setProblems(newProblems);
  };
  const updateProblemPoint = (idx: number, point: string) => {
    const newProblems = [...problems];
    let newPoint: number | undefined = parseInt(point);
    if (isNaN(newPoint)) {
      newPoint = undefined;
    }
    newProblems[idx].point = newPoint;
    setProblems(newProblems);
  };
  const eraseProblem = (idx: number) => {
    if (problems.length === 1) {
      return;
    }
    const newProblems = problems.filter((_, problemIdx) => problemIdx !== idx);
    setProblems(newProblems);
  };
  const addProblem = () => {
    const newProblems = [...problems];
    let newId = problems.slice(-1)[0].id + 1;
    newProblems.push(new EditProblemInfo('', newId, 1, [''], false));
    setProblems(newProblems);
  };
  const setNewAnswer = (idx: number, newAnswer: string[]) => {
    const newProblems = [...problems];
    newProblems[idx].answer = newAnswer;
    setProblems(newProblems);
  };
  const listGroups = problems.map((problem, idx) => {
    const popOver = (
      <Popover id={'popover-basic'}>
        <Popover.Content>
          <MutableListElement
            items={problem.answer}
            setItems={(newAnswer: string[]) => {
              setNewAnswer(idx, newAnswer);
            }}
          />
        </Popover.Content>
      </Popover>
    );
    return (
      <Form.Row key={problem.id}>
        <Col>
          <Form.Label>問題文</Form.Label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              as={'textarea'}
              placeholder={'〇〇な△△な〜んだ？'}
              value={problem.statement}
              onChange={(e) => updateProblemStatement(idx, e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col>
          <Form.Label>点数</Form.Label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              type={'number'}
              value={problem.point}
              onChange={(e) => updateProblemPoint(idx, e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col>
          <Form.Label>Quizモード</Form.Label>
          <Form.Switch
            id={`${problem.id} switch`}
            type={'switch'}
            label={'off/on'}
            defaultChecked={problem.isQuiz}
            onChange={(e) => {
              updateProblemQuizMode(idx, e.target.checked);
            }}
          />
        </Col>
        <Col>
          <br />
          <OverlayTrigger
            rootClose={true}
            trigger={'click'}
            placement={'right'}
            overlay={popOver}
          >
            <Button variant={'primary'}>答え編集</Button>
          </OverlayTrigger>
        </Col>
        <Col>
          <br />
          <button type={'button'} onClick={addProblem}>
            +
          </button>
          <button type={'button'} onClick={() => eraseProblem(problem.id)}>
            -
          </button>
        </Col>
      </Form.Row>
    );
  });
  return <div>{listGroups}</div>;
};
EditProblemsElement.propTypes = {
  problems: PropTypes.array.isRequired,
  setProblems: PropTypes.func.isRequired,
};

export const ContestEditPage: React.FC = () => {
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
      let accountName: String | null = null;
      if (cookie['_sforce_account_name']) {
        accountName = cookie['_sforce_account_name'];
      }
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
      const problems = contestProblems.map((problem: any, idx: number) => {
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
      });
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
    <div>
      <p>コンテスト開始後に点数、答え、問題数は変更できません</p>
      <p>
        Quizモードにした場合、順位として有効な提出は最初の一回のみとなります
      </p>
      <p>問題を選択肢形式にする場合等にご利用下さい</p>
      <Form>
        <Form.Row>
          <Col>
            <Form.Label>コンテスト説明</Form.Label>
            <InputGroup className={'mb-3'}>
              <Form.Control
                placeholder={'くそなぞなぞコンテストです\n問題が出ます'}
                as={'textarea'}
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
        <Form.Row>
          <Col>
            <Form.Label>問題</Form.Label>
            <EditProblemsElement
              problems={problems}
              setProblems={setProblems}
            />
          </Col>
        </Form.Row>
        <br />
        <Button onClick={updateContestInfoFunction} variant={'success'}>
          確定
        </Button>
      </Form>
    </div>
  );
};
