package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.AccountService
import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.problem.ProblemService
import com.nazonazo_app.shit_forces.session.SessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import com.nazonazo_app.shit_forces.submission.SubmissionService
import org.springframework.stereotype.Service
import java.sql.Timestamp
import javax.servlet.http.HttpServletRequest

@Service
class ContestService(val contestRepository: ContestRepository,
                     val sessionService: SessionService,
                     val accountService: AccountService,
                     val problemService: ProblemService,
                     val submissionService: SubmissionService) {


    private fun isAbleToSubmit(sessionAccount: AccountInfo, contest: ContestInfo): Boolean{
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return contest.startTime <= nowTimeStamp ||
                sessionAccount.authority == AccountInfo.AccountAuthority.ADMINISTER
    }

    private fun haveAuthorityOfSeeProblems(sessionAccount: AccountInfo?, contest: ContestInfo): Boolean{
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return (contest.startTime <= nowTimeStamp ||
                sessionAccount?.authority ==  AccountInfo.AccountAuthority.ADMINISTER)
    }

    //コンテスト終了 -> 誰のでも見れる
    //コンテスト中(前) -> 自分のアカウントの物のみ見れる ただしAdminは全部見れる(後々Writerだけ等絞るようにしていく)
    private fun haveAuthorityOfSeeSubmissions(sessionAccount: AccountInfo?, accountName: String, contest: ContestInfo): Boolean{
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return (contest.endTime <= nowTimeStamp ||
                sessionAccount?.authority ==  AccountInfo.AccountAuthority.ADMINISTER ||
                sessionAccount?.name == accountName)
    }

    fun getAccountSubmissionOfContest( accountName: String,
                                       shortContestName: String,
                                       httpServletRequest: HttpServletRequest): List<SubmissionInfo>? =
    try {
        val contest = contestRepository.findByShortName(shortContestName) ?: throw Error("コンテストが見つかりません")
        val sessionAccountName = sessionService.getSessionAccountName(httpServletRequest) ?: ""
        val sessionAccount = accountService.getAccountByName(sessionAccountName)
        if (!haveAuthorityOfSeeSubmissions(sessionAccount, accountName, contest)) {
            throw Error("アクセス権限がありません")
        }
        submissionService.getSubmissionOfAccount(accountName, contest.name)
    } catch (e: Error) {
        print(e)
        null
    }

    fun getContestInfoByName(shortContestName: String): ContestInfo?  =
        contestRepository.findByShortName(shortContestName)

    fun getContestRankByICPC(contest: ContestInfo): List<ContestRankingAccountInfo>{
        val submissionList = submissionService.getContestSubmissionInTime(contest)
        val accountSubmitTime: MutableMap<String, MutableMap<Int, Timestamp>> = mutableMapOf()
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        submissionList
            .filter { it.result == SubmissionResult.ACCEPTED }
            .filter { contest.startTime <= it.submitTime  && it.submitTime <= contest.endTime}
            .forEach {
                val submissions = accountSubmitTime.getOrDefault(it.accountName, mutableMapOf())
                val beforeTime = submissions.getOrDefault(it.indexOfContest, it.submitTime)
                submissions[it.indexOfContest] = if (it.submitTime >= beforeTime) beforeTime else beforeTime
                accountSubmitTime[it.accountName] = submissions
            }
        accountSubmitTime.forEach {
            var penaSum = 0
            // ペナルティは、10秒で1ポイント加算
            it.value.forEach{ submit ->
                penaSum += ((submit.value.time - contest.startTime.time).toInt()) / (1000 * 10)
            }
            ranking.add(ContestRankingAccountInfo(it.key, it.value.size, penaSum, it.value.toList(), null))
        }
        ranking.sortWith(Comparator{left, right ->
            if (left.score != right.score) {
                right.score - left.score
            } else {
                left.penalty - right.penalty
            }   })
        for ( idx in 0 until ranking.size) {
            ranking[idx].ranking = idx + 1
        }
        return ranking
    }
    fun getSolvedProblemOnContest(contest: ContestInfo): List<Pair<Int,Int>>{
        val contestProblemNum = problemService.getProblemsByContestName(contest.name).size
        val solvedProblems = MutableList(contestProblemNum) {Pair(0, 0)}
        val submissionList = submissionService.getContestSubmissionInTime(contest)
        submissionList
            .filter { contest.startTime <= it.submitTime  && it.submitTime <= contest.endTime}
            .forEach {
                val pair = solvedProblems[it.indexOfContest]
                solvedProblems[it.indexOfContest] = Pair(pair.first + 1,
                    if (it.result == SubmissionResult.ACCEPTED) pair.second + 1
                    else pair.second)
            }
        return solvedProblems.toList()
    }
    fun getContestRanking(shortContestName: String,
                          page: Int?,
                          requestAccountName : String?): RequestRanking? {
        return try{
            val contest = contestRepository.findByShortName(shortContestName)?: throw Error("コンテストが見つかりません")
            //現在はICPC形式のみ
            val rankingList = getContestRankByICPC(contest)
            val solvedProblems = getSolvedProblemOnContest(contest)
            val requestAccountInfo: ContestRankingAccountInfo? = rankingList.find{it.accountName == requestAccountName}

            val requestRankingList: MutableList<ContestRankingAccountInfo> = if (page == null)
                rankingList.toMutableList()
            else
                rankingList
                    .filterIndexed{ idx, _ -> page * ONE_PAGE_SIZE <= idx && idx < (page + 1) * ONE_PAGE_SIZE}
                    .toMutableList()

            if (requestAccountInfo != null)
                requestRankingList.add(requestAccountInfo)

            RequestRanking(
                requestRankingList,
                solvedProblems,
                rankingList.size,
                requestAccountInfo?.ranking)
        } catch (e: Error) {
            print(e)
            return null
        }
    }
    fun submitAnswerToContest(requestSubmission: RequestSubmission,
                              httpServletRequest: HttpServletRequest): SubmissionInfo? {
        return try {
            val contest = getContestInfoByShortName(requestSubmission.shortContestName)
                ?: throw Error("コンテストが見つかりません")

            val accountName = sessionService.getSessionAccountName(httpServletRequest)
                ?: throw Error("アカウントが不正です")

            val account = accountService.getAccountByName(accountName)
                ?: throw Error("アカウントが不正です")

            if (!isAbleToSubmit(account, contest)) {
                throw Error("提出権限がありません")
            }

            val reg = Regex(":")
            if (reg.containsMatchIn(requestSubmission.statement)) {
                throw Error("不正な文字が含まれています")
            }
            submissionService.submitAnswer(requestSubmission.indexOfContest, contest.name,
                requestSubmission.statement, account.name)

        } catch (e: Error) {
            print(e)
            null
        }
    }

    fun getContestProblems(shortContestName: String,
                           httpServletRequest: HttpServletRequest) : List<ProblemInfo>?  {
        return try{
            val accountName = sessionService.getSessionAccountName(httpServletRequest)
            val account = accountService.getAccountByName(accountName ?: "")
            val contest = contestRepository.findByShortName(shortContestName) ?: throw Error("コンテストが見つかりません")

            if (haveAuthorityOfSeeProblems(account, contest)) {
                problemService.getProblemsByContestName(contest.name)
            } else {
                listOf()
            }
        } catch (e: Error) {
            print(e)
            null
        }
    }

    fun getContestInfoByShortName(shortName: String): ContestInfo? =
        try {
            contestRepository.findByShortName(shortName)
        } catch (e: Error) {
            print(e)
            null
        }

    fun getLatestContestsInfo(contestNum: Int?):List<ContestInfo>? =
        try {
            contestRepository.findLatestContest(contestNum ?: 10)
        } catch (e: Error) {
            print(e)
            null
        }

    fun addContest(requestContest: ContestController.RequestContest):ContestInfo? {
        return try{
            if (contestRepository.findByName(requestContest.name) != null ||
                    contestRepository.findByShortName(requestContest.shortName) != null) {
                throw  Error("短縮名か名前が重複しています")
            }
            val contest = ContestInfo(requestContest.shortName, requestContest.name, "",
                Timestamp(requestContest.startTime.toLong()), Timestamp(requestContest.endTime.toLong()),
                "ICPC", requestContest.rated)

            contestRepository.addContest(contest)
        }catch (e: Error) {
            print(e)
            return null
        }
    }
}