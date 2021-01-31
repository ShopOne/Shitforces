package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import org.springframework.stereotype.Service
import java.sql.Timestamp

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
    private fun getContestRankByICPC(submissionList: List<SubmissionInfo>, startTime: Long): List<ContestRankingAccountInfo> {
        val accountSubmitTime = getAccountSubmissionTime(submissionList)
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        accountSubmitTime.forEach {
            var penaSum = 0
            // ペナルティは、10秒で1ポイント加算
            it.value.forEach{ submit ->
                penaSum += ((submit.value.time - startTime).toInt()) / (1000 * 10)
            }
            ranking.add(ContestRankingAccountInfo(it.key, it.value.size, penaSum, it.value.toList(), null))
        }
        ranking.sortWith(rankingComparator())
        for ( idx in 0 until ranking.size) {
            ranking[idx].ranking = idx + 1
        }
        return ranking
    }
    private fun getContestRankByAtCoder(submissionList: List<SubmissionInfo>, startTime: Long): List<ContestRankingAccountInfo> {
        val accountSubmitTime = getAccountSubmissionTime(submissionList)
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        accountSubmitTime.forEach{
            val penalty = ((it.value.maxBy { submit -> submit.value.time }?.value?.time ?: startTime) - startTime) / (1000 * 10.0)
            ranking.add(ContestRankingAccountInfo(it.key, it.value.size, (penalty).toInt(), it.value.toList(), null))
        }
        ranking.sortWith(rankingComparator())
        for ( idx in 0 until ranking.size) {
            ranking[idx].ranking = idx + 1
        }
        return ranking
    }
    private fun getValidSubmissionInContest(contest: ContestInfo): List<SubmissionInfo> {
        return sharedSubmissionService.getContestSubmissionInTime(contest)
            .filter { it.result == SubmissionResult.ACCEPTED }
            .filter { contest.startTime <= it.submitTime && it.submitTime <= contest.endTime }
    }
    private fun getAccountSubmissionTime(submissionList: List<SubmissionInfo>): Map<String, MutableMap<Int, Timestamp>> {
        val accountSubmitTime: MutableMap<String, MutableMap<Int, Timestamp>> = mutableMapOf()
        submissionList
            .forEach {
                val submissions = accountSubmitTime.getOrDefault(it.accountName, mutableMapOf())
                val beforeTime = submissions.getOrDefault(it.indexOfContest, it.submitTime)
                submissions[it.indexOfContest] = if (it.submitTime >= beforeTime) beforeTime else beforeTime
                accountSubmitTime[it.accountName] = submissions
            }
        return accountSubmitTime
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
            val submissionList = getValidSubmissionInContest(contest)
            val rankingList = when(contest.contestType) {
                ContestInfo.ContestType.ICPC -> getContestRankByICPC(submissionList, contest.startTime.time)
                ContestInfo.ContestType.ATCODER -> getContestRankByAtCoder(submissionList, contest.startTime.time)
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