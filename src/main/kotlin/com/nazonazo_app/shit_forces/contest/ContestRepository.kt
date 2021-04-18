package com.nazonazo_app.shit_forces.contest

import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import org.springframework.web.server.ResponseStatusException

@Repository
class ContestRepository(val jdbcTemplate: JdbcTemplate) {
    private val rowMapperForContestInfo = RowMapper { rs, _ ->
        val contestType = when (rs.getString("contestType")) {
            ContestInfo.ContestType.ATCODER.textName -> ContestInfo.ContestType.ATCODER
            ContestInfo.ContestType.ICPC.textName -> ContestInfo.ContestType.ICPC
            else -> ContestInfo.ContestType.INVALID
        }
        val id = rs.getString("id")
        ContestInfo(rs.getString("id"), rs.getString("name"), rs.getString("statement"),
                rs.getTimestamp("startTime"), rs.getTimestamp("endTime"), rs.getInt("penalty"),
            rs.getInt("ratedBound"), contestType, rs.getBoolean("ratingCalculated"), findContestCreators(id))
    }
    private val rowMapperForContestCreator = RowMapper { rs, _ ->
        val position = when (rs.getString("position").toUpperCase()) {
            ContestCreator.ContestPosition.COORDINATOR.name -> ContestCreator.ContestPosition.COORDINATOR
            ContestCreator.ContestPosition.WRITER.name -> ContestCreator.ContestPosition.WRITER
            else -> throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        ContestCreator(rs.getString("accountName"), rs.getString("contestId"), position)
    }
    fun findByContestId(id: String): ContestInfo? {
        val contest = jdbcTemplate.query("""
            SELECT id, name, statement, startTime, endTime, penalty, contestType, ratedBound, ratingCalculated
             FROM contestInfo WHERE id = (?)""", rowMapperForContestInfo, id)
        return if (contest.isEmpty()) {
            null
        } else {
            contest[0]
        }
    }
    fun findByName(contestName: String): ContestInfo? {
        val contest = jdbcTemplate.query("""
            SELECT id, name, statement, startTime, endTime, penalty, contestType, ratedBond, ratingCalculated
            FROM contestInfo WHERE name = (?)""", rowMapperForContestInfo, contestName)
        return if (contest.isEmpty()) {
            null
        } else {
            contest[0]
        }
    }
    fun changeToEndCalcRating(id: String) {
        jdbcTemplate.update("""UPDATE contestInfo set ratingCalculated = true where id = ?""",
            id)
    }
    fun findLatestContest(page: Int): List<ContestInfo> {
        return jdbcTemplate.query("""
            SELECT id, name, statement, startTime, endTime, contestType, ratedBound , penalty, ratingCalculated 
            FROM contestInfo ORDER BY startTime desc LIMIT ? OFFSET ?""",
            rowMapperForContestInfo, LATEST_CONTEST_PAGE_SIZE, page * LATEST_CONTEST_PAGE_SIZE)
    }
    fun findContestCreators(contestId: String): List<ContestCreator> =
        jdbcTemplate.query("""
            SELECT accountName, contestId, position FROM contestCreator WHERE contestId = ?
        """, rowMapperForContestCreator, contestId)

    fun findAllContestNum(): Int =
        jdbcTemplate.queryForObject("""SELECT count(*) from contestInfo""", Int::class.java)!!

    fun addContest(contest: ContestInfo) {
        jdbcTemplate.update("""
            INSERT INTO contestInfo(id, name, statement, startTime, endTime, contestType, ratedBound, penalty)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)
        """, contest.id, contest.name, contest.statement, contest.startTime, contest.endTime,
            contest.contestType.textName, contest.ratedBound, contest.penalty)
        contest.contestCreators.forEach {
            jdbcTemplate.update("""
               INSERT INTO contestCreator(accountName, contestId, position) 
               VALUES(?, ?, ?)
            """, it.accountName, it.contestId, it.position.name)
        }
    }

    fun updateContestInfoByPutRequestContest(contestId: String, putContest: PutRequestContest) {
        jdbcTemplate.update(
            """
            UPDATE contestInfo SET statement = ?, penalty = ?
            WHERE id = ?
        """, putContest.statement, putContest.penalty, contestId
        )
    }
}
