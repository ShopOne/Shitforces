package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.Utils
import com.nazonazo_app.shit_forces.account.ResponseAccount
import com.nazonazo_app.shit_forces.problem.PutRequestProblem
import java.sql.Timestamp

data class ContestInfo(
    val id: String,
    val name: String,
    val statement: String,
    val startTime: Timestamp,
    val endTime: Timestamp,
    val penalty: Int,
    val ratedBound: Int,
    val contestType: ContestType,
    val ratingCalculated: Boolean,
    val contestCreators: List<ContestCreator>
) {
    val unixStartTime: Long = startTime.time
    val unixEndTime: Long = endTime.time
    val startTimeAMPM: String = Utils().formatTimestamp(startTime)
    val endTimeAMPM: String = Utils().formatTimestamp(endTime)
    enum class ContestType(val textName: String) {
        ICPC("ICPC"),
        ATCODER("AtCoder"),
        INVALID("INVALID")
    }
}
data class LatestContestsInfo(
    val contests: List<ContestInfo>,
    val allContestNum: Int
)
data class ContestCreator(
    val accountName: String,
    val contestId: String,
    val position: ContestPosition
) {
    enum class ContestPosition {
        WRITER,
        COORDINATOR,
        INVALID
    }
}
data class RequestContest(
    val id: String,
    val contestName: String,
    val startTime: Timestamp,
    val endTime: Timestamp,
    val penalty: Int,
    val ratedBound: Int,
    val contestType: String,
    val creators: List<RequestContestCreator>
)

data class PutRequestContest(
    val penalty: Int,
    val statement: String,
    val problems: List<PutRequestProblem>
)
class RequestContestCreator(
    val accountName: String,
    val contestId: String,
    val position: String
)
data class RequestRanking(
    val rankingList: List<ContestRankingAccountInfo>,
    val acPerSubmit: List<Pair<Int, Int>>,
    val firstAcceptedList: List<ResponseAccount?>,
    val partAccountNum: Int,
    val requestAccountRank: Int?
)
data class ContestRankingAccountInfo(
    val accountName: String,
    val score: Int,
    val penalty: Int,
    val acceptList: List<Int>,
    val acceptTimeList: List<Int>,
    var ranking: Int
)
