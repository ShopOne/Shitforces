import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { PagingElement } from '../../components/PagingElement';
import { createEnglishIndex } from '../../functions/createEnglishIndex';

interface SubmissionTableProps {
  problemNum: number;
  submissions: any[];
}

export const SubmissionTable: React.FC<SubmissionTableProps> = ({
  problemNum,
  submissions,
}) => {
  const [displaySubmissions, setDisplaySubmissions] = useState<any>([]);

  if (submissions.length === 0) {
    return <div />;
  }

  const SUBMISSIONS_IN_ONE_PAGE = 5;
  const pageNum = Math.ceil(submissions.length / SUBMISSIONS_IN_ONE_PAGE);
  const changeDisplaySubmissions = (page: any) => {
    const newSubmissions = submissions.filter(
      (_: any, idx: number) =>
        page * SUBMISSIONS_IN_ONE_PAGE <= idx &&
        idx < (page + 1) * SUBMISSIONS_IN_ONE_PAGE
    );
    setDisplaySubmissions(newSubmissions);
  };

  const createTableBody = () => {
    /**
     * @param {Object} submit - 提出情報
     * @param {String} submit.statement - 提出した際の答案
     * @param {String} submit.result - 提出結果
     * @param {String} submit.submitTimeAMPM - 提出時間のフォーマット済の文字列
     */
    return displaySubmissions.map((submit: any, idx: number) => {
      return (
        <tr key={idx}>
          <td key={idx + 'idx'}>
            {createEnglishIndex(submit.indexOfContest, problemNum)}
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
      <PagingElement pageNum={pageNum} pageChanged={changeDisplaySubmissions} />
    </div>
  );
};

SubmissionTable.propTypes = {
  problemNum: PropTypes.number.isRequired,
  submissions: PropTypes.array.isRequired,
};
