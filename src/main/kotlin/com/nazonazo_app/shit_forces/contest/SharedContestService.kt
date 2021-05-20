package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.ResponseAccount
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class SharedContestService(
    private val contestRepository: ContestRepository,
    private val sharedProblemService: SharedProblemService,
    private val sharedSubmissionService: SharedSubmissionService,
    private val sharedAccountService: SharedAccountService
) {
    data class AccountAcceptInfo(
        val name: String,
        val submitTime: List<Int>,
        val isAccept: List<Boolean>,
        val penaltyOfWrong: Int
    )
    fun getSolvedProblemOnContest(
        contest: ContestInfo,
        submissionList: List<SubmissionInfo>
    ): List<Pair<Int, Int>> {
        val contestProblemNum = sharedProblemService.getProblemsByContestId(contest.id).size
        val submitAccounts = Array<MutableSet<String>>(contestProblemNum) { mutableSetOf() }
        val acceptAccounts = Array<MutableSet<String>>(contestProblemNum) { mutableSetOf() }
        submissionList
            .filter { contest.startTime <= it.submitTime && it.submitTime <= contest.endTime }
            .forEach {
                submitAccounts[it.indexOfContest].add(it.accountName)
                if (it.result == SubmissionResult.ACCEPTED) acceptAccounts[it.indexOfContest].add(it.accountName)
            }
        return submitAccounts.mapIndexed { index, acNum ->
            Pair(acceptAccounts[index].size, acNum.size)
        }
    }
    private fun setRankingOfInfo(ranking: MutableList<ContestRankingAccountInfo>): List<ContestRankingAccountInfo> {
        ranking.sortWith(rankingComparator())
        var rank = 1
        for (idx in ranking.indices) {
            if (idx == 0 ||
                ranking[idx - 1].score != ranking[idx].score ||
                ranking[idx - 1].penalty != ranking[idx].penalty) {
                rank = idx + 1
            }
            ranking[idx].ranking = rank
        }
        return ranking.toList()
    }
    private fun getContestRankByICPC(
        problemsInfo: List<ProblemInfo>,
        submissionList: List<SubmissionInfo>,
        penalty: Int,
        startTime: Long
    ): List<ContestRankingAccountInfo> {
        val accountAcceptedProblemInfo = getAccountsAcceptInfo(submissionList, problemsInfo.size, startTime, penalty)
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        accountAcceptedProblemInfo.forEach {
            var score = 0
            var penaResult = it.penaltyOfWrong
            val acceptProblem = mutableListOf<Int>()
            it.isAccept.forEachIndexed { index, result ->
                if (result) {
                    score += problemsInfo[index].point
                    penaResult += it.submitTime[index]
                    acceptProblem.add(index)
                }
            }
            ranking.add(ContestRankingAccountInfo(it.name,
                score,
                penaResult,
                acceptProblem,
                it.submitTime,
                -1))
        }
        return setRankingOfInfo(ranking)
    }
    private fun getContestRankByAtCoder(
        problemsInfo: List<ProblemInfo>,
        submissionList: List<SubmissionInfo>,
        penalty: Int,
        startTime: Long
    ): List<ContestRankingAccountInfo> {
        val accountAcceptedProblemInfo = getAccountsAcceptInfo(submissionList, problemsInfo.size, startTime, penalty)
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        accountAcceptedProblemInfo.forEach {
            var score = 0
            var latestSubmit = 0
            val acceptProblem = mutableListOf<Int>()
            it.isAccept.forEachIndexed { index, result ->
                if (result) {
                    score += problemsInfo[index].point
                    acceptProblem.add(index)
                    latestSubmit = latestSubmit.coerceAtLeast(it.submitTime[index])
                }
            }
            ranking.add(ContestRankingAccountInfo(it.name,
                score,
                it.penaltyOfWrong + latestSubmit,
                acceptProblem,
                it.submitTime,
                -1))
        }
        return setRankingOfInfo(ranking)
    }
    private fun getAccountsAcceptInfo(
        submissionList: List<SubmissionInfo>,
        problemNum: Int,
        startTime: Long,
        penalty: Int
    ): List<AccountAcceptInfo> {
        val countOfSubmit: MutableMap<String, MutableList<Int>> = mutableMapOf()
        val timeOfSubmit: MutableMap<String, MutableList<Int>> = mutableMapOf()
        val solvedProblem: MutableMap<String, MutableList<Boolean>> = mutableMapOf()
        val submitAccount = mutableSetOf<String>()
        submissionList
            .sortedBy { it.submitTime }
            .forEach {
                val accountCountOfSubmit = countOfSubmit.getOrDefault(it.accountName, MutableList(problemNum) { 0 })
                val accountSolvedProblem = solvedProblem.getOrDefault(it.accountName, MutableList(problemNum) { false })
                val accountTimeOfSubmit = timeOfSubmit.getOrDefault(it.accountName, MutableList(problemNum) { 0 })
                submitAccount.add(it.accountName)
                if (it.result === SubmissionResult.ACCEPTED && !accountSolvedProblem[it.indexOfContest]) {
                    accountSolvedProblem[it.indexOfContest] = true
                    accountTimeOfSubmit[it.indexOfContest] =
                        ((it.submitTime.time - startTime) / 1000.0).toInt()
                    timeOfSubmit[it.accountName] = accountTimeOfSubmit
                    solvedProblem[it.accountName] = accountSolvedProblem
                } else if (it.result === SubmissionResult.WRONG_ANSWER && !accountSolvedProblem[it.indexOfContest]) {
                    accountCountOfSubmit[it.indexOfContest] += 1
                    countOfSubmit[it.accountName] = accountCountOfSubmit
                }
            }
        return submitAccount.map {
            var penaResult = 0
            val accountCountOFSubmit = countOfSubmit.getOrDefault(it, MutableList(problemNum) { 0 })
            solvedProblem[it]?.forEachIndexed { idx, result ->
                if (result) {
                    penaResult += penalty * accountCountOFSubmit[idx]
                }
            }
            AccountAcceptInfo(it,
                timeOfSubmit[it]?.toList() ?: List(problemNum) { 0 },
                solvedProblem[it] ?: List(problemNum) { false },
                penaResult)
        }
    }
    private fun rankingComparator(): Comparator<ContestRankingAccountInfo> {
        return Comparator { left, right ->
            if (left.score != right.score) {
                right.score - left.score
            } else {
                left.penalty - right.penalty
            }
        }
    }
    private fun getFirstAcceptAccounts(orderedSubmissionInfo: List<SubmissionInfo>, problemNum: Int): List<ResponseAccount?> {
        val firstAcceptAccounts = MutableList<ResponseAccount?>(problemNum) { null }
        orderedSubmissionInfo
            .filter { it.result == SubmissionResult.ACCEPTED }
            .forEach {
                if (firstAcceptAccounts[it.indexOfContest] == null) {
                    val account = sharedAccountService.getAccountByName(it.accountName)!!
                    firstAcceptAccounts[it.indexOfContest] = ResponseAccount(account.name,
                        sharedAccountService.calcCorrectionRate(account), account.partNum, account.authority.name)
                }
            }
        return firstAcceptAccounts.toList()
    }
    fun getContestRanking(
        contestId: String,
        page: Int?,
        requestAccountName: String?
    ): RequestRanking? {
        return try {
            val contest = contestRepository.findByContestId(contestId) ?: throw Error("コンテストが見つかりません")
            val submissionList = sharedSubmissionService.getValidContestSubmission(contest)
            val contestProblems = sharedProblemService.getProblemsByContestId(contest.id)
            val rankingList = when (contest.contestType) {
                ContestInfo.ContestType.ICPC -> getContestRankByICPC(contestProblems,
                    submissionList,
                    contest.penalty,
                    contest.startTime.time)
                ContestInfo.ContestType.ATCODER -> getContestRankByAtCoder(contestProblems,
                    submissionList,
                    contest.penalty,
                    contest.startTime.time)
                else -> throw Error("不正なコンテスト形式です")
            }
            val solvedProblems = getSolvedProblemOnContest(contest, submissionList)
            val requestAccountInfo: ContestRankingAccountInfo? = rankingList.find { it.accountName == requestAccountName }

            val requestRankingList: MutableList<ContestRankingAccountInfo> = if (page == null)
                rankingList.toMutableList()
            else
                rankingList
                    .filterIndexed { idx, _ -> page * ONE_PAGE_SIZE <= idx && idx < (page + 1) * ONE_PAGE_SIZE }
                    .toMutableList()

            if (requestAccountInfo != null)
                requestRankingList.add(requestAccountInfo)

            RequestRanking(
                requestRankingList,
                solvedProblems,
                getFirstAcceptAccounts(submissionList, contestProblems.size),
                rankingList.size,
                requestAccountInfo?.ranking)
        } catch (e: Error) {
            print(e)
            return null
        }
    }
}
