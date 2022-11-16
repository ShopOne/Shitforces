package com.nazonazo_app.shit_forces.problem

data class ProblemInfo(
    val contestId: String,
    val point: Int,
    val statement: String,
    val indexOfContest: Int,
    val answer: List<String>,
    val isQuiz: Boolean,
    val id: Int? = null
)
data class ResponseProblemInfo(
    val contestId: String?,
    val point: Int?,
    val statement: String,
    val indexOfContest: Int?,
    val isQuiz: Boolean,
    val id: Int
)
data class PutRequestProblem(
    val statement: String,
    val point: Int,
    val isQuiz: Boolean,
    val answer: List<String>
)
data class FavInfo(
    val accountName: String,
    val problemId: Int
)
