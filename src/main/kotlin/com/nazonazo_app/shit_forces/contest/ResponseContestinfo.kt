package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.Utils
import java.sql.Timestamp

interface ResponseContestInfoInterface {
    val id: String
    val name: String
    val statement: String
    val startTime: Timestamp
    val endTime: Timestamp
    val penalty: Int
    val ratedBound: Int
    val contestType: ContestInfo.ContestType
    val ratingCalculated: Boolean
    val contestCreators: List<ContestCreator>
    val unixStartTime: Long
    val unixEndTime: Long
    val startTimeAMPM: String
    val endTimeAMPM: String
    companion object {
        fun build(contest: ContestInfo): ResponseContestInfo =
            ResponseContestInfo(
                contest.id,
                contest.name,
                contest.statement,
                contest.startTime,
                contest.endTime,
                contest.penalty,
                contest.ratedBound,
                contest.contestType,
                contest.ratingCalculated,
                contest.contestCreators,
                contest.startTime.time,
                contest.endTime.time,
                Utils().formatTimestamp(contest.startTime),
                Utils().formatTimestamp(contest.endTime)
            )
    }
}

data class ResponseContestInfo(
    override val id: String,
    override val name: String,
    override val statement: String,
    override val startTime: Timestamp,
    override val endTime: Timestamp,
    override val penalty: Int,
    override val ratedBound: Int,
    override val contestType: ContestInfo.ContestType,
    override val ratingCalculated: Boolean,
    override val contestCreators: List<ContestCreator>,
    override val unixStartTime: Long,
    override val unixEndTime: Long,
    override val startTimeAMPM: String,
    override val endTimeAMPM: String
) : ResponseContestInfoInterface

data class LatestContestsInfo(
    val contests: List<ResponseContestInfo>,
    val allContestNum: Int
)
