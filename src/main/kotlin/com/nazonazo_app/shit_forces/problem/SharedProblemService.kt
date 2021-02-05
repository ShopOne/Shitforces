package com.nazonazo_app.shit_forces.problem

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class SharedProblemService(private val problemRepository: ProblemRepository) {
    fun getProblemsByContestName(contestName: String) : List<ProblemInfo> {
        return try{
            return problemRepository.findByContestName(contestName)
        } catch (e: Error) {
            listOf()
        }
    }
    fun getContestProblemScores(contestName: String): List<Int?> =
        try{
            problemRepository.findByContestName(contestName).map{it.point}
        } catch (e: Error) {
            listOf()
        }
    fun getContestProblemByNameAndIndex(contestName: String, indexOfContest: Int): ProblemInfo? =
        try {
            problemRepository.findByContestNameAndIndex(contestName, indexOfContest)
        } catch (e: Error) {
            print(e)
            null
        }
}