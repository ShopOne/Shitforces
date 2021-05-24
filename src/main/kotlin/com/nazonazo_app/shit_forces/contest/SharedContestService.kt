package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.ResponseAccountInfo
import com.nazonazo_app.shit_forces.account.ResponseAccountInfoInterface
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.contest.standings.ContestStandingsInfo
import com.nazonazo_app.shit_forces.contest.standings.SharedContestStandingsService
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class SharedContestService(
    private val contestRepository: ContestRepository,
    private val sharedProblemService: SharedProblemService,
    private val sharedSubmissionService: SharedSubmissionService,
    private val sharedAccountService: SharedAccountService,
    private val sharedContestStandingsService: SharedContestStandingsService
) {
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
    private fun getFirstAcceptAccounts(
        orderedSubmissionInfo: List<SubmissionInfo>,
        problemNum: Int
    ): List<ResponseAccountInfo?> {
        val firstAcceptAccounts = MutableList<ResponseAccountInfo?>(problemNum) { null }
        orderedSubmissionInfo
            .filter { it.result == SubmissionResult.ACCEPTED }
            .forEach {
                if (firstAcceptAccounts[it.indexOfContest] == null) {
                    val account = sharedAccountService.getAccountByName(it.accountName)!!
                    firstAcceptAccounts[it.indexOfContest] = ResponseAccountInfoInterface.build(account)
                }
            }
        return firstAcceptAccounts.toList()
    }

    fun getContestStandings(
        contestId: String,
        page: Int?,
        requestAccountName: String?
    ): ContestStandingsInfo {
        val contest = contestRepository.findByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val submissionList = sharedSubmissionService.getValidContestSubmission(contest)
            .sortedBy { it.submitTime }
        val contestProblems = sharedProblemService.getProblemsByContestId(contest.id)
        val solvedProblems = getSolvedProblemOnContest(contest, submissionList)
        var standingsList = sharedContestStandingsService
            .getAccountInfosOnContestStandings(contest, submissionList, contestProblems)
        val requestAccountRank = standingsList.find { it.accountName == requestAccountName }?.rank
        if (page != null) {
            standingsList = standingsList
                .filterIndexed { idx, _ -> page * ONE_PAGE_SIZE <= idx && idx < (page + 1) * ONE_PAGE_SIZE }
        }
        return ContestStandingsInfo(
            standingsList,
            solvedProblems,
            getFirstAcceptAccounts(submissionList, contestProblems.size),
            standingsList.size,
            requestAccountRank)
    }
}
