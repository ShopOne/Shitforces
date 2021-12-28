import { FC } from 'react';
import {
  OnDragEndResponder,
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';
import {
  Popover,
  Form,
  Col,
  InputGroup,
  OverlayTrigger,
  Button,
} from 'react-bootstrap';
import { MutableListElement } from '../../components/MutableListElement';
import { isMobile } from '../../functions/isMobile';
import { EditProblemInfo } from '.';

interface EditProblemsElementProps {
  problems: EditProblemInfo[];
  setProblems(problems: EditProblemInfo[]): void;
}
export const EditProblemsElement: FC<EditProblemsElementProps> = ({
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
