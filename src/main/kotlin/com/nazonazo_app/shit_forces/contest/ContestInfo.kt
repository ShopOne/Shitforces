package com.nazonazo_app.shit_forces.contest

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
    enum class ContestType(val textName: String) {
        ICPC("ICPC"),
        ATCODER("AtCoder"),
        INVALID("INVALID")
    }
}

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

data class RequestContestInfoForUpdate(
    val id: String,
    val contestName: String,
    val startTime: Timestamp,
    val endTime: Timestamp,
    val penalty: Int,
    val ratedBound: Int,
    val contestType: String,
    val creators: List<RequestContestCreator>
)

data class RequestContestForPut(
    val penalty: Int,
    val statement: String,
    val problems: List<PutRequestProblem>
)

class RequestContestCreator(
    val accountName: String,
    val contestId: String,
    val position: String
)
