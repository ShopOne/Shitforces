package com.nazonazo_app.shit_forces.contest

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository

@Repository
class ContestRepository(val jdbcTemplate: JdbcTemplate) {
    private val rowMapper = RowMapper { rs, _ ->
        val contestType = when(rs.getString("contestType")) {
            ContestInfo.ContestType.ATCODER.textName -> ContestInfo.ContestType.ATCODER
            ContestInfo.ContestType.ICPC.textName -> ContestInfo.ContestType.ICPC
            else -> ContestInfo.ContestType.INVALID
        }
        ContestInfo(rs.getString("shortName"), rs.getString("name"), rs.getString("statement"),
                rs.getTimestamp("startTime"), rs.getTimestamp("endTime"), rs.getInt("penalty"),
            rs.getInt("ratedBound"), contestType, rs.getBoolean("ratingCalculated"))
    }
    fun findByShortName(shortName: String): ContestInfo? {
        val contest =  jdbcTemplate.query("""
            SELECT shortName, name, statement, startTime, endTime, penalty, contestType, ratedBound, ratingCalculated
             FROM contestInfo WHERE shortName = (?)""", rowMapper, shortName)
        return if (contest.isEmpty()) {
            null
        } else {
            contest[0]
        }
    }
    fun findByName(contestName: String): ContestInfo? {
        val contest =  jdbcTemplate.query("""
            SELECT shortName, name, statement, startTime, endTime, penalty, contestType, ratedBond, ratingCalculated
            FROM contestInfo WHERE name = (?)""", rowMapper, contestName)
        return if (contest.isEmpty()) {
            null
        } else {
            contest[0]
        }
    }
    fun changeToEndCalcRating(shortName: String) {
        jdbcTemplate.update("""UPDATE contestInfo set ratingCalculated = true where shortName = ?""",
            shortName)
    }
    fun findLatestContest(contestNum: Int): List<ContestInfo>? {
        return jdbcTemplate.query("""
            SELECT shortName, name, statement, startTime, endTime, contestType, ratedBound , penalty, ratingCalculated 
            FROM contestInfo ORDER BY startTime desc""", rowMapper)
    }
    fun addContest(contestInfo: ContestInfo): ContestInfo? {
        return TODO("add contest")
    }
}