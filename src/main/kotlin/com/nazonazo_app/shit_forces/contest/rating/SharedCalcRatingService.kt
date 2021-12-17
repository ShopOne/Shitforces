package com.nazonazo_app.shit_forces.contest.rating

import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.contest.ContestInfo
import com.nazonazo_app.shit_forces.contest.SharedContestService
import org.springframework.stereotype.Service
import kotlin.math.ln
import kotlin.math.pow

@Service
class SharedCalcRatingService(
    val sharedContestService: SharedContestService,
    val sharedAccountService: SharedAccountService
) {
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
        val perf: Double,
        val rank: Int
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
            resultParticipants.add(ParticipantResult(it.name, newInnerRating, newRating, rPerf, it.rank))
        }
        return resultParticipants
    }
    fun calcAndUpdateRating(contestInfo: ContestInfo): List<ParticipantResult> {
        val contestResult = sharedContestService
            .getContestStandings(contestInfo.id, null, null)
            .accountStandings
        val participants = mutableListOf<ParticipantInfo>()
        var ratedRank = 0
        contestResult.forEach {
            val accountInfo = sharedAccountService.getAccountByName(it.accountName)
            if (accountInfo != null && accountInfo.calcCorrectionRate() < contestInfo.ratedBound) {
                ratedRank += 1
                var innerRating = accountInfo.innerRating
                if (accountInfo.partNum == 0) {
                    innerRating = contestInfo.ratedBound / 2.0
                }
                participants.add(
                    ParticipantInfo(
                        accountInfo.name,
                        ratedRank,
                        accountInfo.partNum,
                        innerRating,
                        accountInfo.rating
                    )
                )
            }
        }
        val participantsResult = calcParticipantsResult(participants, contestInfo.ratedBound)
        participantsResult.forEach {
            sharedAccountService.updateAccountRating(
                contestInfo.name, it.name,
                it.rating, it.innerRating, it.perf.toInt(), it.rank
            )
        }
        return participantsResult
    }
}
