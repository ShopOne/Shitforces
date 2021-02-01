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
                rs.getTimestamp("startTime"), rs.getTimestamp("endTime"), rs.getInt("penalty"), contestType, rs.getBoolean("rated"))
    }
    fun findByShortName(shortName: String): ContestInfo? {
        val contest =  jdbcTemplate.query("""
            SELECT shortName, name, statement, startTime, endTime, penalty, contestType, rated
             FROM contestInfo WHERE shortName = (?)""", rowMapper, shortName)
        return if (contest.isEmpty()) {
            null
        } else {
            contest[0]
        }
    }
    fun findByName(contestName: String): ContestInfo? {
        val contest =  jdbcTemplate.query("""SELECT shortName, name, statement, startTime, endTime, penalty, contestType, rated 
            FROM contestInfo WHERE name = (?)""", rowMapper, contestName)
        return if (contest.isEmpty()) {
            null
        } else {
            contest[0]
        }
    }
    fun findLatestContest(contestNum: Int): List<ContestInfo>? {
        return jdbcTemplate.query("""
            SELECT shortName, name, statement, startTime, endTime, contestType, rated , penalty FROM contestInfo ORDER BY startTime desc"""
            , rowMapper)
    }
    fun addContest(contestInfo: ContestInfo): ContestInfo? {
        jdbcTemplate.update("""INSERT INTO contestInfo(name, startTIme, endTime) VALUES ( ?, ?, ? )""",
                contestInfo.name, contestInfo.startTime, contestInfo.endTime)
        return findByName(contestInfo.name)
    }
}