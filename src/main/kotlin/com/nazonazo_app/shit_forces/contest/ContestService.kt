package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import javax.servlet.http.HttpServletRequest

@Service
class ContestService(private val contestRepository: ContestRepository,
                     private val sharedSessionService: SharedSessionService,
                     private val sharedAccountService: SharedAccountService,
                     private val sharedProblemService: SharedProblemService,
                     private val sharedSubmissionService: SharedSubmissionService
) {
    private fun haveAuthOfSubmit(sessionAccount: AccountInfo, contest: ContestInfo): Boolean{
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
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest) ?: ""
        val sessionAccount = sharedAccountService.getAccountByName(sessionAccountName)
        if (!haveAuthorityOfSeeSubmissions(sessionAccount, accountName, contest)) {
            throw Error("アクセス権限がありません")
        }
        sharedSubmissionService.getSubmissionOfAccount(accountName, contest.name)
    } catch (e: Error) {
        print(e)
        null
    }

    fun getContestInfoByName(shortContestName: String): ContestInfo?  =
        contestRepository.findByShortName(shortContestName)

    fun submitAnswerToContest(requestSubmission: RequestSubmission,
                              httpServletRequest: HttpServletRequest): SubmissionInfo {
        val contest = getContestInfoByShortName(requestSubmission.shortContestName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)

        val account = sharedAccountService.getAccountByName(accountName)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)

        if (!haveAuthOfSubmit(account, contest)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        val latestSubmit = sharedSubmissionService.getSubmissionOfAccount(accountName, contest.name)
            .maxBy { it.submitTime }

        val nowTime = Timestamp(System.currentTimeMillis())

        if (latestSubmit != null && nowTime.time - latestSubmit.submitTime.time <= SUBMIT_INTERVAL_TIME) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        val reg = Regex(":")
        if (reg.containsMatchIn(requestSubmission.statement)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return sharedSubmissionService.submitAnswer(requestSubmission.indexOfContest, contest.name,
            requestSubmission.statement, account.name)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)

    }

    fun getContestProblems(shortContestName: String,
                           httpServletRequest: HttpServletRequest) : List<ProblemInfo>?  {
        return try{
            val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            val account = sharedAccountService.getAccountByName(accountName ?: "")
            val contest = contestRepository.findByShortName(shortContestName) ?: throw Error("コンテストが見つかりません")

            if (haveAuthorityOfSeeProblems(account, contest)) {
                sharedProblemService.getProblemsByContestName(contest.name)
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
                0, ContestInfo.ContestType.ICPC, requestContest.rated)

            contestRepository.addContest(contest)
        }catch (e: Error) {
            print(e)
            return null
        }
    }
}