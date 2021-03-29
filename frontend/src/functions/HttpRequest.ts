import type {
  AccountInfo,
  ContestInfo,
  LatestContestsInfo,
  ProblemInfo,
  RankingInfo,
  SubmissionInfo,
  SubmissionResult,
} from '../types';

export async function httpRequest(
  fetchTo: string,
  method: string,
  params?: any
): Promise<unknown> {
  if (process?.env?.REACT_APP_BACKEND_URL !== undefined) {
    fetchTo = process.env.REACT_APP_BACKEND_URL + fetchTo;
  }
  let initState: any = undefined;
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
 * @param page 順位表何ページ目かの指定 1ページ20 (+1 ログインアカウント用 未実装)
 * @param contestId コンテスト短縮名(urlの名前)
 */
export function getRankingInfo(
  page: number,
  contestId: string
): Promise<RankingInfo> {
  return httpRequest(`/api/contests/${contestId}/ranking`, 'GET', {
    page: page,
  }) as Promise<RankingInfo>;
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
export function getAccountInformation(
  accountName: string
): Promise<AccountInfo> {
  const fetchTo = '/api/account/' + accountName;
  return httpRequest(fetchTo, 'GET') as Promise<AccountInfo>;
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

export function updateContestRating(contestId: string) {
  return httpRequest(`/api/contests/${contestId}/rating`, 'POST');
}

/**
 * @param prevAccountName
 * @param newAccountName
 * @param password
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
