package com.nazonazo_app.shit_forces.account

interface ResponseAccountInfoInterface {
    val name: String
    val rating: Int
    val partNum: Int
    val auth: String
    companion object {
        fun build(account: AccountInfo): ResponseAccountInfo =
            ResponseAccountInfo(account.name, account.calcCorrectionRate(), account.partNum, account.authority.name)
    }
}
data class ResponseAccountInfo(
    override val name: String,
    override val rating: Int,
    override val partNum: Int,
    override val auth: String
) : ResponseAccountInfoInterface
