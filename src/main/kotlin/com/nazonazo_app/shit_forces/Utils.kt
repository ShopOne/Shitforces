package com.nazonazo_app.shit_forces

import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class Utils {
    fun formatTimestamp(time: Timestamp): String {
        val sdf = SimpleDateFormat("yyyy/MM/dd hh:mm:ss a", Locale.ENGLISH)
        return sdf.format(Date(time.time))
    }
}
