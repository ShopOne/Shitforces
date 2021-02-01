package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import org.springframework.stereotype.Service

@Service
class SharedContestService(private val contestRepository: ContestRepository,
                           private val sharedProblemService: SharedProblemService,
                           private val sharedSubmissionService: SharedSubmissionService
){
    fun getSolvedProblemOnContest(contest: ContestInfo): List<Pair<Int,Int>>{
        val contestProblemNum = sharedProblemService.getProblemsByContestName(contest.name).size
        val submissionList = sharedSubmissionService.getContestSubmissionInTime(contest)
        val submitAccounts = Array<MutableSet<String>>(contestProblemNum){ mutableSetOf() }
        val acceptAccounts = Array<MutableSet<String>>(contestProblemNum){ mutableSetOf() }
        submissionList
            .filter { contest.startTime <= it.submitTime  && it.submitTime <= contest.endTime}
            .forEach {
                submitAccounts[it.indexOfContest].add(it.accountName)
                if (it.result == SubmissionResult.ACCEPTED) acceptAccounts[it.indexOfContest].add(it.accountName)
            }
        return submitAccounts.mapIndexed{ index, acNum ->
            Pair(acceptAccounts[index].size, acNum.size)
        }
    }
    private fun getContestRankByICPC(problemsInfo: List<ProblemInfo>,
                                     submissionList: List<SubmissionInfo>,
                                     penalty: Int,
                                     startTime: Long): List<ContestRankingAccountInfo> {
        val accountAcceptedProblemInfo = getAccountsAcceptedProblemAndPenalty(submissionList, problemsInfo.size, startTime, penalty)
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        accountAcceptedProblemInfo.forEach{
            var score = 0
            var penaResult = 0
            val acceptList = mutableListOf<Int>()
            it.value.forEachIndexed{index, penaltyOfIt ->
                if (penaltyOfIt != -1) {
                    score += problemsInfo[index].point!!
                    penaResult += penaltyOfIt
                    acceptList.add(index)
                }
            }
            ranking.add(ContestRankingAccountInfo(it.key, score,
                penaResult,
                acceptList.toList(),
                null))
        }
        ranking.sortWith(rankingComparator())
        for ( idx in 0 until ranking.size) {
            ranking[idx].ranking = idx + 1
        }
        return ranking
    }
    private fun getContestRankByAtCoder(problemsInfo: List<ProblemInfo>,
                                        submissionList: List<SubmissionInfo>,
                                        penalty: Int,
                                        startTime: Long
    ): List<ContestRankingAccountInfo> {
        val accountAcceptedProblemInfo = getAccountsAcceptedProblemAndPenalty(submissionList, problemsInfo.size, startTime, penalty)
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        accountAcceptedProblemInfo.forEach{
            var score = 0
            var penaResult = 0
            val acceptList = mutableListOf<Int>()
            it.value.forEachIndexed{index, penaltyOfIt ->
                    if (penaltyOfIt != -1) {
                        score += problemsInfo[index].point!!
                        penaResult = penaResult.coerceAtLeast(penaltyOfIt)
                        acceptList.add(index)
                    }
            }
            ranking.add(ContestRankingAccountInfo(it.key, score,
                penaResult,
                acceptList.toList(),
                null))
        }
        ranking.sortWith(rankingComparator())
        for ( idx in 0 until ranking.size) {
            ranking[idx].ranking = idx + 1
        }
        return ranking
    }
    // Map<accountName, List<penalty>(-1 is not solved)
    private fun getAccountsAcceptedProblemAndPenalty(submissionList: List<SubmissionInfo>,
                                                     problemNum: Int,
                                                     startTime: Long,
                                                     penalty: Int
    ): Map<String, List<Int>> {
        val submitTimes: MutableMap<String,MutableList<Int>> = mutableMapOf()
        val submitPenalty: MutableMap<String,MutableList<Int>> = mutableMapOf()
        val solvedProblem: MutableMap<String,MutableList<Boolean>> = mutableMapOf()
        submissionList
            .sortedBy { it.submitTime }
            .forEach {
                val accountSubmitTimes = submitTimes.getOrDefault(it.accountName, MutableList(problemNum){0})
                val accountSubmitPenalty = submitPenalty.getOrDefault(it.accountName, MutableList(problemNum){-1})
                val accountSolvedProblem = solvedProblem.getOrDefault(it.accountName, MutableList(problemNum){false})
                if (it.result === SubmissionResult.ACCEPTED && !accountSolvedProblem[it.indexOfContest]) {
                    accountSolvedProblem[it.indexOfContest] = true
                    accountSubmitPenalty[it.indexOfContest] =
                        ((it.submitTime.time - startTime) / 1000.0).toInt() + accountSubmitTimes[it.indexOfContest] * penalty

                    submitPenalty[it.accountName] = accountSubmitPenalty
                    solvedProblem[it.accountName] = accountSolvedProblem
                } else if (it.result === SubmissionResult.WRONG_ANSWER) {
                    accountSubmitTimes[it.indexOfContest] += 1
                    submitTimes[it.accountName] = accountSubmitTimes
                }
            }
        return submitPenalty
    }
    private fun rankingComparator(): Comparator<ContestRankingAccountInfo> {
        return Comparator{left, right ->
            if (left.score != right.score) {
                right.score - left.score
            } else {
                left.penalty - right.penalty
            }
        }
    }
    fun getContestRanking(shortContestName: String,
                          page: Int?,
                          requestAccountName : String?
    ): RequestRanking? {
        return try{
            val contest = contestRepository.findByShortName(shortContestName)?: throw Error("コンテストが見つかりません")
            val submissionList = sharedSubmissionService.getContestSubmissionInTime(contest)
            val contestProblems = sharedProblemService.getProblemsByContestName(contest.name)
            val rankingList = when(contest.contestType) {
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
}