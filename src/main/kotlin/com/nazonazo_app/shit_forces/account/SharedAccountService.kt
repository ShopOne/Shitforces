package com.nazonazo_app.shit_forces.account

import org.springframework.stereotype.Service

@Service
class SharedAccountService(private val accountInfoRepository: AccountInfoRepository){
    fun getAccountByName(accountName: String): AccountInfo? {
        return try {
            accountInfoRepository.findByAccountName(accountName)
        } catch (e: Error) {
            print(e)
            null
        }
    }
}