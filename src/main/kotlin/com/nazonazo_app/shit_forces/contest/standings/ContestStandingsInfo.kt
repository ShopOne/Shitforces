package com.nazonazo_app.shit_forces.contest.standings

import com.nazonazo_app.shit_forces.account.ResponseAccountInfo

data class ContestStandingsInfo(
    val accountStandings: List<AccountInfoOnContestStandings>,
    val acPerSubmit: List<Pair<Int, Int>>,
    val firstAcceptedList: List<ResponseAccountInfo?>,
    val partAccountNum: Int,
    val requestAccountRank: Int?
)
data class AccountInfoOnContestStandings(
    val accountName: String,
    val score: Int,
    val penalty: Int,
    val acceptList: List<Boolean>,
    val acceptTimeList: List<Int>,
    var rank: Int
) : Comparable<AccountInfoOnContestStandings> {
    override fun compareTo(other: AccountInfoOnContestStandings): Int {
        if (this.score != other.score) {
            return this.score - other.score
        }
        return this.penalty - other.penalty
    }
}
