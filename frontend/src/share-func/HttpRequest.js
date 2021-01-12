/***
 * @class AccountInfo
 * @type {Object}
 * @property {Number} rating
 * @property {String} accountName
 */

/***
 * @class SubmissionResult
 * @type {Object}
 * @property {String} result
 * @property {String} statement
 * @property {String} submitTime
 */

/***
 * @class RankingInfo
 * @type {Object}
 * @property {Number} attendAccountNum - 参加者数
 * @property {Array} rankingList - 順位表
 * @property {Number} requestAccountRank - リクエストしたユーザーの順位
 */

/***
 * @class ContestInfo
 * @type {Object}
 * @property {String} shortName
 * @property {String} name
 * @property {String} statement - コンテストの説明
 * @property {String} startTime - コンテスト開始時間のフォーマット済文字列
 * @property {String} endTime - コンテスト終了時間のフォーマット済文字列
 * @property {String} contestType - コンテスト形式 ICPC,AtCoder形式など
 * @property {Boolean} rated
 * @property {Number} unixStartTime - Unix時間でのコンテスト開始時間
 */

/***
 * @class SubmissionInfo
 * @type {Object}
 * @property {String} contestName
 * @property {Number} indexOfContest
 * @property {String} accountName
 * @property {String} statement - 答案
 * @property {String} submitTime - 提出時間
 * @property {String} result
 */

/***
 * @class ProblemInfo
 * @type {Object}
 * @type {String} contestName
 * @type {Number} point - 問題の得点
 * @type {String} statement - 問題文
 * @type {Number} indexOfContest - コンテストの何番目の問題か
 */

/**
 * @return Promise<Object>
 */
async function httpRequest(fetchTo, method, params) {
  let initState = undefined;
  if (method === "GET" || method === 'HEAD') {
    if (params !== undefined) {
      fetchTo += "?" + new URLSearchParams(params);
    }
  } else {
    initState = {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: params
    };
  }
  return await fetch(fetchTo, initState)
    .then(response => {
      if (!response.ok) {
        throw new Error("サーバー接続の際にエラーが発生しました");
      }
      return response.text();
    })
    .then((val) => {
      try{
        return JSON.parse(val);
      }catch{
        throw Error("Json String Error");
      }
    });
}

/***
 *
 * @param {String} shortContestName
 * @param {Number} indexOfContest
 * @param {String} statement
 * @returns {Promise<SubmissionResult>}
 */
export function postSubmission(shortContestName, indexOfContest, statement) {
  const param = {
    shortContestName: shortContestName,
    indexOfContest: indexOfContest,
    statement: statement
  };
  return httpRequest("/api/post-submission", "POST", JSON.stringify(param));
}

/***
 *
 * @param  {Number} page - 順位表何ページ目かの指定 1ページ20 (+1 ログインアカウント用 未実装)
 * @param  {String} shortContestName - コンテスト短縮名(urlの名前)
 * @returns {Promise<RankingInfo>}  rankingInfo
 *
 */
export function getRankingInfo(page, shortContestName) {
  return httpRequest("/api/get-contestRanking", "GET", {
    shortContestName: shortContestName,
    page: page
  });
}

/***
 * @param {String} shortContestName - コンテスト短縮名(urlの名前)
 * @return {Promise<ContestInfo>}
 */
export function getContestInfo(shortContestName) {
  const param = {
    shortContestName: shortContestName
  };
  return httpRequest("/api/contestInfo", "GET", param);
}

/***
 *
 * @param {String} accountName
 * @returns {Promise<Object>}
 */
export function getAccountInformation(accountName) {
  const fetchTo = "/api/account/"  + accountName;
  return httpRequest(fetchTo, "GET");
}

/**
 * @returns {Promise<Array<ContestInfo>>}
 */
export function getLatestContests() {
  return httpRequest("api/latest-contestsInfo", "GET");
}

/**
 *
 * @param {String} shortContestName
 * @param {String} accountName
 * @returns {Promise<SubmissionInfo>}
 */
export function getSubmission(shortContestName, accountName) {
  const param = {
    shortContestName: shortContestName,
    accountName: accountName
  };
  return httpRequest("/api/get-submission", "GET", param);
}

/**
 *
 * @param {String} shortContestName
 * @returns {Promise<Array<ProblemInfo>>}
 */
export function getContestProblems(shortContestName) {
  const param = {
    shortContestName: shortContestName
  };
  return httpRequest("/api/problemsInfo", "GET", param);
}

/**
 *
 * @param {String} fetchTo アカウント情報のポスト先 /api/login か /api/signup
 * @param accountName
 * @param password
 * @returns {Promise<Null>}
 */
export function postAccountInformation(fetchTo, accountName, password) {
  const jsonBody = JSON.stringify({
    "name": accountName,
    "password": btoa(accountName + ":" + password),
  });
  return httpRequest(fetchTo, "POST", jsonBody);
}
export default httpRequest;
