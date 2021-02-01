package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.Utils
import java.sql.Timestamp

data class ContestInfo(
        val shortName: String,
        val name: String,
        val statement: String,
        val startTime: Timestamp,
        val endTime: Timestamp,
        val penalty: Int,
        val contestType: ContestType,
        val rated: Boolean
) {
    val unixStartTime: Long = startTime.time
    val startTimeAMPM: String = Utils().formatTimestamp(startTime)
    val endTimeAMPM: String = Utils().formatTimestamp(endTime)
    enum class ContestType(val textName: String) {
        ICPC("ICPC"),
        ATCODER("AtCoder"),
        INVALID("INVALID")
    }
}
data class RequestRanking(val rankingList: List<ContestRankingAccountInfo>,
                          val acPerSubmit: List<Pair<Int, Int>>,
                          val partAccountNum: Int,
                          val requestAccountRank: Int?)
data class ContestRankingAccountInfo(val accountName: String,
                                     val score: Int,
                                     val penalty: Int,
                                     val acceptList: List<Int>,
                                     var ranking: Int?)
