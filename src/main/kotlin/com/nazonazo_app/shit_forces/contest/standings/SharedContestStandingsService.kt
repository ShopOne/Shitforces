package com.nazonazo_app.shit_forces.contest.standings

import com.nazonazo_app.shit_forces.contest.ContestInfo
import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class SharedContestStandingsService {
    data class AccountAcceptInfo(
        val name: String,
        val submitTime: List<Int>,
        val isAccept: List<Boolean>,
        val penaltyOfWrong: Int
    )
    private fun setRankToAccountInfosOnContestStandings(
        standings: MutableList<AccountInfoOnContestStandings>
    ): List<AccountInfoOnContestStandings> {
        standings.sort()
        var rank = 1
        for (idx in standings.indices) {
            if (idx == 0 ||
                standings[idx - 1].score != standings[idx].score ||
                standings[idx - 1].penalty != standings[idx].penalty) {
                rank = idx + 1
            }
            standings[idx].rank = rank
        }
        return standings.toList()
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
            AccountAcceptInfo(
                it,
                timeOfSubmit[it]?.toList() ?: List(problemNum) { 0 },
                solvedProblem[it] ?: List(problemNum) { false },
                penaResult
            )
        }
    }
    private fun getAccountInfosOnContestStandingsByICPC(
        problemsInfo: List<ProblemInfo>,
        submissionList: List<SubmissionInfo>,
        penalty: Int,
        startTime: Long
    ): List<AccountInfoOnContestStandings> {
        val accountAcceptedProblemInfo = getAccountsAcceptInfo(submissionList, problemsInfo.size, startTime, penalty)
        val standings = mutableListOf<AccountInfoOnContestStandings>()
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
            standings.add(AccountInfoOnContestStandings(it.name,
                score,
                penaResult,
                acceptProblem,
                it.submitTime,
                -1))
        }
        return setRankToAccountInfosOnContestStandings(standings)
    }
    private fun getAccountInfosOnContestStandingsByAtCoder(
        problemsInfo: List<ProblemInfo>,
        submissionList: List<SubmissionInfo>,
        penalty: Int,
        startTime: Long
    ): List<AccountInfoOnContestStandings> {
        val accountAcceptedProblemInfo = getAccountsAcceptInfo(submissionList, problemsInfo.size, startTime, penalty)
        val standings = mutableListOf<AccountInfoOnContestStandings>()
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
            standings.add(AccountInfoOnContestStandings(it.name,
                score,
                it.penaltyOfWrong + latestSubmit,
                acceptProblem,
                it.submitTime,
                -1))
        }
        return setRankToAccountInfosOnContestStandings(standings)
    }
    fun getAccountInfosOnContestStandings(
        contest: ContestInfo,
        submissionList: List<SubmissionInfo>,
        contestProblems: List<ProblemInfo>
    ): List<AccountInfoOnContestStandings> {
        val getStandingsFunction = when (contest.contestType) {
            ContestInfo.ContestType.ATCODER -> ::getAccountInfosOnContestStandingsByAtCoder
            ContestInfo.ContestType.ICPC -> ::getAccountInfosOnContestStandingsByICPC
            else -> throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return getStandingsFunction(
            contestProblems,
            submissionList,
            contest.penalty,
            contest.startTime.time
        )
    }
}
