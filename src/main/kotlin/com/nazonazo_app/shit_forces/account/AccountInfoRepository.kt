package com.nazonazo_app.shit_forces.account

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository

@Repository
class AccountInfoRepository(private val jdbcTemplate: JdbcTemplate) {
    private val rowMapperForAccountInfo = RowMapper { rs, _ ->
        AccountInfo(rs.getString("name"), rs.getInt("rating"),
            rs.getInt("innerRating"), rs.getInt("partNum"),
            rs.getString("passwordHash"), rs.getString("permission"))
    }
    private val rowMapperForHistory = RowMapper { rs, _ ->
        AccountRatingChangeHistory(rs.getString("accountName"), rs.getString("contestName"),
            rs.getInt("indexOfParticipation"), rs.getInt("prevRating"),
            rs.getInt("newRating"), rs.getInt("performance"))
    }

    fun createAccount(accountName: String, password: String): AccountInfo? {
        val newAccount = AccountInfo(accountName, 0, 0, 0,password,
            AccountInfo.AccountAuthority.GENERAL.name)
        jdbcTemplate.update("""INSERT INTO accountInfo(name, rating, passwordHash, permission)
                VALUES ( ?, ?, ?, ? )""",
            newAccount.name, newAccount.rating, newAccount.passwordHash, newAccount.authority.name)
        return newAccount
    }
    fun updateRating(contestName: String, accountName: String, rating: Int, innerRating: Int, performance: Int) {
        val prevAccountRating = findByAccountName(accountName)!!.rating
        jdbcTemplate.update("""UPDATE accountInfo SET rating = ? innerRating = ?
            WHERE name = ?""", accountName, rating, innerRating)
        jdbcTemplate.update("""INSERT INTO 
            accountRatingChange(accountName, contestName, indexOfParticipation, newRating, prevRating, performance)
            VALUES( ?, ?, ?, ?, ?, ?)""", accountName, contestName, rating, prevAccountRating, performance)
    }

    fun findByAccountName(accountName: String): AccountInfo? {
        val accounts = jdbcTemplate.query(
            "SELECT name, rating, passwordHash, innerRating, partNum, permission FROM accountInfo WHERE name = ?",
            rowMapperForAccountInfo, accountName)

        return if (accounts.isEmpty()) null
        else accounts[0]
    }
}
