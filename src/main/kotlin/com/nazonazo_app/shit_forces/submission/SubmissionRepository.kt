package com.nazonazo_app.shit_forces.submission

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
class SubmissionRepository(val jdbcTemplate: JdbcTemplate) {
    private val rowMapper = RowMapper { rs, _ ->
        val result = SubmissionResult.fromString(rs.getString("result"))
        SubmissionInfo(
            rs.getString("contestId"),
            rs.getInt("indexOfContest"),
            rs.getString("accountName"),
            rs.getString("statement"),
            rs.getTimestamp("submitTime"),
            result
        )
    }
    fun findSubmissions(accountName: String, contestId: String): List<SubmissionInfo> {
        return jdbcTemplate.query(
            """
            SELECT contestId, accountName, indexOfContest, statement, submitTime, result FROM submissionInfo 
            WHERE accountName = ? AND contestId = ? ORDER BY submitTime desc
        """,
            rowMapper, accountName, contestId
        )
    }
    fun addSubmission(submissionInfo: SubmissionInfo) {
        jdbcTemplate.update(
            """
            INSERT INTO submissionInfo(contestId, accountName, indexOfContest, result, statement, submitTime)
             VALUES ( ?, ?, ?, ?, ?, ? )
        """,
            submissionInfo.contestId, submissionInfo.accountName, submissionInfo.indexOfContest,
            submissionInfo.result.state, submissionInfo.statement, submissionInfo.submitTime
        )
    }
    fun findContestSubmissionInTime(contestId: String, startTime: Timestamp, endTime: Timestamp): List<SubmissionInfo> {
        return jdbcTemplate.query(
            """
            SELECT contestId, accountName, indexOfContest, statement, submitTime, result FROM submissionInfo 
            WHERE contestId = ? AND ? <= submitTime AND submitTime < ?
        """,
            rowMapper, contestId, startTime, endTime
        )
    }
    fun findContestSubmission(contestId: String): List<SubmissionInfo> {
        return jdbcTemplate.query(
            """
            SELECT contestId, accountName, indexOfContest, statement, submitTime, result FROM submissionInfo 
            WHERE  contestId = ?
        """,
            rowMapper, contestId
        )
    }
    fun changeNameOfSubmission(prevName: String, newName: String) {
        jdbcTemplate.update(
            """
            UPDATE submissionInfo set accountName = ? where accountName = ?
        """,
            newName, prevName
        )
    }
}
