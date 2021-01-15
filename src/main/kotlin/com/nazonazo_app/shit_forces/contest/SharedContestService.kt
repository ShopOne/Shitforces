package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import com.nazonazo_app.shit_forces.submission.SubmissionResult
import org.springframework.stereotype.Service
import java.sql.Timestamp

@Service
class SharedContestService(private val contestRepository: ContestRepository,
                           private val sharedProblemService: SharedProblemService,
                           private val sharedSubmissionService: SharedSubmissionService){
    fun getSolvedProblemOnContest(contest: ContestInfo): List<Pair<Int,Int>>{
        val contestProblemNum = sharedProblemService.getProblemsByContestName(contest.name).size
        val solvedProblems = MutableList(contestProblemNum) {Pair(0, 0)}
        val submissionList = sharedSubmissionService.getContestSubmissionInTime(contest)
        submissionList
            .filter { contest.startTime <= it.submitTime  && it.submitTime <= contest.endTime}
            .forEach {
                val pair = solvedProblems[it.indexOfContest]
                solvedProblems[it.indexOfContest] = Pair(pair.first + 1,
                    if (it.result == SubmissionResult.ACCEPTED) pair.second + 1
                    else pair.second)
            }
        return solvedProblems.toList()
    }
    private fun getContestRankByICPC(contest: ContestInfo): List<ContestRankingAccountInfo>{
        val submissionList = sharedSubmissionService.getContestSubmissionInTime(contest)
        val accountSubmitTime: MutableMap<String, MutableMap<Int, Timestamp>> = mutableMapOf()
        val ranking = mutableListOf<ContestRankingAccountInfo>()
        submissionList
            .filter { it.result == SubmissionResult.ACCEPTED }
            .filter { contest.startTime <= it.submitTime  && it.submitTime <= contest.endTime}
            .forEach {
                val submissions = accountSubmitTime.getOrDefault(it.accountName, mutableMapOf())
                val beforeTime = submissions.getOrDefault(it.indexOfContest, it.submitTime)
                submissions[it.indexOfContest] = if (it.submitTime >= beforeTime) beforeTime else beforeTime
                accountSubmitTime[it.accountName] = submissions
            }
        accountSubmitTime.forEach {
            var penaSum = 0
            // ペナルティは、10秒で1ポイント加算
            it.value.forEach{ submit ->
                penaSum += ((submit.value.time - contest.startTime.time).toInt()) / (1000 * 10)
            }
            ranking.add(ContestRankingAccountInfo(it.key, it.value.size, penaSum, it.value.toList(), null))
        }
        ranking.sortWith(Comparator{left, right ->
            if (left.score != right.score) {
                right.score - left.score
            } else {
                left.penalty - right.penalty
            }   })
        for ( idx in 0 until ranking.size) {
            ranking[idx].ranking = idx + 1
        }
        return ranking
    }
    fun getContestRanking(shortContestName: String,
                          page: Int?,
                          requestAccountName : String?): RequestRanking? {
        return try{
            val contest = contestRepository.findByShortName(shortContestName)?: throw Error("コンテストが見つかりません")
            //現在はICPC形式のみ
            val rankingList = getContestRankByICPC(contest)
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