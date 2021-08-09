import type {
  AccountInfo,
  AccountRankingInfo,
  ContestInfo,
  LatestContestsInfo,
  ProblemInfo,
  ContestStandingsInfo,
  SubmissionInfo,
  SubmissionResult,
  AccountContestPartHistory,
  ContestSubmissionOfRaid,
} from '../types';

export async function httpRequest(
  fetchTo: string,
  method: string,
  params?: any
): Promise<unknown> {
  if (process?.env?.REACT_APP_BACKEND_URL !== undefined) {
    fetchTo = process.env.REACT_APP_BACKEND_URL + fetchTo;
  }
  let initState: any;
  if (method === 'GET' || method === 'HEAD') {
    if (params !== undefined) {
      fetchTo += '?' + new URLSearchParams(params);
    }
    initState = {
      mode: 'cors',
      credentials: 'include',
    };
  } else {
    initState = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: params,
      mode: 'cors',
      credentials: 'include',
    };
  }

  return await fetch(fetchTo, initState)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status.toString());
      }

      return response.text();
    })
    .then((val) => {
      try {
        if (val === '') return val;
        else return JSON.parse(val);
      } catch {
        throw Error('Json String Error');
      }
    });
}

export function postSubmission(
  contestId: string,
  indexOfContest: string,
  statement: string
): Promise<SubmissionResult> {
  const param = {
    contestId: contestId,
    indexOfContest: indexOfContest,
    statement: statement,
  };

  return httpRequest(
    '/api/submissions',
    'POST',
    JSON.stringify(param)
  ) as Promise<SubmissionResult>;
}

/**
 * @param page 順位表何ページ目かの指定 1ページ20 (+1 ログインアカウント用 未実装) nullの場合は順位表全体を返す
 * @param contestId コンテスト短縮名(urlの名前)
 */
export function getContestStandingsInfo(
  page: number | null,
  contestId: string
): Promise<ContestStandingsInfo> {
  const params: any = {};
  if (page !== null) {
    params.page = page;
  }

  return httpRequest(
    `/api/contests/${contestId}/standings`,
    'GET',
    params
  ) as Promise<ContestStandingsInfo>;
}

/**
 * @param contestId コンテスト短縮名(urlの名前)
 */
export function getContestInfo(contestId: string): Promise<ContestInfo> {
  return httpRequest(
    `/api/contests/${contestId}`,
    'GET'
  ) as Promise<ContestInfo>;
}

/**
 * @param accountName
 */
export async function getAccountInformation(
  accountName: string
): Promise<AccountInfo> {
  const fetchTo = `/api/account/${accountName}`;

  return (await httpRequest(fetchTo, 'GET')) as Promise<AccountInfo>;
}

/**
 * @param page
 */
export function getLatestContests(page: number): Promise<LatestContestsInfo> {
  return httpRequest('/api/contests/latest', 'GET', {
    contest_page: page,
  }) as Promise<LatestContestsInfo>;
}

/**
 * @param contestId
 * @param accountName
 */
export function getSubmission(
  contestId: string,
  accountName: string
): Promise<SubmissionInfo[]> {
  const param = {
    ['contest_id']: contestId,
  };

  return httpRequest(
    `/api/submissions/${accountName}`,
    'GET',
    param
  ) as Promise<SubmissionInfo[]>;
}

/**
 * @param contestId
 */
export function getContestProblems(contestId: string): Promise<ProblemInfo[]> {
  return httpRequest(`/api/contests/${contestId}/problems`, 'GET') as Promise<
    ProblemInfo[]
  >;
}

/**
 * @param fetchTo アカウント情報のポスト先 /api/login か /api/signup
 * @param accountName
 * @param password
 */
export function postAccountInformation(
  fetchTo: string,
  accountName: string,
  password: string
): Promise<void> {
  const jsonBody = JSON.stringify({
    name: accountName,
    password: password,
  });

  return httpRequest(fetchTo, 'POST', jsonBody) as Promise<void>;
}

export function updateContestRating(contestId: string): Promise<unknown> {
  return httpRequest(`/api/contests/${contestId}/rating`, 'POST');
}

/**
 *
 * @param prevAccountName
 * @param newAccountName
 * @param password
 * @returns {Promise<Null>}
 */
export function putAccountName(
  prevAccountName: string,
  newAccountName: string,
  password: string
): Promise<void> {
  const jsonBody = JSON.stringify({
    name: newAccountName,
    password: password,
  });

  return httpRequest(
    `/api/account/${prevAccountName}/name`,
    'PUT',
    jsonBody
  ) as Promise<void>;
}

/**
 *
 * @param id
 * @param contestName
 * @param startTime
 * @param endTime
 * @param penalty
 * @param ratedBound
 * @param contestType
 * @param creators
 */
export function createContest(
  id: string,
  contestName: string,
  startTime: Date,
  endTime: Date,
  penalty: number,
  ratedBound: number,
  contestType: string,
  creators: any
): Promise<void> {
  const param = {
    id: id,
    contestName: contestName,
    startTime: startTime,
    endTime: endTime,
    penalty: penalty,
    ratedBound: ratedBound,
    contestType: contestType,
    creators: creators,
  };

  return httpRequest(
    '/api/contests',
    'POST',
    JSON.stringify(param)
  ) as Promise<void>;
}

/**
 *
 * @param contestId
 * @param penalty
 * @param statement
 * @param problems
 */
export function putContestInfo(
  contestId: string,
  penalty: number,
  statement: string,
  problems: { statement: string; point: number; answer: string[] }[]
): Promise<void> {
  const param = {
    penalty: penalty,
    statement: statement,
    problems: problems,
  };

  return httpRequest(
    `/api/contests/${contestId}`,
    'PUT',
    JSON.stringify(param)
  ) as Promise<void>;
}

/**
 *
 * @param contestId
 * @param penalty
 * @param statement
 * @param problems
 */
export function patchContestInfo(
  contestId: string,
  penalty: number,
  statement: string,
  problems: { statement: string; point: number; answer: string[] }[]
): Promise<void> {
  const param = {
    penalty: penalty,
    statement: statement,
    problems: problems,
  };

  return httpRequest(
    `/api/contests/${contestId}`,
    'PATCH',
    JSON.stringify(param)
  ) as Promise<void>;
}

/**
 * @param id
 */
export function getProblemAnswer(id: number): Promise<string[]> {
  return httpRequest(`/api/problems/${id}/answer`, 'GET') as Promise<string[]>;
}

/**
 * @param page
 */
export function getAccountRankingInfo(
  page: number
): Promise<AccountRankingInfo> {
  return httpRequest('/api/ranking', 'GET', {
    page: page,
  }) as Promise<AccountRankingInfo>;
}

/**
 * @param accountName
 */
export function getAccountContestPartHistory(
  accountName: string
): Promise<AccountContestPartHistory[]> {
  return httpRequest(`/api/account/${accountName}/history`, 'GET') as Promise<
    AccountContestPartHistory[]
  >;
}

/**
 * @param contestId
 * @param indexOfContest
 */
export function getContestSubmissionsOfRaid(
  contestId: string,
  indexOfContest: number
): Promise<ContestSubmissionOfRaid[]> {
  return httpRequest(`/api/submissions/${contestId}/raid`, 'GET', {
    index_of_contest: indexOfContest,
  }) as Promise<ContestSubmissionOfRaid[]>;
}
