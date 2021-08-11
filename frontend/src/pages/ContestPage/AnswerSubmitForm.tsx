import { VFC, RefObject, KeyboardEvent } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

interface Props {
  answerInput: RefObject<HTMLInputElement>;
  submitAnswer: () => void;
}

export const AnswerSubmitForm: VFC<Props> = ({ answerInput, submitAnswer }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement> | undefined) => {
    if (e?.key === 'Enter' && e?.ctrlKey) {
      // or just (e.key==="Enter")
      submitAnswer();
    }
  };

  return (
    <div>
      <Form.Label>答え</Form.Label>
      <Form.Control
        type={'text'}
        onKeyDown={handleKeyDown}
        ref={answerInput}
        placeholder="Ctrl+Enterで提出"
      />
      <Button type={'primary'} onClick={submitAnswer}>
        提出
      </Button>
    </div>
  );
};
