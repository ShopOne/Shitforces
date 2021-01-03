package com.nazonazo_app.shit_forces.contest

data class ContestHistoryData(
        val accountId: Int,
        val index: Int,
        val ranking: Int,
        val resultRate: Int,
        val changeFromOriginalRate: Int
)
