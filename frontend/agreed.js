const mockContestFactory = (object = {}) => ({
  id: 'test01',
  name: 'テストコンテスト 01',
  statement: 'フロントエンド動作確認用のテストコンテストです。',
  unixStartTime: 1609545600000,
  startTime: '2021-01-02T00:00:00.000+00:00',
  startTimeAMPM: '2021/01/02 09:00:00 AM',
  unixEndTime: 1609547400000,
  endTime: '2021-01-02T00:30:00.000+00:00',
  endTimeAMPM: '2021/01/02 09:30:00 AM',
  penalty: 0,
  ratedBound: 0,
  contestType: 'ATCODER',
  ratingCalculated: false,
  ...object,
});

const mockContestProblemFactory = (object = {}) => ({
  contestName: 'test01',
  point: 1,
  statement: '答えはくそなぞなぞ',
  indexOfContest: 0,
  ...object,
});

const mockContestRankingListItemFactory = (object = {}) => ({
  accountName: 'なぞなぞ界の tourist',
  score: 2,
  penalty: 0,
  acceptList: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  ranking: 1,
  ...object,
});

module.exports = [
  {
    request: {
      path: '/api/contests/latest',
      method: 'GET',
    },
    response: {
      body: [mockContestFactory({ id: 'test00', name: 'テストコンテスト 00' })],
    },
  },

  {
    request: {
      path: '/api/contests/test{:contest_no}',
    },
    response: {
      body: mockContestFactory({
        id: '{:contest_no}',
        name: 'テストコンテスト {:contest_no}',
      }),
    },
  },

  {
    request: {
      path: '/api/contests/{:contest_id}/problems',
    },
    response: {
      body: Array(26)
        .fill()
        .map((_, i) =>
          mockContestProblemFactory({
            contestName: '{:contest_id}',
            indexOfContest: i,
          })
        ),
    },
  },

  {
    request: {
      path: '/api/contests/{:contest_id}/ranking',
      query: { page: '0' },
    },
    response: {
      body: {
        rankingList: Array(20)
          .fill()
          .map((_, no) =>
            mockContestRankingListItemFactory({ ranking: no + 1 })
          ),
        acPerSubmit: [
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
        ],
        partAccountNum: 40,
        requestAccountRank: null,
      },
    },
  },
  {
    request: {
      path: '/api/contests/{:contest_id}/ranking',
      query: { page: '1' },
    },
    response: {
      body: {
        rankingList: Array(20)
          .fill()
          .map((_, no) =>
            mockContestRankingListItemFactory({ ranking: no + 21 })
          ),
        acPerSubmit: [
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
          { first: 40, second: 40 },
        ],
        partAccountNum: 40,
        requestAccountRank: null,
      },
    },
  },
];
