package com.nazonazo_app.shit_forces.account

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository

@Repository
class AccountInfoRepository(private val jdbcTemplate: JdbcTemplate) {
    private val rowMapperForAccountInfo = RowMapper { rs, _ ->
        AccountInfo(rs.getString("name"), rs.getDouble("rating"),
            rs.getDouble("innerRating"), rs.getInt("partNum"),
            rs.getString("passwordHash"), rs.getString("permission"))
    }
    private val rowMapperForHistory = RowMapper { rs, _ ->
        AccountRatingChangeHistory(rs.getString("accountName"), rs.getString("contestId"),
            rs.getInt("indexOfParticipation"), rs.getDouble("prevRating"),
            rs.getDouble("newRating"), rs.getInt("performance"))
    }

    fun createAccount(accountName: String, password: String): AccountInfo? {
        jdbcTemplate.update("""INSERT INTO accountInfo(name,  passwordHash, permission)
                VALUES ( ?, ?, ? )""",
            accountName, password, AccountInfo.AccountAuthority.GENERAL.name)
        return findByAccountName(accountName)
    }
    fun getAccountHistory(accountName: String): List<AccountRatingChangeHistory>?
     = jdbcTemplate.query("""SELECT * from accountRatingChangeHistory 
         where accountName = ? order by indexOfParticipation
     """, rowMapperForHistory, accountName)

    fun updateRating(contestId: String, accountName: String, rating: Double, innerRating: Double,
                     performance: Int, calculatedRating: Int) {
        val partNum = findByAccountName(accountName)!!.partNum
        val prevCalculatedRating = getAccountHistory(accountName)?.getOrNull(0)?.newRating ?: 0

         jdbcTemplate.update("""UPDATE accountInfo SET rating = ?,innerRating = ?, partNum = ?
            WHERE name = ?""", rating, innerRating, partNum + 1, accountName)

        jdbcTemplate.update("""INSERT INTO 
            accountRatingChangeHistory(accountName, contestId, indexOfParticipation, newRating, prevRating, performance)
            VALUES( ?, ?, ?, ?, ?, ?)""",
            accountName, contestId, partNum + 1, calculatedRating, prevCalculatedRating, performance)
    }

    fun findByAccountName(accountName: String): AccountInfo? {
        val accounts = jdbcTemplate.query(
            "SELECT name, rating, passwordHash, innerRating, partNum, permission FROM accountInfo WHERE name = ?",
            rowMapperForAccountInfo, accountName)

        return if (accounts.isEmpty()) null
        else accounts[0]
    }

    fun changeAccountName(prevAccountName: String, newAccountName: String, password: String) {
        jdbcTemplate.update("UPDATE accountInfo set name = ?, passwordHash = ? where name = ?",
            newAccountName, password, prevAccountName)
    }

    fun changeAccountRatingChangeHistoryName(prevName: String, newName: String) {
        jdbcTemplate.update("""
            UPDATE accountRatingChangeHistory set accountName = ? where accountName = ?
        """, newName, prevName)
    }

    fun findAllAccount(): List<AccountInfo> {
        return jdbcTemplate.query("""SELECT * FROM accountInfo""", rowMapperForAccountInfo)
    }
}
