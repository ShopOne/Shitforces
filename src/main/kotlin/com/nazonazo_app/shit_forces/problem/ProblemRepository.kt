package com.nazonazo_app.shit_forces.problem

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository

@Repository
class ProblemRepository(private val jdbcTemplate: JdbcTemplate) {
    private val rowMapperForAnswer = RowMapper { rs, _ ->
        rs.getString("answer")
    }
    private val rowMapperForProblem = RowMapper { rs, _ ->
        val id = rs.getInt("id")
        ProblemInfo(rs.getString("contestId"), rs.getInt("point"),
            rs.getString("statement"), rs.getInt("indexOfContest"), findAnswerById(id), id)
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
    fun deleteProblemById(id: Int) {
        jdbcTemplate.update("""
            DELETE FROM problemInfo where id = ?
        """, id)
        jdbcTemplate.update("""
            DELETE FROM answerInfo where id = ?
        """, id)
    }
    private fun addAnswer(id: Int, answer: String) {
        jdbcTemplate.update("""
            INSERT INTO answerInfo(id, answer)
            values(?, ?)
        """, id, answer)
    }
    private fun addProblem(problem: ProblemInfo) {
        jdbcTemplate.update("""
            INSERT INTO problemInfo(contestId, indexOfContest, point, statement)
            VALUES(?, ?, ?, ?)
        """, problem.contestId, problem.indexOfContest, problem.point, problem.statement)
    }
    fun addProblems(contestId: String, problems: List<ProblemInfo>) {
        problems.forEach {
            addProblem(it)
        }
        val problemsInDb = findByContestId(contestId).sortedBy { it.indexOfContest }
        problemsInDb.forEachIndexed { index, it ->
            problems[index].answer.forEach { ans ->
                addAnswer(it.id!!, ans)
            }
        }
    }
    fun findById(id: Int): ProblemInfo? {
        val problem = jdbcTemplate.query("""
                SELECT id, contestId, contestId, point, statement, indexOfContest FROM problemInfo 
                WHERE id = ?
            """, rowMapperForProblem, id)
        if (problem.size == 0) return null
        return problem[0]
    }
    fun findAnswersById(id: Int): List<String> {
        return jdbcTemplate.query("SELECT answer from answerInfo WHERE id = ?",
            rowMapperForAnswer, id)
    }
}
