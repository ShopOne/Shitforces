package com.nazonazo_app.shit_forces.session

import java.sql.Timestamp
import java.util.*

data class SessionData(
        val accountName: String,
        val sessionId: String,
        val expirationDate: Timestamp
) {
    companion object{
        const val SESSION_LIFE_INTEGER = 60 * 60 * 24 * 7
        const val SESSION_LIFE_CALENDAR = Calendar.WEEK_OF_YEAR
    }
}