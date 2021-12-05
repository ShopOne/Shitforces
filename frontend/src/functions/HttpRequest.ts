import type {
  AccountInfo,
  AccountRankingInfo,
  ContestInfo,
  ContestsInfoList,
  ProblemInfo,
  ContestStandingsInfo,
  SubmissionInfo,
  SubmissionResult,
  AccountContestPartHistory,
  ContestSubmissionOfRaid,
} from '../types';

type Method =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'PATCH';

export async function httpRequest<T>(
  fetchTo: string,
  method: Method,
  params?: any
): Promise<T> {
  if (process?.env?.REACT_APP_BACKEND_URL !== undefined) {
    fetchTo = process.env.REACT_APP_BACKEND_URL + fetchTo;
  }
  let initState: RequestInit;
  if (method === 'GET' || method === 'HEAD') {
    if (params !== undefined) {
      fetchTo += `?${new URLSearchParams(params)}`;
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

  return httpRequest<SubmissionResult>(
    '/api/submissions',
    'POST',
    JSON.stringify(param)
  );
}

/**
 * @param page 順位表何ページ目かの指定 1ページ20 (+1 ログインアカウント用 未実装) nullの場合は順位表全体を返す
 * @param contestId コンテスト短縮名(urlの名前)
 */
export function getContestStandingsInfo(
  page: number | null,
  contestId: string
): Promise<ContestStandingsInfo> {
  interface RequestInit {
    page?: number | null;
  }
  const params: RequestInit = {};
  if (page !== null) {
    params.page = page;
  }

  return httpRequest(`/api/contests/${contestId}/standings`, 'GET', params);
}

/**
 * @param contestId コンテスト短縮名(urlの名前)
 */
export function getContestInfo(contestId: string): Promise<ContestInfo> {
  return httpRequest(`/api/contests/${contestId}`, 'GET');
}

/**
 * @param accountName
 */
export async function getAccountInformation(
  accountName: string
): Promise<AccountInfo> {
  const fetchTo = `/api/account/${accountName}`;

  return await httpRequest<AccountInfo>(fetchTo, 'GET');
}

/**
 * @param page
 */
export function getLatestContests(page: number): Promise<ContestsInfoList> {
  return httpRequest<ContestsInfoList>('/api/contests/latest', 'GET', {
    contest_page: page,
  });
}

export function getUpcomingContests(): Promise<ContestsInfoList> {
  return httpRequest<ContestsInfoList>('/api/contests/upcoming', 'GET');
}

export function getActiveContests(): Promise<ContestsInfoList> {
  return httpRequest<ContestsInfoList>('/api/contests/active', 'GET');
}

export function getPastContests(page: number): Promise<ContestsInfoList> {
  return httpRequest<ContestsInfoList>('/api/contests/past', 'GET', {
    contest_page: page,
  });
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

  return httpRequest<SubmissionInfo[]>(
    `/api/submissions/${accountName}`,
    'GET',
    param
  );
}

/**
 * @param contestId
 */
export function getContestProblems(contestId: string): Promise<ProblemInfo[]> {
  return httpRequest<ProblemInfo[]>(
    `/api/contests/${contestId}/problems`,
    'GET'
  );
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

  return httpRequest<void>(fetchTo, 'POST', jsonBody);
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

  return httpRequest<void>(
    `/api/account/${prevAccountName}/name`,
    'PUT',
    jsonBody
  );
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

  return httpRequest<void>('/api/contests', 'POST', JSON.stringify(param));
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

  return httpRequest<void>(
    `/api/contests/${contestId}`,
    'PUT',
    JSON.stringify(param)
  );
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

  return httpRequest<void>(
    `/api/contests/${contestId}`,
    'PATCH',
    JSON.stringify(param)
  );
}

/**
 * @param id
 */
export function getProblemAnswer(id: number): Promise<string[]> {
  return httpRequest<string[]>(`/api/problems/${id}/answer`, 'GET');
}

/**
 * @param page
 */
export function getAccountRankingInfo(
  page: number
): Promise<AccountRankingInfo> {
  return httpRequest<AccountRankingInfo>('/api/ranking', 'GET', {
    page: page,
  });
}

/**
 * @param accountName
 */
export function getAccountContestPartHistory(
  accountName: string
): Promise<AccountContestPartHistory[]> {
  return httpRequest<AccountContestPartHistory[]>(
    `/api/account/${accountName}/history`,
    'GET'
  );
}

/**
 * @param contestId
 * @param indexOfContest
 */
export function getContestSubmissionsOfRaid(
  contestId: string,
  indexOfContest: number
): Promise<ContestSubmissionOfRaid[]> {
  return httpRequest<ContestSubmissionOfRaid[]>(
    `/api/submissions/${contestId}/raid`,
    'GET',
    {
      index_of_contest: indexOfContest,
    }
  );
}
