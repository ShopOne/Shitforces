package com.nazonazo_app.shit_forces.account

import com.nazonazo_app.shit_forces.problem.FavInfo
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
class AccountInfoRepository(private val jdbcTemplate: JdbcTemplate) {
    private val rowMapperForAccountInfo = RowMapper { rs, _ ->
        AccountInfo(
            rs.getString("name"), rs.getDouble("rating"),
            rs.getDouble("innerRating"), rs.getInt("partNum"),
            rs.getString("passwordHash"), rs.getString("permission"),
            rs.getInt("loginFailCount"), rs.getTimestamp("lockDateTime")
        )
    }
    private val rowMapperForHistory = RowMapper { rs, _ ->
        AccountRatingChangeHistory(
            rs.getString("accountName"), rs.getString("contestName"),
            rs.getInt("indexOfParticipation"), rs.getDouble("prevRating"),
            rs.getDouble("newRating"), rs.getInt("performance"), rs.getInt("rank")
        )
    }
    private val rowMapperForFavHistory = RowMapper { rs, _ ->
        FavInfo(
            rs.getString("accountName"),
            rs.getInt("problemId")
        )
    }

    fun createAccount(accountName: String, password: String): AccountInfo {
        jdbcTemplate.update(
            """INSERT INTO accountInfo(name,  passwordHash, permission)
                VALUES ( ?, ?, ? )""",
            accountName, password, AccountInfo.AccountAuthority.GENERAL.name
        )
        return findByAccountName(accountName)!!
    }
    fun getAccountHistory(accountName: String): List<AccountRatingChangeHistory> =
        jdbcTemplate.query(
            """SELECT * from accountRatingChangeHistory 
         where accountName = ? order by indexOfParticipation
     """,
            rowMapperForHistory, accountName
        )

    fun updateRating(
        contestName: String,
        accountName: String,
        rating: Double,
        innerRating: Double,
        performance: Int,
        calculatedRating: Int,
        rank: Int
    ) {
        val partNum = findByAccountName(accountName)!!.partNum
        val prevCalculatedRating = getAccountHistory(accountName).maxByOrNull { it.indexOfParticipation }?.newRating ?: 0

        jdbcTemplate.update(
            """UPDATE accountInfo SET rating = ?, innerRating = ?, partNum = ?
            WHERE name = ?""",
            rating, innerRating, partNum + 1, accountName
        )

        jdbcTemplate.update(
            """INSERT INTO 
            accountRatingChangeHistory(accountName, contestName, indexOfParticipation, 
            newRating, prevRating, performance, rank)
            VALUES( ?, ?, ?, ?, ?, ?, ?)""",
            accountName, contestName, partNum + 1, calculatedRating, prevCalculatedRating, performance, rank
        )
    }

    fun findByAccountName(accountName: String): AccountInfo? {
        val accounts = jdbcTemplate.query(
            "SELECT * FROM accountInfo WHERE name = ?",
            rowMapperForAccountInfo, accountName
        )

        return if (accounts.isEmpty()) null
        else accounts[0]
    }

    fun changeAccountName(prevAccountName: String, newAccountName: String, password: String) {
        jdbcTemplate.update(
            "UPDATE accountInfo set name = ?, passwordHash = ? where name = ?",
            newAccountName, password, prevAccountName
        )
    }

    fun changeAccountNameOnAccountRatingChangeHistory(prevName: String, newName: String) {
        jdbcTemplate.update(
            """
            UPDATE accountRatingChangeHistory set accountName = ? where accountName = ?
        """,
            newName, prevName
        )
    }

    fun findAllAccount(): List<AccountInfo> {
        return jdbcTemplate.query("""SELECT * FROM accountInfo""", rowMapperForAccountInfo)
    }

    fun findFavProblemId(accountName: String): List<FavInfo> {
        return jdbcTemplate.query(
            """SELECT problemId FROM favHistory where accountName = ?""",
            rowMapperForFavHistory, accountName
        )
    }

    fun findFavAccountsByProblemId(problemId: Int): List<FavInfo> {
        return jdbcTemplate.query(
            """SELECT accountName FROM favHistory where problemId = ?""",
            rowMapperForFavHistory, problemId
        )
    }

    fun switchFavProblem(accountName: String, problemId: Int) {
        jdbcTemplate.update(
            """
                IF EXISTS (SELECT * FROM favHistory where accountName = ? and problemId = ?) THEN
                    DELETE FROM favHistory where accountName = ? and problemId = ?
                ELSE
                    INSERT INTO favHistory(accountName, problemId) VALUES(?, ?)
            """,
            accountName, problemId, accountName, problemId, accountName, problemId
        )
    }

    fun addLockCount(accountName: String) {
        jdbcTemplate.update(
            """UPDATE accountInfo
            SET loginFailCount = loginFailCount + 1 where name = ?""",
            accountName
        )
    }

    fun lockAccount(accountName: String) {
        jdbcTemplate.update(
            """UPDATE accountInfo
            SET lockDateTime = ?, loginFailCount = ? where name = ?""",
            Timestamp(System.currentTimeMillis()), 0, accountName
        )
    }

    fun resetAccountLock(accountName: String) {
        jdbcTemplate.update(
            """UPDATE accountInfo
            SET lockDateTime = to_timestamp(0), loginFailCount = 0 where name = ?""",
            accountName
        )
    }
}
