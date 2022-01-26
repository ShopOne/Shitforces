import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react';
import { VFC } from 'react';

interface NumberSetProps {
  value: string;
  onChange(v: string): void;
  placeholder?: string;
}

const NumberSetStepper: VFC<NumberSetProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const valueNum = parseInt(value);
  const onIncrementValue = () => {
    if (!isNaN(valueNum)) {
      onChange((valueNum + 1).toString());
    }
  };

  const onDecrementValue = () => {
    if (!isNaN(valueNum)) {
      onChange((valueNum - 1).toString());
    }
  };

  return (
    <NumberInput value={value} onChange={onChange} placeholder={placeholder}>
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper onClick={onIncrementValue} />
        <NumberDecrementStepper onClick={onDecrementValue} />
      </NumberInputStepper>
    </NumberInput>
  );
};

const NumberSet: VFC<NumberSetProps> = ({ value, onChange, placeholder }) => {
  const valueNum = parseInt(value);

  return (
    <NumberInput placeholder={placeholder} value={value} onChange={onChange}>
      <NumberInputField />
    </NumberInput>
  );
};

export { NumberSetStepper, NumberSet };
