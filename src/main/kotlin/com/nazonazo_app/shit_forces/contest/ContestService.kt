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
import javax.servlet.http.HttpServletResponse
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
    private fun haveAuthOfSubmit(sessionAccount: AccountInfo,
                                 contestCreators: List<ContestCreator>,
                                 contest: ContestInfo): Boolean{
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return contest.startTime <= nowTimeStamp ||
                sessionAccount.authority == AccountInfo.AccountAuthority.ADMINISTER ||
                contestCreators.find{it.accountName == sessionAccount.name} != null
    }

    private fun haveAuthorityOfSeeProblems(sessionAccount: AccountInfo?,
                                           contestCreators: List<ContestCreator>,
                                           contest: ContestInfo): Boolean{
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return (contest.startTime <= nowTimeStamp ||
                sessionAccount?.authority ==  AccountInfo.AccountAuthority.ADMINISTER ||
                contestCreators.find{it.accountName == sessionAccount?.name} != null)
    }

    //コンテスト終了 -> 誰のでも見れる
    //コンテスト中(前) -> 自分のアカウントの物のみ見れる ただしAdminは全部見れる(後々Writerだけ等絞るようにしていく)
    private fun haveAuthorityOfSeeSubmissions(sessionAccount: AccountInfo?,
                                              accountName: String,
                                              contestCreators: List<ContestCreator>,
                                              contest: ContestInfo): Boolean{
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return (contest.endTime <= nowTimeStamp ||
                sessionAccount?.authority ==  AccountInfo.AccountAuthority.ADMINISTER ||
                sessionAccount?.name == accountName ||
                contestCreators.find{it.accountName == sessionAccount?.name} != null)
    }

    fun getAccountSubmissionOfContest( accountName: String,
                                       id: String,
                                       httpServletRequest: HttpServletRequest): List<SubmissionInfo>? =
    try {
        val contest = contestRepository.findByContestId(id) ?: throw Error("コンテストが見つかりません")
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest) ?: ""
        val sessionAccount = sharedAccountService.getAccountByName(sessionAccountName)
        val contestCreators = contestRepository.findContestCreators(contest.id)
        if (!haveAuthorityOfSeeSubmissions(sessionAccount, accountName, contestCreators, contest)) {
            throw Error("アクセス権限がありません")
        }
        sharedSubmissionService.getSubmissionOfAccount(accountName, contest.id)
    } catch (e: Error) {
        print(e)
        null
    }

    fun getContestInfoByName(contestName: String): ContestInfo?  =
        contestRepository.findByName(contestName)

    fun submitAnswerToContest(requestSubmission: RequestSubmission,
                              httpServletRequest: HttpServletRequest,
                              httpServletResponse: HttpServletResponse
    ): SubmissionInfo {
        val contest = getContestInfoByContestId(requestSubmission.contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)

        val account = sharedAccountService.getAccountByName(accountName)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        val contestCreators = contestRepository.findContestCreators(contest.id)

        if (!haveAuthOfSubmit(account, contestCreators, contest)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        val latestSubmit = sharedSubmissionService.getSubmissionOfAccount(accountName, contest.id)
            .maxBy { it.submitTime }

        val nowTime = Timestamp(System.currentTimeMillis())

        if (latestSubmit != null && nowTime.time - latestSubmit.submitTime.time <= SUBMIT_INTERVAL_TIME) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        val reg = Regex(":")
        if (reg.containsMatchIn(requestSubmission.statement)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        sharedSessionService.createNewSession(accountName, httpServletResponse)
        return sharedSubmissionService.submitAnswer(requestSubmission.indexOfContest, contest.id,
            requestSubmission.statement, account.name)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)

    }

    fun getContestProblems(contestId: String,
                           httpServletRequest: HttpServletRequest) : List<ProblemInfo>?  {
        return try{
            val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            val account = sharedAccountService.getAccountByName(accountName ?: "")
            val contest = contestRepository.findByContestId(contestId) ?: throw Error("コンテストが見つかりません")
            val contestCreators = contestRepository.findContestCreators(contest.id)

            if (haveAuthorityOfSeeProblems(account, contestCreators, contest)) {
                sharedProblemService.getProblemsByContestId(contest.id)
            } else {
                listOf()
            }
        } catch (e: Error) {
            print(e)
            null
        }
    }

    fun getContestInfoByContestId(id: String): ContestInfo? =
        try {
            contestRepository.findByContestId(id)
        } catch (e: Error) {
            print(e)
            null
        }

    fun getLatestContestsInfo(page: Int): LatestContestsInfo {
        val contests = contestRepository.findLatestContest(page)
        val allContestNum = contestRepository.finAllContestNum()
        return LatestContestsInfo(contests, allContestNum)
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
        val perf: Double
    )
    private fun calcInnerPerformance(rank: Int, participants: List<ParticipantInfo>): Double {
        val ratingLimit = 6000.0
        var high = ratingLimit
        var low = -ratingLimit
        val binarySearchTime = 100
        repeat(binarySearchTime) {
            val mid = (high + low) / 2
            var sum = 0.0
            participants.forEach {
                sum += 1.0 / (1.0 + 6.0.pow((mid - it.innerRating) / 400.0))
            }
            if (sum < rank - 0.5) {
                high = mid
            } else {
                low = mid
            }
        }
        return high
    }
    private fun calcParticipantsResult(participants: List<ParticipantInfo>,
                               ratedBound: Int
    ): List<ParticipantResult> {
        val performances = mutableListOf<Double>()
        val resultPerformances = mutableListOf<Double>()
        val resultParticipants = mutableListOf<ParticipantResult>()
        participants.forEach{
            val perf = calcInnerPerformance(it.rank, participants)
            val realPerf = perf.coerceAtMost(ratedBound + 400.0)
            performances.add(perf)
            resultPerformances.add(realPerf)
        }

        participants.forEachIndexed{ index, it ->
            val newRating: Double
            val newInnerRating: Double
            val perf = performances[index]
            val rPerf = resultPerformances[index]
            val f = {x: Double -> 2.0.pow(x / 800.0) }
            val g = {x: Double -> 800 * ln(x) / ln(2.0) }
            if (it.partNum == 0) {
                newRating = perf
                newInnerRating = rPerf
            } else {
                newRating = 0.9 * it.innerRating + 0.1 * perf
                newInnerRating = g(0.9 * f(it.rating) + 0.1 * f(rPerf))
            }
            resultParticipants.add(ParticipantResult(it.name,newInnerRating, newRating, rPerf))
        }
        return resultParticipants
    }
    fun updateRating(contestInfo: ContestInfo): List<ParticipantResult> {

        if (contestInfo.endTime > Timestamp(System.currentTimeMillis())) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        if (contestInfo.ratingCalculated) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        if (contestInfo.ratedBound <= 0) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        // レート計算ロック
        contestRepository.changeToEndCalcRating(contestInfo.id)

        val contestResult = sharedContestService.getContestRanking(contestInfo.id, null, null)
            ?.rankingList ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
        val participants = mutableListOf<ParticipantInfo>()
        var ratedRank = 0
        contestResult.forEach{
            val accountInfo = sharedAccountService.getAccountByName(it.accountName)
            if (accountInfo != null && sharedAccountService.calcCorrectionRate(accountInfo) < contestInfo.ratedBound) {
                ratedRank += 1
                var innerRating = accountInfo.innerRating
                if (accountInfo.partNum == 0) {
                    innerRating = contestInfo.ratedBound / 2.0
                }
                participants.add(ParticipantInfo(accountInfo.name,
                    ratedRank,
                    accountInfo.partNum,
                    innerRating,
                    accountInfo.rating))
            }
        }
        val participantsResult = calcParticipantsResult(participants, contestInfo.ratedBound)
        participantsResult.forEach{
            sharedAccountService.updateAccountRating(contestInfo.id, it.name,
                it.rating, it.innerRating, it.perf.toInt())
        }
        return participantsResult
    }
}