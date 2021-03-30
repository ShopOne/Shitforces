package com.nazonazo_app.shit_forces.problem

data class ProblemInfo(
    val contestId: String,
    val point: Int,
    val statement: String,
    val indexOfContest: Int,
    val answer: List<String>,
    val id: Int? = null
)
data class ResponseProblemInfo(
    val contestId: String?,
    val point: Int?,
    val statement: String,
    val indexOfContest: Int?,
    val id: Int
)
data class PutRequestProblem(
    val statement: String,
    val point: Int,
    val answer: List<String>
)