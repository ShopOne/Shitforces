import {
  Box,
  Button,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Switch,
  Textarea,
} from '@chakra-ui/react';
import { VFC } from 'react';
import { MutableListElement } from '../../components/MutableListElement';
import { EditProblemInfo } from '../../types';

interface ProblemEditColumnPCProps {
  problems: EditProblemInfo[];
  setProblems(problems: EditProblemInfo[]): void;
  idx: number;
  height: number;
}

const ProblemEditColumnPC: VFC<ProblemEditColumnPCProps> = ({
  idx,
  setProblems,
  problems,
  height,
}) => {
  const problem = problems[idx];
  const UP_REARRANGE = 'UP';
  const DOWN_REARRANGE = 'DOWN';

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
    <SimpleGrid columns={1} spacing={10}>
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
            <NumberInput
              value={problem.point}
              onChange={(value) => {
                updateProblemPoint(idx, value);
              }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper
                  onClick={() =>
                    updateProblemPoint(
                      idx,
                      ((problem?.point || 0) + 1).toString()
                    )
                  }
                />
                <NumberDecrementStepper
                  onClick={() =>
                    updateProblemPoint(
                      idx,
                      ((problem?.point || 0) - 1).toString()
                    )
                  }
                />
              </NumberInputStepper>
            </NumberInput>
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
      </Box>
    </SimpleGrid>
  );
};

export default ProblemEditColumnPC;
