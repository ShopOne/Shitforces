package com.nazonazo_app.shit_forces.account

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Transactional
@Service
class SharedAccountService(private val accountInfoRepository: AccountInfoRepository) {
    fun getAccountByName(accountName: String): AccountInfo? =
        accountInfoRepository.findByAccountName(accountName)

    fun updateAccountRating(
        contestName: String,
        accountName: String,
        rating: Double,
        innerRating: Double,
        performance: Int,
        rank: Int
    ) {
        val prevAccountInfo = accountInfoRepository.findByAccountName(accountName)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
        val newAccount = prevAccountInfo.copy(
            rating = rating, innerRating = innerRating,
            partNum = prevAccountInfo.partNum + 1
        )
        accountInfoRepository.updateRating(
            contestName, accountName, rating, innerRating,
            performance, newAccount.calcCorrectionRate(), rank
        )
    }

    fun getFavAccountsByProblemId(problemId: Int) {
    }
}
