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
            rs.getString("contestName"),
            rs.getInt("indexOfContest"),
            rs.getString("accountName"),
            rs.getString("statement"),
            rs.getTimestamp("submitTime"),
            result)
    }
    fun findSubmissions(accountName: String, contestName: String): List<SubmissionInfo> {
        return jdbcTemplate.query("""
            SELECT contestName, accountName, indexOfContest, statement, submitTime, result FROM submissionInfo 
            WHERE accountName = ? AND contestName = ? ORDER BY submitTime desc
        """, rowMapper, accountName, contestName)
    }
    fun addSubmission(submissionInfo: SubmissionInfo) {
        jdbcTemplate.update("""
            INSERT INTO submissionInfo(contestName, accountName, indexOfContest, result, statement, submitTime)
             VALUES ( ?, ?, ?, ?, ?, ? )
        """,
            submissionInfo.contestName, submissionInfo.accountName, submissionInfo.indexOfContest,
            submissionInfo.result.state, submissionInfo.statement, submissionInfo.submitTime)
    }
    fun findContestSubmissionInTime(contestName: String, startTime: Timestamp, endTime: Timestamp): List<SubmissionInfo> {
        return jdbcTemplate.query("""
            SELECT contestName, accountName, indexOfContest, statement, submitTime, result FROM submissionInfo 
            WHERE contestName = ? AND ? <= submitTime  AND submitTime < ? ORDER BY indexOfContest, submitTime
        """, rowMapper, contestName, startTime, endTime)
    }
    fun findContestSubmission(startTime: Timestamp, endTime: Timestamp): List<SubmissionInfo> {
        return jdbcTemplate.query("""
            SELECT contestName, accountName, indexOfContest, statement, submitTime, result FROM submissionInfo 
            WHERE  ? <= submitTime  AND submitTime < ? ORDER BY indexOfContest, submitTime
        """, rowMapper, startTime, endTime)
    }
}