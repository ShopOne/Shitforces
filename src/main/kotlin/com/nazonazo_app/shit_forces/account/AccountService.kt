package com.nazonazo_app.shit_forces.account

import com.nazonazo_app.shit_forces.session.SharedSessionService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import javax.servlet.http.HttpServletResponse

@Transactional
@Service
class AccountService(val accountInfoRepository: AccountInfoRepository,
                     val sharedSessionService: SharedSessionService){

    private fun hashPassword(password: String): String {
        val bcrypt = BCryptPasswordEncoder()
        return bcrypt.encode(password)
    }

    private fun isSamePassword(name: String, password: String): Boolean {
        val savedPasswordHash = accountInfoRepository.findByAccountName(name)?.passwordHash
        return BCryptPasswordEncoder().matches(password, savedPasswordHash)
    }

    fun createAccount(requestAccount: RequestAccount): AccountInfo? =
        try {
            if (requestAccount.name.length < 4) {
                throw Error("名前が短すぎます")
            }
            if (accountInfoRepository.findByAccountName(requestAccount.name) != null) {
                throw Error("名前が重複しています")
            }
            val account = accountInfoRepository.createAccount(
                requestAccount.name,
                hashPassword(requestAccount.password)) ?: throw Error("アカウント作成に失敗しました")
            account
        } catch (e: Error) {
            print(e)
            null
        }

    fun loginAccount(requestAccount: RequestAccount, servletResponse: HttpServletResponse): Boolean =
        if(!isSamePassword(requestAccount.name, requestAccount.password)) {
            false
        } else {
            sharedSessionService.createNewSession(requestAccount.name, servletResponse) != null
        }
}