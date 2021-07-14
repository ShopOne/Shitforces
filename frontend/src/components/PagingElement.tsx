import PropTypes from 'prop-types';
import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

interface Props {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
  marginPx?: number;
}

export const PagingElement: React.FC<Props> = ({
  totalPages,
  currentPage,
  onChange,
  marginPx,
}) => {
  const pageArr = [...Array(totalPages)].map((_, idx) => idx);
  let style = {};
  if (marginPx !== undefined) {
    style = {
      margin: marginPx + 'px',
    };
  }

  return (
    <div>
      <Pagination style={style}>
        {pageArr.map((page) => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            value={page}
            onClick={() => onChange(page)}
          >
            {page + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

PagingElement.propTypes = {
  onChange: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
};
