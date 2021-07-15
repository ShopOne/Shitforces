import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import { PagingElement } from '../../components/PagingElement';
import { createEnglishIndex } from '../../functions/createEnglishIndex';
import { SubmissionInfo } from '../../types';

interface Props {
  submissions: SubmissionInfo[];
}

export const SubmissionTable: React.FC<Props> = ({
  submissions,
}) => {
  const [page, setPage] = useState(0);

  const SUBMISSIONS_IN_ONE_PAGE = 5;
  const totalPages = Math.ceil(submissions.length / SUBMISSIONS_IN_ONE_PAGE);

  const divideContent = (
    arr: SubmissionInfo[],
    unit = SUBMISSIONS_IN_ONE_PAGE
  ) => {
    let content = [];
    for (let i = 0; i * unit <= arr.length; i += 1) {
      content.push(arr.slice(i * unit, Math.min((i + 1) * unit, arr.length)));
    }

    return content;
  };

  const pagedContent = React.useMemo(
    () => divideContent(submissions, SUBMISSIONS_IN_ONE_PAGE),
    [submissions.length]
  );
  if (submissions.length === 0) {
    return <div />;
  }

  const createTableBody = () => {
    /**
     * @param {Object} submit - 提出情報
     * @param {String} submit.statement - 提出した際の答案
     * @param {String} submit.result - 提出結果
     * @param {String} submit.submitTimeAMPM - 提出時間のフォーマット済の文字列
     */
    return pagedContent[page].map((submit, idx: number) => {
      return (
        <tr key={idx}>
          <td key={idx + 'idx'}>
            {createEnglishIndex(submit.indexOfContest)}
          </td>
          <td key={idx + 'stm'}>{submit.statement}</td>
          <td key={idx + 'res'}>{submit.result}</td>
          <td key={idx + 'time'}>{submit.submitTimeAMPM}</td>
        </tr>
      );
    });
  };

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>問題</th>
            <th>提出</th>
            <th>結果</th>
            <th>提出時間</th>
          </tr>
        </thead>
        <tbody>{createTableBody()}</tbody>
      </Table>
      <PagingElement
        totalPages={totalPages}
        currentPage={page}
        onChange={setPage}
      />
    </div>
  );
};

SubmissionTable.propTypes = {
  submissions: PropTypes.array.isRequired,
};
