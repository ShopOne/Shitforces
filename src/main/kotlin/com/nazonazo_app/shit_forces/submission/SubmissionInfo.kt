package com.nazonazo_app.shit_forces.submission

import com.nazonazo_app.shit_forces.Utils
import java.sql.Timestamp
class SubmissionInfo(
    val contestId: String,
    val indexOfContest: Int,
    val accountName: String,
    val statement: String,
    val submitTime: Timestamp,
    val result: SubmissionResult) {
    val submitTimeAMPM = Utils().formatTimestamp(submitTime)
}
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

data class RequestSubmission constructor(val contestId: String,
                                         val indexOfContest: Int,
                                         val statement: String)

