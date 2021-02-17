package com.nazonazo_app.shit_forces.problem

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository

@Repository
class ProblemRepository(val jdbcTemplate: JdbcTemplate) {
    private val rowMapperForAnswer = RowMapper { rs, _ ->
        rs.getString("answer")
    }
    private val rowMapperForProblem = RowMapper { rs, _ ->
        ProblemInfo(rs.getString("contestId"), rs.getInt("point"),
            rs.getString("statement"), rs.getInt("indexOfContest"), findAnswerById(rs.getInt("id")))
    }

    private fun findAnswerById(id: Int): List<String> =
            jdbcTemplate.query("""
                SELECT answer FROM answerInfo WHERE id = ?
            """, rowMapperForAnswer, id)
    fun findByContestId(contestId: String): List<ProblemInfo> =
            jdbcTemplate.query("""
                SELECT id, contestId, contestId, point, statement, indexOfContest FROM problemInfo WHERE contestId = ?
                ORDER BY indexOfContest asc;
            """, rowMapperForProblem, contestId)
    fun findByContestIdAndIndex(contestId: String, indexOfContest: Int): ProblemInfo? {
        val problem = jdbcTemplate.query("""
                SELECT id, contestId, point, statement, indexOfContest FROM problemInfo 
                WHERE contestId = ? AND indexOfContest = ? order by indexOfContest asc
            """, rowMapperForProblem, contestId, indexOfContest)
        return problem.getOrNull(0)
    }
}