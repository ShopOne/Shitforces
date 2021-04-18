package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import java.sql.Timestamp
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.math.ln
import kotlin.math.pow
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class ContestService(
    private val contestRepository: ContestRepository,
    private val sharedSessionService: SharedSessionService,
    private val sharedAccountService: SharedAccountService,
    private val sharedContestService: SharedContestService,
    private val sharedProblemService: SharedProblemService,
    private val sharedSubmissionService: SharedSubmissionService
) {
    private fun haveAuthOfSubmit(
        sessionAccount: AccountInfo,
        contestCreators: List<ContestCreator>,
        contest: ContestInfo
    ): Boolean {
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return contest.startTime <= nowTimeStamp ||
                sessionAccount.authority == AccountInfo.AccountAuthority.ADMINISTER ||
                contestCreators.find { it.accountName == sessionAccount.name } != null
    }

    private fun haveAuthOfSeeProblems(
        sessionAccount: AccountInfo?,
        contestCreators: List<ContestCreator>,
        contest: ContestInfo
    ): Boolean {
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return (contest.startTime <= nowTimeStamp ||
                sessionAccount?.authority == AccountInfo.AccountAuthority.ADMINISTER ||
                contestCreators.find { it.accountName == sessionAccount?.name } != null)
    }

    private fun haveAuthOfSeeAnswer(
        sessionAccount: AccountInfo?,
        contestCreators: List<ContestCreator>,
        contest: ContestInfo
    ): Boolean {
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return (contest.endTime <= nowTimeStamp ||
                sessionAccount?.authority == AccountInfo.AccountAuthority.ADMINISTER ||
                contestCreators.find { it.accountName == sessionAccount?.name } != null)
    }

    // コンテスト終了 -> 誰のでも見れる
    // コンテスト中(前) -> 自分のアカウントの物のみ見れる ただしAdminは全部見れる(後々Writerだけ等絞るようにしていく)
    private fun haveAuthorityOfSeeSubmissions(
        sessionAccount: AccountInfo?,
        accountName: String,
        contestCreators: List<ContestCreator>,
        contest: ContestInfo
    ): Boolean {
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        return (contest.endTime <= nowTimeStamp ||
                sessionAccount?.authority == AccountInfo.AccountAuthority.ADMINISTER ||
                sessionAccount?.name == accountName ||
                contestCreators.find { it.accountName == sessionAccount?.name } != null)
    }

    fun getAccountSubmissionOfContest(
        accountName: String,
        id: String,
        httpServletRequest: HttpServletRequest
    ): List<SubmissionInfo>? =
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

    fun getContestInfoByName(contestName: String): ContestInfo? =
        contestRepository.findByName(contestName)

    fun submitAnswerToContest(
        requestSubmission: RequestSubmission,
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

    fun getContestProblems(
        contestId: String,
        httpServletRequest: HttpServletRequest
    ): List<ProblemInfo>? {
        return try {
            val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            val account = sharedAccountService.getAccountByName(accountName ?: "")
            val contest = contestRepository.findByContestId(contestId) ?: throw Error("コンテストが見つかりません")
            val contestCreators = contestRepository.findContestCreators(contest.id)

            if (haveAuthOfSeeProblems(account, contestCreators, contest)) {
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
        val allContestNum = contestRepository.findAllContestNum()
        return LatestContestsInfo(contests, allContestNum)
    }

    fun addContest(requestContest: RequestContest) {
        val contestType = when (requestContest.contestType) {
            ContestInfo.ContestType.ICPC.textName -> ContestInfo.ContestType.ICPC
            ContestInfo.ContestType.ATCODER.textName -> ContestInfo.ContestType.ATCODER
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }
        val creators = requestContest.creators.map {
            val position = when (it.position.toUpperCase()) {
                "COORDINATOR" -> ContestCreator.ContestPosition.COORDINATOR
                "WRITER" -> ContestCreator.ContestPosition.WRITER
                else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST)
            }
            ContestCreator(it.accountName, it.contestId, position)
        }
        val contest = ContestInfo(requestContest.id, requestContest.contestName, "",
            requestContest.startTime, requestContest.endTime, requestContest.penalty, requestContest.ratedBound,
            contestType, false, creators)
        contestRepository.addContest(contest)
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
    private fun calcParticipantsResult(
        participants: List<ParticipantInfo>,
        ratedBound: Int
    ): List<ParticipantResult> {
        val performances = mutableListOf<Double>()
        val resultPerformances = mutableListOf<Double>()
        val resultParticipants = mutableListOf<ParticipantResult>()
        participants.forEach {
            val perf = calcInnerPerformance(it.rank, participants)
            val realPerf = perf.coerceAtMost(ratedBound + 400.0)
            performances.add(perf)
            resultPerformances.add(realPerf)
        }

        participants.forEachIndexed { index, it ->
            val newRating: Double
            val newInnerRating: Double
            val perf = performances[index]
            val rPerf = resultPerformances[index]
            val f = { x: Double -> 2.0.pow(x / 800.0) }
            val g = { x: Double -> 800 * ln(x) / ln(2.0) }
            if (it.partNum == 0) {
                newRating = rPerf
                newInnerRating = perf
            } else {
                newRating = g(0.9 * f(it.rating) + 0.1 * f(rPerf))
                newInnerRating = 0.9 * it.innerRating + 0.1 * perf
            }
            resultParticipants.add(ParticipantResult(it.name, newInnerRating, newRating, rPerf))
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
        contestResult.forEach {
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
        participantsResult.forEach {
            sharedAccountService.updateAccountRating(contestInfo.id, it.name,
                it.rating, it.innerRating, it.perf.toInt())
        }
        return participantsResult
    }
    fun putContestInfo(
        contestId: String,
        putRequestContest: PutRequestContest,
        httpServletRequest: HttpServletRequest
    ) {
        val contestInfo = validateContestUpdatable(contestId, httpServletRequest)
        val now = Timestamp(System.currentTimeMillis())
        val validSubmission = sharedSubmissionService.getContestSubmissionInTime(contestInfo)
        if (now >= contestInfo.startTime && validSubmission.isNotEmpty()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        val problems = putRequestContest.problems.mapIndexed { index, it ->
            ProblemInfo(contestId, it.point, it.statement, index, it.answer)
        }
        contestRepository.updateContestInfoByPutRequestContest(contestId, putRequestContest)
        sharedProblemService.updateContestProblem(contestInfo.id, problems)
    }

    fun patchContestInfo(
        contestId: String,
        putRequestContest: PutRequestContest,
        httpServletRequest: HttpServletRequest
    ) {
        val contestInfo = validateContestUpdatable(contestId, httpServletRequest)
        val validSubmission = sharedSubmissionService.getContestSubmissionInTime(contestInfo)
        if (validSubmission.isEmpty()) {
            // 過去問編集用の処理なので、putContestを行う
            putContestInfo(contestId, putRequestContest, httpServletRequest)
            return
        }
        val nowContestProblem = sharedProblemService.getProblemsByContestId(contestId)
        val newProblems = putRequestContest.problems.mapIndexed { index, it ->
            ProblemInfo(contestId, it.point, it.statement, index, it.answer)
        }
        if (nowContestProblem.size != newProblems.size) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }
        if (contestInfo.penalty != putRequestContest.penalty) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }
        val problemNum = nowContestProblem.size
        for (i in 0 until problemNum) {
            if (nowContestProblem[i].answer != newProblems[i].answer ||
                    nowContestProblem[i].point != newProblems[i].point) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST)
            }
        }
        contestRepository.updateContestInfoByPutRequestContest(contestId, putRequestContest)
        sharedProblemService.updateContestProblemStatement(contestId, newProblems)
    }

    private fun validateContestUpdatable(
        contestId: String,
        httpServletRequest: HttpServletRequest
    ): ContestInfo {
        val contestInfo = getContestInfoByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        if (contestInfo.contestCreators.find { it.accountName == accountName } == null) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return contestInfo
    }

    fun getProblemAnswer(id: Int, httpServletRequest: HttpServletRequest): List<String> {
        val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        val sessionAccount = sharedAccountService.getAccountByName(accountName)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        val problemInfo = sharedProblemService.getProblemById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val contestId = problemInfo.contestId
        val contestInfo = getContestInfoByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
        if (!haveAuthOfSeeAnswer(sessionAccount, contestInfo.contestCreators, contestInfo)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return sharedProblemService.getAnswersById(id)
    }
}
