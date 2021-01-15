package com.nazonazo_app.shit_forces.contest

import java.sql.Timestamp

data class ContestInfo(
        val shortName: String,
        val name: String,
        val statement: String,
        val startTime: Timestamp,
        val endTime: Timestamp,
        val contestType: String,
        val rated: Boolean) {
    val unixStartTime: Long = startTime.time
}
data class RequestRanking(val rankingList: List<ContestRankingAccountInfo>,
                          val acceptedList: List<Pair<Int, Int>>,
                          val attendAccountNum: Int,
                          val requestAccountRank: Int?)
data class ContestRankingAccountInfo(val accountName: String,
                                     val score: Int,
                                     val penalty: Int,
                                     val acceptList: List<Pair<Int, Timestamp>>,
                                     var ranking: Int?)
