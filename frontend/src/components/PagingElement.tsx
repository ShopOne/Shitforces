import PropTypes from 'prop-types';
import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

interface Props {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
}

export const PagingElement: React.FC<Props> = ({
  totalPages,
  currentPage,
  onChange,
}) => {
  const pageArr = [...Array(totalPages)].map((_, idx) => idx);

  return (
    <div>
      <Pagination>
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
