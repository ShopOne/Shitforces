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
        ProblemInfo(rs.getString("contestName"), rs.getInt("point"),
            rs.getString("statement"), rs.getInt("indexOfContest"), findAnswerById(rs.getInt("id")))
    }

    private fun findAnswerById(id: Int): List<String> =
            jdbcTemplate.query("""
                SELECT answer FROM answerInfo WHERE id = ?
            """, rowMapperForAnswer, id)
    fun findByContestName(contestName: String): List<ProblemInfo> =
            jdbcTemplate.query("""
                SELECT id, contestName, point, statement, indexOfContest FROM problemInfo WHERE contestName = ?
                ORDER BY indexOfContest asc;
            """, rowMapperForProblem, contestName)
    fun findByContestNameAndIndex(contestName: String, indexOfContest: Int): ProblemInfo? {
        val problem = jdbcTemplate.query("""
                SELECT id, contestName, point, statement, indexOfContest FROM problemInfo 
                WHERE contestName = ? AND indexOfContest = ? order by indexOfContest asc
            """, rowMapperForProblem, contestName, indexOfContest)
        return problem.getOrNull(0)
    }
}