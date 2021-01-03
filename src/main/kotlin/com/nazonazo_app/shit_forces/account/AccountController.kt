package com.nazonazo_app.shit_forces.account

import com.google.gson.Gson
import com.nazonazo_app.shit_forces.HttpResponseClass
import com.nazonazo_app.shit_forces.session.SessionService
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@RestController
class AccountController(private val accountService: AccountService,
                        private val sessionService: SessionService) {

    @RequestMapping("api/signup",
        headers = ["Content-Type=application/json"],
        method = [RequestMethod.POST])
    fun createAccountResponse(@RequestBody requestAccount: RequestAccount,
                              httpServletResponse: HttpServletResponse): String {
        val account = accountService.createAccount(requestAccount)
        if (account != null) sessionService.createNewSession(account.name, httpServletResponse)

        val request = HttpResponseClass(account != null, Gson().toJson(account))
        return Gson().toJson(request)
    }


    @PostMapping("api/login",
        headers = ["Content-Type=application/json"])
    fun loginAccountResponse(@RequestBody requestAccount: RequestAccount,
                     httpServletResponse: HttpServletResponse): String {
        val result = accountService.loginAccount(requestAccount, httpServletResponse)
        val response = HttpResponseClass(result)
        return Gson().toJson(response)
    }

    @GetMapping("api/account/{accountName}")
    fun getAccountByNameResponse(@PathVariable("accountName") accountName: String): String {
        val rawAccount = accountService.getAccountByName(accountName)
        val responseAccount = if(rawAccount != null) ResponseAccount(rawAccount.name, rawAccount.rating)
        else null

        val response = HttpResponseClass(responseAccount != null, Gson().toJson(responseAccount))
        return Gson().toJson(response)
    }


}
