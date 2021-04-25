export interface ContestCreator {
  accountName: string;
  contestId: string;
  position: string;
}
export interface AccountInfo {
  name: string;
  rating: number;
  partNum: number;
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
  acPerSubmit: { first: number; second: number }[];
}

/**
 * 順位表に表示するためのアカウント情報
 */
// AccountRankingInfoとRankingInfoAccountの区別が付きづらい User_StandingDataなどは？
// ユーザーの順位に関係するデータだとすぐわかるようにしたいです
export interface RankingInfoAccount {
  accountName: string;
  /**
   * ACした問題リスト
   */
  acceptList: number[];
  /**
   * このアカウントの現在順位
   */
  ranking: number;
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
   * ペナルティ(秒単位)
   */
  penalty: number;
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
  /**
   * コンテスト編集者
   */
  contestCreators: ContestCreator[];
}

export interface LatestContestsInfo {
  contests: ContestInfo[];
  allContestNum: number;
}

export interface SubmissionInfo {
  contestId: string;
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
  contestId: string;
  id: number;
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

export interface AccountRankingInfo {
  accounts: AccountInfo[];
  validAccountNum: number;
}
