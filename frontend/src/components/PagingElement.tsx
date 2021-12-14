import PropTypes from 'prop-types';
import React, { memo } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import { useHistory, useLocation } from 'react-router';

interface Props {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
  savePaging: boolean;
  marginPx?: number;
}

const createPageArr = (pageNum: number, nowPage: number): number[] => {
  const ret = [nowPage];
  let pow = 2;
  while (nowPage - pow + 1 >= 0) {
    ret.unshift(nowPage - pow + 1);
    pow *= 2;
  }
  pow = 2;
  while (nowPage + pow - 1 < pageNum) {
    ret.push(nowPage + pow - 1);
    pow *= 2;
  }

  if (ret[0] !== 0) {
    ret.unshift(0);
  }
  if (ret[ret.length - 1] !== pageNum - 1) {
    ret.push(pageNum - 1);
  }

  return ret;
};

export const PagingElement: React.FC<Props> = memo(
  ({ totalPages, currentPage, onChange, marginPx, savePaging }) => {
    const pageArr = createPageArr(totalPages, currentPage);
    const params = new URLSearchParams(window.location.search);
    const pathName = useLocation().pathname;
    const paramPage = params.get('page');
    const history = useHistory();
    const onClick = (page: number) => {
      if (savePaging) {
        history.push(`${pathName}?${params.toString()}`);
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
        margin: `${marginPx}px`,
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
  }
);

PagingElement.displayName = 'PagingElement';

PagingElement.propTypes = {
  onChange: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
};
