import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Button from "react-bootstrap/Button";
import Col from 'react-bootstrap/Col';
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import {MutableListElement} from "../components/MutableListElement";
import {getCookieArray} from "../functions/GetCookieArray";
import {getContestInfo, getContestProblems, getProblemAnswer, putContestInfo} from "../functions/HttpRequest";
import {ContestCreator} from "../types";

// URL: /contest/$contestName/edit

function getContestId() {
  const splitPath = window.location.pathname.split('/');
  return splitPath.slice()[2];
}
class EditProblemInfo {
  statement: string;
  id: number
  point: number;
  answer: string[];
  constructor(statement: string, id: number, point: number, answer: string[]) {
    this.statement = statement;
    this.id = id;
    this.point = point;
    this.answer = answer;
  }
}
interface EditProblemsElementProps {
  problems: EditProblemInfo[];
  setProblems(problems: EditProblemInfo[]): void;
}
const EditProblemsElement: React.FC<EditProblemsElementProps> = ({
  problems,
  setProblems
}) => {
  const updateProblemStatement = (idx: number, statement: string) => {
    const newProblems = [...problems];
    newProblems[idx].statement = statement;
    setProblems(newProblems);
  }
  const updateProblemPoint = (idx: number, point: string) => {
    const newProblems = [...problems];
    const newPoint = parseInt(point);
    if (isNaN(newPoint)) {
      return;
    }
    newProblems[idx].point = newPoint;
    setProblems(newProblems);
  }
  const eraseProblem = (idx: number) => {
    if (problems.length === 1) {
      return;
    }
    const newProblems = problems.filter((_,problemIdx) => problemIdx !== idx);
    setProblems(newProblems);
  };
  const addProblem = () => {
    const newProblems = [...problems];
    let newId = problems.slice(-1)[0].id + 1;
    newProblems.push(new EditProblemInfo('', newId, 1, ['']));
    setProblems(newProblems);
  }
  const setNewAnswer = (idx: number, newAnswer: string[]) => {
    const newProblems = [...problems];
    newProblems[idx].answer = newAnswer;
    setProblems(newProblems);
  }
  const listGroups =  problems.map((problem) => {
    const popOver = (
      <Popover id={'popover-basic'}>
        <Popover.Content>
          <MutableListElement
            items={problem.answer}
            setItems={(newAnswer: string[]) => {setNewAnswer(problem.id, newAnswer)}}/>
        </Popover.Content>
      </Popover>
    );
    return (
      <Form.Row key={problem.id} >
        <Col>
          <Form.Label>問題文</Form.Label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              placeholder={'〇〇な△△な〜んだ？'}
              value={problem.statement}
              onChange={e => updateProblemStatement(problem.id, e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col>
          <Form.Label>点数</Form.Label>
          <InputGroup className={'mb-3'}>
            <Form.Control
              type={'number'}
              value={problem.point}
              onChange={e => updateProblemPoint(problem.id, e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col>
          <br/>
          <OverlayTrigger trigger={'click'} placement={'right'} overlay={popOver}>
            <Button variant={'primary'}>答え編集</Button>
          </OverlayTrigger>
        </Col>
        <Col>
          <br/>
          <button type={'button'} onClick={addProblem}>+</button>
          <button type={'button'} onClick={() => eraseProblem(problem.id)}>-</button>
        </Col>
      </Form.Row>
    );
  });
  return (
    <div>
      {listGroups}
    </div>
  )
}
EditProblemsElement.propTypes = {
  problems: PropTypes.array.isRequired,
  setProblems: PropTypes.func.isRequired
}

export const ContestEditPage: React.FC = () => {
  const [isValidAccess ,setIsValidAccess] = useState<boolean>(false);
  const [statement ,setStatement] = useState<string>('');
  const [penalty ,setPenalty] = useState<string>('');
  const [problems, setProblems] = useState<EditProblemInfo[]>([]);
  useEffect(() => {
    (async () => {
      const contestId = getContestId();
      const contestInfo = await getContestInfo(contestId).catch(() => null);
      const contestProblems = await getContestProblems(contestId).catch(() => null);
      const cookieArray = getCookieArray();
      let accountName: String|null = null;
      if (cookieArray['_sforce_account_name']) {
        accountName = cookieArray['_sforce_account_name'];
      }
      if (!contestInfo || !contestProblems ||
        !contestInfo.contestCreators.find((creator: ContestCreator) => creator.accountName === accountName)) {
        return;
      }
      const answers: string[][] = await Promise.all(contestProblems.map((problem) => {
        return getProblemAnswer(problem.id);
      }));
      const problems = contestProblems.map((problem: any, idx: number) => {
        if (answers[idx].length === 0) {
          answers[idx].push('');
        }
        return new EditProblemInfo(problem.statement, idx, problem.point, answers[idx]);
      });
      if (problems.length === 0) {
        problems.push(new EditProblemInfo('', 0, 1, ['']));
      }
      setStatement(contestInfo.statement);
      setPenalty(contestInfo.penalty.toString());
      setProblems(problems)
      setIsValidAccess(true);
    })();
  }, []);
  if (!isValidAccess) {
    return null;
  }

  const putContestInfoFunction = () => {
    const sendProblems = problems.map((problem) => {
      return {
        statement: problem.statement,
        point: problem.point,
        answer: problem.answer
      };
    });
    putContestInfo(getContestId(), parseInt(penalty), statement, sendProblems)
      .then(() => {
        alert('コンテストの編集が完了しました');
        window.location.href = `/contest/${getContestId()}`
      })
      .catch((e) => {
        alert('コンテストの編集に失敗しました');
        console.log(e);
      });
  };

  return (
    <div>
      <p>コンテスト中は問題の編集を行っても反映されません</p>
      <Form>
          <Form.Row>
            <Col>
              <Form.Label>コンテスト説明</Form.Label>
              <InputGroup className={'mb-3'}>
                <Form.Control
                  placeholder={'くそなぞなぞコンテストです\n問題が出ます'}
                  as={'textarea'}
                  value={statement}
                  onChange={(e) => {setStatement(e.target.value)}}/>
              </InputGroup>
            </Col>
            <Col>
              <Form.Label>ペナルティ(秒)</Form.Label>
              <InputGroup className={'mb-3'}>
                <Form.Control
                  placeholder={'300'}
                  value={penalty}
                  type={'number'}
                  onChange={(e) => {setPenalty(e.target.value)}}/>
              </InputGroup>
            </Col>
          </Form.Row>
        <Form.Row>
          <Col>
            <Form.Label>問題</Form.Label>
            <EditProblemsElement
              problems={problems}
              setProblems={setProblems}/>
          </Col>
        </Form.Row>
        <br/>
        <Button
          onClick={putContestInfoFunction}
          variant={'success'}>
          確定
        </Button>
      </Form>
    </div>
  );
};
