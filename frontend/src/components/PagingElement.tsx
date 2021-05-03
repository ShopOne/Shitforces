import PropTypes from 'prop-types';
import { FC, useCallback, useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';

interface PagingElementProps {
  pageChanged(page: number): void;
  pageNum: number;
  reloadButton?: boolean;
}

export const PagingElement: FC<PagingElementProps> = ({
  pageNum,
  pageChanged,
  reloadButton,
}) => {
  const [page, setPage] = useState(() => {
    pageChanged(0);
    return 0;
  });

  const onClick = useCallback((event: any) => {
    const newPage = parseInt(event.target.text) - 1;
    let loadPage = page;
    if (!isNaN(newPage)) {
      setPage(newPage);
      loadPage = newPage;
    }
    pageChanged(loadPage);
  }, []);

  const items = [];
  for (let i = 0; i < pageNum; i++) {
    items.push(
      <Pagination.Item key={i} active={i === page} onClick={onClick}>
        {i + 1}
      </Pagination.Item>
    );
  }

  let reloadButtonElement = <div />;
  if (reloadButton === true) {
    reloadButtonElement = (
      <button type="submit" onClick={onClick}>
        <img src={window.location.origin + '/reload.png'} alt="再読込" />
      </button>
    );
  }

  return (
    <div>
      <Pagination>{items}</Pagination>
      {reloadButtonElement}
    </div>
  );
};

PagingElement.propTypes = {
  pageChanged: PropTypes.func.isRequired,
  pageNum: PropTypes.number.isRequired,
  reloadButton: PropTypes.bool,
};
