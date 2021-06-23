package com.nazonazo_app.shit_forces.account

import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import java.util.Base64
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

const val LOCK_TIME = 1000 * 60 * 10
const val LOCK_COUNT = 10
@Transactional
@Service
class AccountService(
    val accountInfoRepository: AccountInfoRepository,
    val sharedSubmissionService: SharedSubmissionService,
    val sharedSessionService: SharedSessionService
) {

    private fun createConnectedPassword(accountName: String, password: String): String {
        return Base64.getEncoder().encodeToString("$accountName:$password".toByteArray())
    }

    private fun createHashPassword(accountName: String, password: String): String {
        val bcrypt = BCryptPasswordEncoder()
        return bcrypt.encode(createConnectedPassword(accountName, password))
    }

    private fun isSamePassword(name: String, password: String): Boolean {
        val savedPasswordHash = accountInfoRepository.findByAccountName(name)?.passwordHash
        return BCryptPasswordEncoder().matches(createConnectedPassword(name, password), savedPasswordHash)
    }

    fun createAccount(requestAccount: RequestAccountForCertification): AccountInfo {
        if (requestAccount.name.length < 4) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }
        if (accountInfoRepository.findByAccountName(requestAccount.name) != null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }
        return accountInfoRepository.createAccount(
            requestAccount.name,
            createHashPassword(requestAccount.name, requestAccount.password))
    }

    @Transactional(noRollbackForClassName = ["ResponseStatusException"])
    fun loginAccount(requestAccount: RequestAccountForCertification, servletResponse: HttpServletResponse) {
        val account = accountInfoRepository.findByAccountName(requestAccount.name)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        if (account.lockTime.time + LOCK_TIME > System.currentTimeMillis()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        } else if (!isSamePassword(requestAccount.name, requestAccount.password)) {
            if (account.loginFailCount + 1 == LOCK_COUNT) {
                accountInfoRepository.lockAccount(requestAccount.name)
            } else {
                accountInfoRepository.addLockCount(requestAccount.name)
            }
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        } else {
            sharedSessionService.createNewSession(requestAccount.name, servletResponse)
                ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
            accountInfoRepository.resetAccountLock(requestAccount.name)
        }
    }

    fun changeAccountName(
        prevAccountName: String,
        requestAccount: RequestAccountForCertification,
        httpServletRequest: HttpServletRequest,
        httpServletResponse: HttpServletResponse
    ) {
        if (!isSamePassword(prevAccountName, requestAccount.password)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        accountInfoRepository.changeAccountName(prevAccountName, requestAccount.name,
            createHashPassword(requestAccount.name, requestAccount.password))
        sharedSessionService.deleteSession(prevAccountName)
        sharedSessionService.createNewSession(requestAccount.name, httpServletResponse)
        sharedSubmissionService.changeSubmissionAccountName(prevAccountName, requestAccount.name)
        accountInfoRepository.changeAccountNameOnAccountRatingChangeHistory(prevAccountName, requestAccount.name)
    }

    fun getAccountRanking(page: Int): ResponseAccountRanking {
        val accounts = accountInfoRepository.findAllAccount()
            .filter { it.partNum != 0 }
        val responseAccounts = accounts
            .map { ResponseAccountInfoInterface.build(it) }
            .sortedBy { -it.rating }
            .filterIndexed { idx, _ ->
                page * ACCOUNT_RANKING_ONE_PAGE <= idx && idx < (page + 1) * ACCOUNT_RANKING_ONE_PAGE }
        return ResponseAccountRanking(responseAccounts, accounts.size)
    }
}
