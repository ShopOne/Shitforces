package com.nazonazo_app.shit_forces.account

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository

@Repository
class AccountInfoRepository(private val jdbcTemplate: JdbcTemplate) {
    private val rowMapper = RowMapper<AccountInfo> { rs, _ ->
        AccountInfo(rs.getString("name"), rs.getInt("rating"), rs.getString("passwordHash"),
            rs.getString("permission"))
    }
    fun findAll(): List<AccountInfo> =
            jdbcTemplate.query("SELECT name, rating, passwordHash FROM accountInfo", rowMapper)


    fun createAccount(accountName: String, password: String): AccountInfo? {
        val newAccount = AccountInfo(accountName, 0, password,
            AccountInfo.AccountAuthority.GENERAL.name)
        jdbcTemplate.update("""INSERT INTO accountInfo(name, rating, passwordHash, permission)
                VALUES ( ?, ?, ?, ? )""",
            newAccount.name, newAccount.rating, newAccount.passwordHash, newAccount.authority.name)
        return newAccount
    }

    fun findByAccountName(accountName: String): AccountInfo? {
        val accounts = jdbcTemplate.query(
                "SELECT name, rating, passwordHash, permission FROM accountInfo WHERE name = ?",
                     rowMapper, accountName)

        return if (accounts.isEmpty()) null
        else accounts[0]
    }
}
