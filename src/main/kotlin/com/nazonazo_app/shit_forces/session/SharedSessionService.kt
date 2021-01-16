package com.nazonazo_app.shit_forces.session

import org.apache.commons.lang3.RandomStringUtils
import org.springframework.stereotype.Service
import java.util.*
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

const val ACCOUNT_NAME_COOKIE_KEY = "_sforce_account_name"
const val SESSION_ID_COOKIE_KEY = "_sforce_login_session"

@Service
class SharedSessionService(private val sessionRepository: SessionRepository) {
    fun createCookie(key: String, value: String, expirationDate: Date) : Cookie {
        val cookie = Cookie(key, value)
        //一週間 変更する際はsessionRepositoryのgetExpirationDate()も
        cookie.maxAge = SessionData.SESSION_LIFE_INTEGER
        cookie.path ="/"
        // セッションIDのCookieはJavaScriptからは保護
        if (key == SESSION_ID_COOKIE_KEY) {
            cookie.isHttpOnly = true
        }
        return cookie
    }
    fun createNewSession(name: String, response: HttpServletResponse): SessionData? =
        try {
            val sessionId: String = RandomStringUtils.randomAlphanumeric(50)
            val session = sessionRepository.addNewSession(name, sessionId) ?: throw Error("セッション作成に失敗しました")
            response.addCookie(createCookie(SESSION_ID_COOKIE_KEY, session.sessionId, session.expirationDate))
            response.addCookie(createCookie(ACCOUNT_NAME_COOKIE_KEY, session.accountName, session.expirationDate))
            session
        } catch (e: Error) {
            print(e)
            null
        }
    fun getSessionAccountName(httpServletRequest: HttpServletRequest): String? {
        val cookies = httpServletRequest.cookies ?: return null
        var accountName: String? = null
        cookies.forEach {
            if (it.name ==  ACCOUNT_NAME_COOKIE_KEY) {
                accountName = it.value
            }
        }
        accountName ?: return null

        return if (isValidSession(accountName!!, httpServletRequest)) accountName
        else null
    }
    fun isValidSession(accountName: String, httpServletRequest: HttpServletRequest): Boolean {
        val cookies = httpServletRequest.cookies ?: return false
        var sessionId = ""
        cookies.forEach {
            if (it.name == SESSION_ID_COOKIE_KEY) {
                sessionId = it.value
            }
        }
        val savedSession = sessionRepository.findByName(accountName)
        return savedSession?.sessionId == sessionId
    }
}