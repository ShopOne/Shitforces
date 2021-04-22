import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

interface MutableListElementProps {
  items: string[];
  setItems(newItems: string[]): void;
}
export const MutableListElement: React.FC<MutableListElementProps> = ({
  items,
  setItems,
}) => {
  const [itemState, setItemState] = useState<
    { statement: string; id: number }[]
  >([]);

  useEffect(() => {
    const itemState = items.map((item, idx) => {
      return {
        statement: item,
        id: idx,
      };
    });
    setItemState(itemState);
  }, []);

  const addItem = () => {
    const newItemState = [...itemState];
    const newItems = [...items];
    newItemState.push({ statement: '', id: newItemState.slice(-1)[0].id });
    newItems.push('');
    setItemState(newItemState);
    setItems(newItems);
  };

  const eraseItems = (idx: number) => {
    const newItemState = itemState.filter((_, itemIdx) => idx !== itemIdx);
    const newItems = items.filter((_, itemIdx) => idx !== itemIdx);
    if (newItems.length === 0) {
      return;
    }
    setItemState(newItemState);
    setItems(newItems);
  };

  const updateItems = (idx: number, statement: string) => {
    const newItemState = [...itemState];
    const newItems = [...items];
    newItemState[idx].statement = statement;
    newItems[idx] = statement;
    setItemState(newItemState);
    setItems(newItems);
  };

  const listElement = () => {
    return itemState.map((item, idx) => {
      return (
        <Form.Row key={item.id}>
          <Col>
            <InputGroup className={'mb-3'}>
              <Form.Control
                value={item.statement}
                onChange={(e) => updateItems(idx, e.target.value)}
              />
            </InputGroup>
            <Col>
              <button type={'button'} onClick={addItem}>
                +
              </button>
              <button type={'button'} onClick={() => eraseItems(idx)}>
                -
              </button>
            </Col>
          </Col>
        </Form.Row>
      );
    });
  };
  return <div>{listElement()}</div>;
};

MutableListElement.propTypes = {
  items: PropTypes.array.isRequired,
  setItems: PropTypes.func.isRequired,
};
