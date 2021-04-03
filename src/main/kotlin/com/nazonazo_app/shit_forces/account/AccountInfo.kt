package com.nazonazo_app.shit_forces.account

data class AccountInfo(
    val name: String,
    val rating: Double,
    val innerRating: Double,
    val partNum: Int,
    val passwordHash: String,
    private val auth: String
    ) {
    val authority = when (auth) {
        "ADMINISTER" -> AccountAuthority.ADMINISTER
        else -> AccountAuthority.GENERAL
    }
    enum class AccountAuthority{
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
data class RequestAccount(
    val name: String,
    val password: String
)
data class ResponseAccount(
    val name: String,
    val rating: Int,
    val partNum: Int,
    val auth: String
)


data class ResponseAccountRanking(
    val accounts: List<ResponseAccount>,
    val validAccountNum: Int
)