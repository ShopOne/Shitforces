export interface AccountInfo {
  name: string;
  rating: number;
  accountName: string;
  auth: string;
}

export interface SubmissionResult {
  result: string;
  statement: string;
  submitTime: string;
}

export interface RankingInfo {
  /**
   * 参加者数
   */
  partAccountNum: number;
  /**
   * 順位表
   */
  rankingList: RankingInfoAccount[];
  /**
   * リクエストしたユーザーの順位
   */
  requestAccountRank: number;
  /**
   * AC/Submitの数 .firstにAC人数、.secondに提出人数
   */
  acPerSubmit: [number, number];
}

/**
 * 順位表に表示するためのアカウント情報
 */
export interface RankingInfoAccount {
  accountName: string;
  /**
   * ACした問題リスト
   */
  acceptList: unknown[];
  /**
   * このアカウントの現在順位
   */
  ranking: any;
  /**
   * 提出までに経過した秒数
   */
  acceptTimeList: number[];
  score: number;
  penalty: number;
}

export interface ContestInfo {
  id: string;
  name: string;
  /**
   * コンテストの説明
   */
  statement: string;
  /**
   * コンテスト開始時間のフォーマット済文字列
   */
  startTimeAMPM: string;
  /**
   * コンテスト終了時間のフォーマット済文字列
   */
  endTimeAMPM: string;
  /**
   * コンテスト形式 ICPC,AtCoder形式など
   */
  contestType: string;
  /**
   * rated上限 0ならばunrated
   */
  ratedBound: number;
  /**
   * Unix時間でのコンテスト開始時間
   */
  unixStartTime: number;
  /**
   * Unix時間でのコンテスト終了時間
   */
  unixEndTime: number;
  /**
   * レート計算済みかどうか
   */
  ratingCalculated: boolean;
}

export interface LatestContestsInfo {
  contests: ContestInfo[];
  allContestNum: number;
}

export interface SubmissionInfo {
  contestName: string;
  indexOfContest: number;
  accountName: string;
  /**
   * 答案
   */
  statement: string;
  /**
   * 提出時間
   */
  submitTime: string;
  result: string;
}

export interface ProblemInfo {
  contestName: string;
  /**
   * 問題の得点
   */
  point: number;
  /**
   * 問題文
   */
  statement: string;
  /**
   * コンテストの何番目の問題か
   */
  indexOfContest: number;
}
