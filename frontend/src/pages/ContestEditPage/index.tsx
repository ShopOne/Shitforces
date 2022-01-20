import {
  Button,
  FormLabel,
  SimpleGrid,
  Box,
  FormControl,
  Textarea,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { FC, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from 'react-beautiful-dnd';
import { NumberSet } from '../../components/NumberSet';
import {
  getContestInfo,
  getContestProblems,
  getProblemAnswer,
  patchContestInfo,
  putContestInfo,
} from '../../functions/HttpRequest';
import { findContestIdFromPath } from '../../functions/findContestIdFromPath';
import { getCookie } from '../../functions/getCookie';
import { isMobile } from '../../functions/isMobile';
import { ContestCreator, ProblemInfo, EditProblemInfo } from '../../types';
import './ContestEditPage.css';
import ProblemEditColumn from './ProblemEditColumn';

// TODO レスポンシブ対応
// URL: /contest/$contestName/edit

interface EditProblemsElementProps {
  problems: EditProblemInfo[];
  setProblems(problems: EditProblemInfo[]): void;
}

const EditProblemsElement: FC<EditProblemsElementProps> = ({
  problems,
  setProblems,
}) => {
  const columnHeight = isMobile() ? 150 : 120;

  const listGroups = problems.map((problem, idx) => {
    return (
      <ProblemEditColumn
        key={problem.id}
        idx={idx}
        setProblems={setProblems}
        problems={problems}
        height={columnHeight}
      />
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
                    <h4 className={'problems-column'}>{list}</h4>{' '}
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

interface SetContestEditInfoProps {
  setStatement(statement: string): void;
  setPenalty(penalty: string): void;
  setProblems(problems: EditProblemInfo[]): void;
  setIsValidAccess(valid: boolean): void;
  setStartTime(startTime: number): void;
}

const setContestEditInfo = async ({
  setStatement,
  setPenalty,
  setProblems,
  setIsValidAccess,
  setStartTime,
}: SetContestEditInfoProps) => {
  const contestId = findContestIdFromPath();
  const contestInfo = await getContestInfo(contestId).catch(() => null);
  const contestProblems = await getContestProblems(contestId).catch(() => null);
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
  const problems = contestProblems.map((problem: ProblemInfo, idx: number) => {
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
};

interface UpdateContestInfoFunctionProps {
  problems: EditProblemInfo[];
  startTime: number;
  penalty: string;
  statement: string;
}

const updateContestInfoFunction = ({
  problems,
  startTime,
  penalty,
  statement,
}: UpdateContestInfoFunctionProps) => {
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

const ContestEditPage: FC = () => {
  const [isValidAccess, setIsValidAccess] = useState<boolean>(false);
  const [statement, setStatement] = useState<string>('');
  const [penalty, setPenalty] = useState<string>('');
  const [problems, setProblems] = useState<EditProblemInfo[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    setContestEditInfo({
      setStatement,
      setPenalty,
      setStartTime,
      setIsValidAccess,
      setProblems,
    });
  }, []);
  if (!isValidAccess) {
    return null;
  }

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
          <FormControl>
            <SimpleGrid columns={2}>
              <Box>
                <div className={'problem-abstract'}>
                  <FormLabel>コンテスト説明</FormLabel>
                  <div className={'mb-3'}>
                    <Textarea
                      className={'problems-abstract-input'}
                      placeholder={'くそなぞなぞコンテストです\n問題が出ます'}
                      as="textarea"
                      value={statement}
                      onChange={(e) => {
                        setStatement(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </Box>
              <Box>
                <div className={'problem-penalty'}>
                  <FormLabel>ペナルティ(秒)</FormLabel>
                  <div className={'mb-3'}>
                    <NumberSet
                      placeholder={'300'}
                      value={penalty}
                      onChange={setPenalty}
                    />
                  </div>
                </div>
              </Box>
            </SimpleGrid>
            <div style={{ marginTop: 30 }}>
              <EditProblemsElement
                problems={problems}
                setProblems={setProblems}
              />
            </div>
            <br />
            <Button
              onClick={() =>
                updateContestInfoFunction({
                  startTime,
                  statement,
                  penalty,
                  problems,
                })
              }
              colorScheme={'green'}
            >
              確定
            </Button>
          </FormControl>
        </div>
      </div>
      <div style={{ marginBottom: 20 }} />
    </div>
  );
};

export default ContestEditPage;
