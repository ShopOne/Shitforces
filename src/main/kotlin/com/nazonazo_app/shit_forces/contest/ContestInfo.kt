package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.Utils
import java.sql.Timestamp

data class ContestInfo(
        val shortName: String,
        val name: String,
        val statement: String,
        val startTime: Timestamp,
        val endTime: Timestamp,
        val contestType: String,
        val rated: Boolean
) {
    val unixStartTime: Long = startTime.time
    val startTimeAMPM: String = Utils().formatTimestamp(startTime)
    val endTimeAMPM: String = Utils().formatTimestamp(endTime)
}
data class RequestRanking(val rankingList: List<ContestRankingAccountInfo>,
                          val acceptedList: List<Pair<Int, Int>>,
                          val partAccountNum: Int,
                          val requestAccountRank: Int?)
data class ContestRankingAccountInfo(val accountName: String,
                                     val score: Int,
                                     val penalty: Int,
                                     val acceptList: List<Pair<Int, Timestamp>>,
                                     var ranking: Int?)
