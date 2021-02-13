package com.nazonazo_app.shit_forces.account

import com.nazonazo_app.shit_forces.EmptyResponse
import com.nazonazo_app.shit_forces.session.SharedSessionService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import javax.servlet.http.HttpServletResponse

@CrossOrigin
@RestController
class AccountController(private val accountService: AccountService,
                        private val sharedAccountService: SharedAccountService,
                        private val sharedSessionService: SharedSessionService
) {

    @RequestMapping("api/signup",
        headers = ["Content-Type=application/json"],
        method = [RequestMethod.POST])
    fun createAccountResponse(@RequestBody requestAccount: RequestAccount,
                              httpServletResponse: HttpServletResponse
    ): AccountInfo {
        val account = accountService.createAccount(requestAccount)
            ?: throw ResponseStatusException(HttpStatus.CONFLICT)

        sharedSessionService.createNewSession(account.name, httpServletResponse)

        return account
    }


    @PostMapping("api/login",
        headers = ["Content-Type=application/json"])
    fun loginAccountResponse(@RequestBody requestAccount: RequestAccount,
                             httpServletResponse: HttpServletResponse
    ): EmptyResponse {
        val result = accountService.loginAccount(requestAccount, httpServletResponse)
        if (!result) throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        return EmptyResponse()
    }

    @GetMapping("api/account/{accountName}")
    fun getAccountByNameResponse(@PathVariable("accountName") accountName: String): ResponseAccount {
        val account = sharedAccountService.getAccountByName(accountName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return ResponseAccount(account.name, sharedAccountService.calcCorrectionRate(account))
    }
}
