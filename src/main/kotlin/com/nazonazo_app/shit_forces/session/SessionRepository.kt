package com.nazonazo_app.shit_forces.session

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.util.*
import java.sql.Date
import java.sql.Timestamp

@Repository
class SessionRepository(private val jdbcTemplate: JdbcTemplate) {
    private val rowMapper = RowMapper { rs, _ ->
        SessionData(rs.getString("name"), rs.getString("sessionId"), rs.getTimestamp("expirationDate"))
    }
    fun deleteDeadSession() {
        val nowTimeStamp = Timestamp(System.currentTimeMillis())
        jdbcTemplate.update("""DELETE FROM sessionData WHERE expirationDate <=  ?""",
        nowTimeStamp)
    }
    fun findByName(name: String): SessionData? {
        deleteDeadSession()
        val sessionList = jdbcTemplate.query("""
          SELECT name, sessionId, expirationDate FROM sessionData
          WHERE name = ?
        """, rowMapper, name)
        return sessionList.getOrNull(0)
    }
    fun deleteSessionByName(name: String) {
        deleteDeadSession()
        jdbcTemplate.update("""
            DELETE FROM sessionData WHERE (name = ?)
        """, name)
    }
    private fun getExpirationDate(): Timestamp {
        deleteDeadSession()
        val expirationDate: Calendar = Calendar.getInstance()
        expirationDate.add(SessionData.SESSION_LIFE_CALENDAR, 1)
        return Timestamp(expirationDate.time.time)
    }
    fun addNewSession(name: String, sessionId: String) : SessionData? {
        deleteDeadSession()
        val nowSession = findByName(name)
        if (nowSession === null) {
            jdbcTemplate.update("""
            INSERT INTO sessionData (name, sessionId, expirationDate) VALUES ( ?, ?, ? )
        """, name, sessionId, getExpirationDate())
        } else {
            jdbcTemplate.update("""
                UPDATE sessionData set expirationDate = ? where name = ?
            """, getExpirationDate(), name)
        }
        return findByName(name)
    }
}