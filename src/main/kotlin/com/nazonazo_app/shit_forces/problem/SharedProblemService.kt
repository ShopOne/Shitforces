package com.nazonazo_app.shit_forces.problem

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class SharedProblemService(private val problemRepository: ProblemRepository) {
    fun getProblemsByContestId(contestId: String) : List<ProblemInfo> {
        return try{
            return problemRepository.findByContestId(contestId)
        } catch (e: Error) {
            listOf()
        }
    }

    fun getContestProblemScores(contestName: String): List<Int?> =
        try{
            problemRepository.findByContestId(contestName).map{it.point}
        } catch (e: Error) {
            listOf()
        }

    fun getContestProblemByNameAndIndex(contestName: String, indexOfContest: Int): ProblemInfo? =
        try {
            problemRepository.findByContestIdAndIndex(contestName, indexOfContest)
        } catch (e: Error) {
            print(e)
            null
        }

    fun updateContestProblem(contestId: String, newProblems: List<ProblemInfo>) {
        val prevProblem = problemRepository.findByContestId(contestId)
        prevProblem.forEach {
            problemRepository.deleteProblemById(it.id!!)
        }
        problemRepository.addProblems(contestId, newProblems)
    }

    fun updateContestProblemStatement(contestId: String, newProblems: List<ProblemInfo>) {
        problemRepository.updateProblemStatement(contestId, newProblems)
    }

    fun getProblemById(id: Int): ProblemInfo? {
        return problemRepository.findById(id)
    }

    fun getAnswersById(id: Int): List<String> {
        return problemRepository.findAnswersById(id)
    }
}