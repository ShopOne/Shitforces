package com.nazonazo_app.shit_forces.account

data class AccountInfo(
    val name: String,
    val rating: Int,
    val passwordHash: String,
    private val auth: String) {

    val authority = when(auth) {
        "ADMINISTER" -> AccountAuthority.ADMINISTER
        else -> AccountAuthority.GENERAL
    }
    enum class AccountAuthority(auth: String) {
        GENERAL("GENERAL"),
        WRITER("WRITER"),
        ADMINISTER("ADMINISTER")
    }
}
data class RequestAccount(
    val name: String,
    val password: String
)
data class ResponseAccount(
    val name: String,
    val rating: Int
)
