package com.nazonazo_app.shit_forces.problem

data class ProblemInfo(
    val contestName: String?,
    val point: Int?,
    val statement: String,
    val indexOfContest: Int?,
    val answer: List<String>
)
data class ResponseProblemInfo(
    val contestName: String?,
    val point: Int?,
    val statement: String,
    val indexOfContest: Int?
)