package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.contest.rating.SharedCalcRatingService
import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import com.nazonazo_app.shit_forces.submission.ResponseContestSubmissionOfRaid
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import java.sql.Timestamp
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
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
    private val sharedProblemService: SharedProblemService,
    private val sharedSubmissionService: SharedSubmissionService,
    private val sharedCalcRatingService: SharedCalcRatingService
) {
    // コンテスト前 -> ADMIN かコンテスト関係者なら提出可能
    // コンテスト開始後 -> 誰でも
    // ただし、提出制限に引っかかっている場合は出来ない
    private fun haveAuthOfSubmit(
        sessionAccount: AccountInfo,
        contestCreators: List<ContestCreator>,
        contest: ContestInfo
    ): Boolean {
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        val latestSubmit = sharedSubmissionService.getSubmissionOfAccount(sessionAccount.name, contest.id)
            .maxBy { it.submitTime }
        val isEnoughInterval = latestSubmit == null ||
            nowTimeStamp.time - latestSubmit.submitTime.time > SUBMIT_INTERVAL_TIME
        return isEnoughInterval &&
            (contest.startTime <= nowTimeStamp ||
                sessionAccount.authority == AccountInfo.AccountAuthority.ADMINISTER ||
                contestCreators.find { it.accountName == sessionAccount.name } != null)
    }

    // コンテスト前 -> ADMIN かコンテスト関係者なら閲覧可能
    // コンテスト開始後 -> 誰でも
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

    // コンテスト終了前 -> ADMIN かコンテスト関係者なら閲覧可能
    // コンテスト終了後 -> 誰でも
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
    private fun haveAuthOfSeeSubmissions(
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
    ): List<SubmissionInfo> {
        val contest = contestRepository.findByContestId(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        // 後々の仕様として、自分以外の提出を見れる機能も追加する予定なので、例外ではなく空文字列としている
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest) ?: ""
        val sessionAccount = sharedAccountService.getAccountByName(sessionAccountName)
        val contestCreators = contestRepository.findContestCreators(contest.id)
        if (!haveAuthOfSeeSubmissions(sessionAccount, accountName, contestCreators, contest)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return sharedSubmissionService.getSubmissionOfAccount(accountName, contest.id)
    }

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
        val reg = Regex(":")
        // : はスペシャルジャッジ用に使うので、答えとしてNGにしている
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
        val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
        val account = sharedAccountService.getAccountByName(accountName ?: "")
        val contest = contestRepository.findByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val contestCreators = contestRepository.findContestCreators(contest.id)
        if (haveAuthOfSeeProblems(account, contestCreators, contest)) {
            return sharedProblemService.getProblemsByContestId(contest.id)
        }
        return listOf()
    }

    fun getContestInfoByContestId(id: String): ContestInfo? =
        contestRepository.findByContestId(id)

    fun getLatestContestsInfo(page: Int): LatestContestsInfo {
        val contests = contestRepository.findLatestContest(page)
            .map { ResponseContestInfoInterface.build(it) }
        val allContestNum = contestRepository.findAllContestNum()
        return LatestContestsInfo(contests, allContestNum)
    }

    fun getUpcomingContestsInfo(): LatestContestsInfo {
        val contests = contestRepository.findUpcomingContest()
            .map { ResponseContestInfoInterface.build(it) }
        val allContestNum = contestRepository.findUpcomingContestNum()
        return LatestContestsInfo(contests, allContestNum)
    }

    fun getActiveContestsInfo(): LatestContestsInfo {
        val contests = contestRepository.findActiveContest()
            .map { ResponseContestInfoInterface.build(it) }
        val allContestNum = contestRepository.findActiveContestNum()
        return LatestContestsInfo(contests, allContestNum)
    }

    fun getPastContestsInfo(contestPage: Int): LatestContestsInfo {
        val contests = contestRepository.findPastContest(contestPage)
            .map { ResponseContestInfoInterface.build(it) }
        val allContestNum = contestRepository.findPastContestNum()
        return LatestContestsInfo(contests, allContestNum)
    }

    fun addContest(requestContest: RequestContestInfoForUpdate) {
        val contestType = when (requestContest.contestType) {
            ContestInfo.ContestType.ICPC.textName -> ContestInfo.ContestType.ICPC
            ContestInfo.ContestType.ATCODER.textName -> ContestInfo.ContestType.ATCODER
            ContestInfo.ContestType.RAID.textName -> ContestInfo.ContestType.RAID
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

    fun updateRating(contestId: String, httpServletRequest: HttpServletRequest) {
        val contestInfo = getContestInfoByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        val accountInfo = sharedAccountService.getAccountByName(sessionAccountName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        if (accountInfo.authority !== AccountInfo.AccountAuthority.ADMINISTER) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
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
        sharedCalcRatingService.calcAndUpdateRating(contestInfo)
    }
    fun putContestInfo(
        contestId: String,
        putRequestContest: RequestContestForPut,
        httpServletRequest: HttpServletRequest
    ) {
        val contestInfo = validateContestUpdatable(contestId, httpServletRequest)
        val now = Timestamp(System.currentTimeMillis())
        val validSubmission = sharedSubmissionService.getValidContestSubmission(contestInfo)
        if (now >= contestInfo.startTime && validSubmission.isNotEmpty()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        val problems = putRequestContest.problems.mapIndexed { index, it ->
            ProblemInfo(contestId, it.point, it.statement, index, it.answer, it.isQuiz)
        }
        contestRepository.updateContestInfoByPutRequestContest(contestId, putRequestContest)
        sharedProblemService.updateContestProblem(contestInfo.id, problems)
    }

    fun patchContestInfo(
        contestId: String,
        putRequestContest: RequestContestForPut,
        httpServletRequest: HttpServletRequest
    ) {
        val contestInfo = validateContestUpdatable(contestId, httpServletRequest)
        val validSubmission = sharedSubmissionService.getValidContestSubmission(contestInfo)
        if (validSubmission.isEmpty()) {
            // 過去問編集用の処理なので、putContestを行う
            putContestInfo(contestId, putRequestContest, httpServletRequest)
            return
        }
        val nowContestProblem = sharedProblemService.getProblemsByContestId(contestId)
        val newProblems = putRequestContest.problems.mapIndexed { index, it ->
            ProblemInfo(contestId, it.point, it.statement, index, it.answer, it.isQuiz)
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

    fun getContestSubmissionOfRaid(
        contestId: String,
        indexOfContest: Int
    ): List<ResponseContestSubmissionOfRaid> {
        val contestInfo = contestRepository.findByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        if (contestInfo.contestType != ContestInfo.ContestType.RAID) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        val submissionList = mutableListOf<ResponseContestSubmissionOfRaid>()
        val submitCount = mutableMapOf<String, Int>()
        val acceptSet = mutableSetOf<String>()
        sharedSubmissionService.getContestSubmissionInTime(contestInfo).forEach {
            if (it.indexOfContest == indexOfContest) {
                val count = submitCount.getOrDefault(it.statement, 0)
                if (it.result == SubmissionResult.ACCEPTED) {
                    acceptSet.add(it.statement)
                }
                submitCount[it.statement] = count + 1
            }
        }
        submitCount.forEach { submit ->
            submissionList.add(ResponseContestSubmissionOfRaid(
                submit.key,
                submit.value,
                acceptSet.find { it == submit.key } != null
            ))
        }
        val llt = submissionList.sorted()
        return submissionList.sorted()
    }
}
