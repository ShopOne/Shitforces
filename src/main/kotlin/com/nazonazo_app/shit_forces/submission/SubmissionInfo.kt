package com.nazonazo_app.shit_forces.submission

import java.sql.Timestamp
class SubmissionInfo(
    val contestName: String,
    val indexOfContest: Int,
    val accountName: String,
    val statement: String,
    val submitTime: Timestamp,
    val result: SubmissionResult
)
enum class SubmissionResult(val state: String) {
    ACCEPTED("ACCEPTED"),
    WRONG_ANSWER("WRONG_ANSWER"),
    WAITING_JUDGE("WAITING_JUDGE"),
    UNDEFINED("UNDEFINED");
    companion object {
        fun fromString(statement: String): SubmissionResult {
            return values().firstOrNull{ it.state == statement} ?:  UNDEFINED
        }
    }
}

data class RequestSubmission constructor(val shortContestName: String,
                                         val indexOfContest: Int,
                                         val statement: String)

