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
}