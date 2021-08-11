import PropTypes from 'prop-types';
import { FC, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from 'react-beautiful-dnd';
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
import { isMobile } from '../functions/isMobile';
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
const EditProblemsElement: FC<EditProblemsElementProps> = ({
  problems,
  setProblems,
}) => {
  const columnHeight = isMobile() ? 150 : 100;
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
    const newId = problems.slice(-1)[0].id + 1;
    newProblems.push(new EditProblemInfo('', newId, 1, [''], false));
    setProblems(newProblems);
  };
  const setNewAnswer = (idx: number, newAnswer: string[]) => {
    const newProblems = [...problems];
    newProblems[idx].answer = newAnswer;
    setProblems(newProblems);
  };
  const UP_REARRANGE = 'UP';
  const DOWN_REARRANGE = 'DOWN';
  const rearrangeProblem = (idx: number, direction: string) => {
    const newProblems = [...problems];
    if (direction === UP_REARRANGE && idx !== 0) {
      const tmp = newProblems[idx];
      newProblems[idx] = newProblems[idx - 1];
      newProblems[idx - 1] = tmp;
    }
    if (direction === DOWN_REARRANGE && idx !== newProblems.length - 1) {
      const tmp = newProblems[idx];
      newProblems[idx] = newProblems[idx + 1];
      newProblems[idx + 1] = tmp;
    }
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
          <div
            style={{
              height: columnHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <OverlayTrigger
              rootClose={true}
              trigger={'click'}
              placement="bottom"
              overlay={popOver}
            >
              <Button variant={'primary'}>答え編集</Button>
            </OverlayTrigger>
          </div>
        </Col>
        <Col>
          <div
            style={{
              height: columnHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <InputGroup className={'mb-3'}>
              <Form.Control
                type={'number'}
                value={problem.point}
                onChange={(e) => updateProblemPoint(idx, e.target.value)}
              />{' '}
            </InputGroup>
            <p style={{ marginLeft: 12 }}>点</p>
          </div>
        </Col>
        <Col>
          {' '}
          <div
            style={{
              height: columnHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '1.125rem',
            }}
          >
            <Form.Switch
              id={`${problem.id} switch`}
              type={'switch'}
              label={'Enable Quiz Mode'}
              defaultChecked={problem.isQuiz}
              onChange={(e) => {
                updateProblemQuizMode(idx, e.target.checked);
              }}
            />
          </div>
        </Col>
        <Col>
          <div
            style={{
              height: columnHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button type={'button'} onClick={addProblem}>
              +
            </button>
            <button type={'button'} onClick={() => eraseProblem(idx)}>
              -
            </button>
            <button
              type={'button'}
              onClick={() => rearrangeProblem(idx, UP_REARRANGE)}
            >
              ↑
            </button>
            <button
              type={'button'}
              onClick={() => rearrangeProblem(idx, DOWN_REARRANGE)}
            >
              ↓
            </button>
          </div>
        </Col>
      </Form.Row>
    );
  });

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newData = Array.from(problems);

    const DraggedData = newData[parseInt(draggableId, 10)];

    newData.splice(source.index, 1);

    newData.splice(destination.index, 0, DraggedData);
    setProblems(newData);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-1">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {listGroups.map((list, index) => (
              <Draggable
                draggableId={index.toString()}
                key={index}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      height: columnHeight,
                    }}
                  >
                    <h4>{list}</h4>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
EditProblemsElement.propTypes = {
  problems: PropTypes.array.isRequired,
  setProblems: PropTypes.func.isRequired,
};

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
      let accountName: string | null = null;
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

// eslint-disable-next-line import/no-default-export
export default ContestEditPage;
