package com.nazonazo_app.shit_forces.account

import java.sql.Timestamp
import kotlin.math.pow
import kotlin.math.sqrt

data class AccountInfo(
    val name: String,
    val rating: Double,
    val innerRating: Double,
    val partNum: Int,
    val passwordHash: String,
    private val auth: String,
    val loginFailCount: Int,
    val lockTime: Timestamp
) {
    // rating、innerRatingは内部的な値
    // 実際にページで見れるレーティングはこのメソッドで計算したもの
    fun calcCorrectionRate(): Int {
        if (this.partNum == 0) return 0
        val r = this.rating
        val p = this.partNum
        val minus = (sqrt(1 - 0.81.pow(p)) / (1 - 0.9.pow(p)) - 1) / (sqrt(19.0) - 1) * 1200
        val miRating = r - minus
        var ret = miRating
        if (miRating <= 400) {
            val diff = (400 - miRating) / 400
            ret = (400 * Math.E.pow(-diff))
        }
        return ret.toInt()
    }
    val authority = when (auth) {
        "ADMINISTER" -> AccountAuthority.ADMINISTER
        else -> AccountAuthority.GENERAL
    }
    enum class AccountAuthority {
        GENERAL,
        WRITER,
        ADMINISTER
    }
}
data class AccountRatingChangeHistory(
    val accountName: String,
    val contestName: String,
    val indexOfParticipation: Int,
    val prevRating: Double,
    val newRating: Double,
    val performance: Int
)
data class RequestAccountForCertification(
    val name: String,
    val password: String
)

data class ResponseAccountRanking(
    val accounts: List<ResponseAccountInfo>,
    val validAccountNum: Int
)
