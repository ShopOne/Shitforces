package com.nazonazo_app.shit_forces.account

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import kotlin.math.pow
import kotlin.math.sqrt

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
        val r = account.innerRating
        val p = account.partNum
        val minus = (sqrt(1 - 0.81.pow(p)) /  (1 - 0.9.pow(p)) - 1) / (sqrt(19.0) - 1) * 1200
        val miRating = r - minus
        var ret = miRating
        if (miRating <= 400) {
            val diff = (400 - miRating) / 400
            ret = (400 * Math.E.pow(-diff))
        }
        return ret.toInt()
    }
    fun updateAccountRating(contestName: String,
                            accountName: String,
                            rating: Double,
                            innerRating: Double,
                            performance: Int
    )
            = accountInfoRepository.updateRating(contestName, accountName, rating, innerRating, performance)
}