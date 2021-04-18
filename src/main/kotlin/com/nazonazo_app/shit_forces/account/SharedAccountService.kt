package com.nazonazo_app.shit_forces.account

import kotlin.math.pow
import kotlin.math.sqrt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Transactional
@Service
class SharedAccountService(private val accountInfoRepository: AccountInfoRepository) {
    fun getAccountByName(accountName: String): AccountInfo? {
        return try {
            accountInfoRepository.findByAccountName(accountName)
        } catch (e: Error) {
            print(e)
            null
        }
    }
    fun calcCorrectionRate(account: AccountInfo): Int {
        if (account.partNum == 0) return 0
        val r = account.rating
        val p = account.partNum
        val minus = (sqrt(1 - 0.81.pow(p)) / (1 - 0.9.pow(p)) - 1) / (sqrt(19.0) - 1) * 1200
        val miRating = r - minus
        var ret = miRating
        if (miRating <= 400) {
            val diff = (400 - miRating) / 400
            ret = (400 * Math.E.pow(-diff))
        }
        return ret.toInt()
    }
    fun updateAccountRating(
        contestName: String,
        accountName: String,
        rating: Double,
        innerRating: Double,
        performance: Int
    ) {
        val prevAccountInfo = accountInfoRepository.findByAccountName(accountName)!!
        val newAccount = prevAccountInfo.copy(rating = rating, innerRating = innerRating,
            partNum = prevAccountInfo.partNum + 1)
        accountInfoRepository.updateRating(contestName, accountName, rating, innerRating,
            performance, calcCorrectionRate(newAccount))
    }
}
