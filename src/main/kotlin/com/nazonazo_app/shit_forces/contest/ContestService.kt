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
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import javax.servlet.http.HttpServletRequest
import kotlin.math.ln
import kotlin.math.pow

@Service
@Transactional
class ContestService(private val contestRepository: ContestRepository,
                     private val sharedSessionService: SharedSessionService,
                     private val sharedAccountService: SharedAccountService,
                     private val sharedContestService: SharedContestService,
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
        return TODO("add contest")
    }
    data class ParticipantInfo(
        val name: String,
        val rank: Int,
        val partNum: Int,
        val innerRating: Double,
        val rating: Double
    )
    data class ParticipantResult(
        val name: String,
        val innerRating: Double,
        val rating: Double,
        val perf: Int
    )
    private fun calcInnerPerformance(rank: Int, participants: List<ParticipantInfo>): Double {
        val ratingLimit = 10000.0
        var high = ratingLimit
        var low = -ratingLimit
        val binarySearchTime = 100
        repeat(binarySearchTime) {
            val mid = (high + low) / 2
            var sum = 0.0
            participants.forEach {
                sum += 1.0 / (1 + 6.0.pow(mid - it.innerRating) / 400.0)
            }
            if (sum < rank - 0.5) {
                high = mid
            } else {
                low = mid
            }
        }
        return high
    }
    fun calcParticipantsResult(participants: List<ParticipantInfo>,
                               ratedBound: Int
    ): List<ParticipantResult> {
        val performances = mutableListOf<Double>()
        val innerPerformances = mutableListOf<Double>()
        val resultParticipants = mutableListOf<ParticipantResult>()
        participants.forEach{
            val perf = calcInnerPerformance(it.rank, participants)
            val realPerf = perf.coerceAtMost(ratedBound + 400.0)
            performances.add(perf)
            innerPerformances.add(realPerf)
        }

        participants.forEachIndexed{ index, it ->
            val newRating: Double
            val newInnerRating: Double
            val perf = performances[index]
            val innerPerf = innerPerformances[index]
            val f = {x: Double -> 2.0.pow(x / 800.0) }
            val g = {x: Double -> 800 * ln(x) / ln(2.0) }
            if (it.partNum == 0) {
                newRating = perf
                newInnerRating = innerPerf
            } else {
                newRating = g(0.9 * f(it.rating) + 0.1 * f(perf))
                newInnerRating = 0.9 * it.innerRating + 0.1 * innerPerf
            }
            resultParticipants.add(ParticipantResult(it.name,newInnerRating, newRating, perf.toInt()))
        }
        return resultParticipants
    }
    fun updateRating(contestInfo: ContestInfo) {

        val contestResult = sharedContestService.getContestRanking(contestInfo.shortName, null, null)
            ?.rankingList ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
        val participants = mutableListOf<ParticipantInfo>()
        contestResult.forEach{
            val accountInfo = sharedAccountService.getAccountByName(it.accountName)
            if (accountInfo != null && accountInfo.rating <= contestInfo.ratedBound) {
                var innerRating = accountInfo.innerRating
                if (accountInfo.partNum == 0) {
                    innerRating = contestInfo.ratedBound / 2.0
                }
                participants.add(ParticipantInfo(accountInfo.name,
                    it.ranking,
                    accountInfo.partNum,
                    innerRating,
                    accountInfo.rating))
            }
        }
        val participantsResult =calcParticipantsResult(participants, contestInfo.ratedBound)
        participantsResult.forEach{
            sharedAccountService.updateAccountRating(contestInfo.name, it.name,
                it.rating, it.innerRating, it.perf)
        }
    }
}