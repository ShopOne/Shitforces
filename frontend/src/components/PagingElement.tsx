import PropTypes from 'prop-types';
import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

interface Props {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
  savePaging: boolean;
  marginPx?: number;
}

export const PagingElement: React.FC<Props> = ({
  totalPages,
  currentPage,
  onChange,
  marginPx,
  savePaging,
}) => {
  const pageArr = [...Array(totalPages)].map((_, idx) => idx);
  const params = new URLSearchParams(window.location.search);
  const paramPage = params.get('page');
  const onClick = (page: number) => {
    if (savePaging) {
      params.set('page', page.toString());
      history.pushState(null, '', `?${params.toString()}`);
    }
    onChange(page);
  };
  if (
    savePaging &&
    paramPage !== null &&
    currentPage.toString() !== paramPage
  ) {
    const newPage = parseInt(paramPage, 10);
    if (!isNaN(newPage)) {
      onChange(newPage);

      return null;
    }
  }
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
            onClick={() => onClick(page)}
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
