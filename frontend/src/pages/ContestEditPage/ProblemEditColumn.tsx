import {
  Box,
  Button,
  FormLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Switch,
  Textarea,
} from '@chakra-ui/react';
import { VFC } from 'react';
import { MutableListElement } from '../../components/MutableListElement';
import { NumberSet } from '../../components/NumberSet';
import { EditProblemInfo } from '../../types';

const UP_REARRANGE = 'UP';
const DOWN_REARRANGE = 'DOWN';

const useUsefulHooks = (
  problems: EditProblemInfo[],
  setProblems: (p: EditProblemInfo[]) => void
) => {
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
  const setNewAnswer = (idx: number, newAnswer: string[]) => {
    const newProblems = [...problems];
    newProblems[idx].answer = newAnswer;
    setProblems(newProblems);
  };

  return {
    updateProblemStatement,
    updateProblemQuizMode,
    updateProblemPoint,
    setNewAnswer,
  };
};

interface EditAnswerProps {
  problem: EditProblemInfo;
  setNewAnswer(idx: number, newAnswer: string[]): void;
  idx: number;
}

const EditAnswer: VFC<EditAnswerProps> = ({ problem, setNewAnswer, idx }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button colorScheme={'blue'}>答え編集</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div id={'popover-basic'}>
          <MutableListElement
            items={problem.answer}
            setItems={(newAnswer: string[]) => {
              setNewAnswer(idx, newAnswer);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ChangeProblemsButtonProps {
  height: number;
  setProblems(problems: EditProblemInfo[]): void;
  problems: EditProblemInfo[];
  idx: number;
}
const ChangeProblemsButtons: VFC<ChangeProblemsButtonProps> = ({
  height,
  setProblems,
  problems,
  idx,
}) => {
  const addProblem = () => {
    const newProblems = [...problems];
    const newId = problems.slice(-1)[0].id + 1;
    newProblems.push(new EditProblemInfo('', newId, 1, [''], false));
    setProblems(newProblems);
  };

  const eraseProblem = (idx: number) => {
    if (problems.length === 1) {
      return;
    }
    const newProblems = problems.filter((_, problemIdx) => problemIdx !== idx);
    setProblems(newProblems);
  };

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

  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button type={'button'} onClick={addProblem}>
        +
      </Button>
      <Button type={'button'} onClick={() => eraseProblem(idx)}>
        -
      </Button>
      <Button
        type={'button'}
        onClick={() => rearrangeProblem(idx, UP_REARRANGE)}
      >
        ↑
      </Button>
      <Button
        type={'button'}
        onClick={() => rearrangeProblem(idx, DOWN_REARRANGE)}
      >
        ↓
      </Button>
    </div>
  );
};

interface ProblemEditColumnProps {
  problems: EditProblemInfo[];
  setProblems(problems: EditProblemInfo[]): void;
  idx: number;
  height: number;
}

const ProblemEditColumn: VFC<ProblemEditColumnProps> = ({
  idx,
  setProblems,
  problems,
  height,
}) => {
  const problem = problems[idx];
  const {
    updateProblemStatement,
    updateProblemQuizMode,
    updateProblemPoint,
    setNewAnswer,
  } = useUsefulHooks(problems, setProblems);
  const strPoint = problem.point === undefined ? '' : problem.point.toString();

  return (
    <SimpleGrid columns={5} spacing={10} key={problem.id}>
      <Box>
        <FormLabel>問題文</FormLabel>
        <div className={'mb-3'}>
          <Textarea
            placeholder={'〇〇な△△な〜んだ？'}
            value={problem.statement}
            onChange={(e) => updateProblemStatement(idx, e.target.value)}
          />
        </div>
      </Box>
      <Box>
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EditAnswer problem={problem} idx={idx} setNewAnswer={setNewAnswer} />
        </div>
      </Box>
      <Box>
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className={'mb-3'}>
            <NumberSet
              value={strPoint}
              onChange={(v) => updateProblemPoint(idx, v)}
            />
          </div>
          <p style={{ marginLeft: 12 }}>点</p>
        </div>
      </Box>
      <Box>
        {' '}
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '1.125rem',
          }}
        >
          <Switch
            id={`${problem.id} switch`}
            defaultChecked={problem.isQuiz}
            onChange={(e) => {
              updateProblemQuizMode(idx, e.target.checked);
            }}
          />
          <FormLabel>Enable Quiz Mode</FormLabel>
        </div>
      </Box>
      <Box>
        <ChangeProblemsButtons
          idx={idx}
          problems={problems}
          setProblems={setProblems}
          height={height}
        />
      </Box>
    </SimpleGrid>
  );
};

export default ProblemEditColumn;
