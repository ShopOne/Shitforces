package com.nazonazo_app.shit_forces.submission

import com.nazonazo_app.shit_forces.contest.ContestInfo
import com.nazonazo_app.shit_forces.problem.ProblemInfo
import com.nazonazo_app.shit_forces.problem.ProblemService
import org.springframework.stereotype.Service
import java.sql.Timestamp

@Service
class SubmissionService(val submissionRepository: SubmissionRepository,
                        val problemService: ProblemService){

    private fun specialJudge(answers: List<String>, statement: String): Boolean {
        var res = false
        answers.forEach {
            when(it) {
                "special:All" -> res = true
            }
        }
        return res
    }

    fun getContestSubmission(contest: ContestInfo): List<SubmissionInfo> =
        submissionRepository.findContestSubmission(contest.startTime, contest.endTime)

    fun getContestSubmissionInTime(contest: ContestInfo): List<SubmissionInfo> =
        submissionRepository.findContestSubmissionInTime(contest.name, contest.startTime, contest.endTime)

    fun getSubmissionOfAccount(accountName: String, contestName: String): List<SubmissionInfo> =
        submissionRepository.findSubmissions(accountName, contestName)
    fun submitAnswer(indexOfContest: Int, contestName: String, statement: String, submitAccountName: String): SubmissionInfo? =
        try {
            val problem = problemService.getContestProblemByNameAndIndex(contestName, indexOfContest)
                ?: throw Error("問題が見つかりません")

            //TODO: インタラクティブにいずれ対応
            val now = Timestamp(System.currentTimeMillis())
            val submission = if (statement in problem.answer ||
                (problem.answer.isNotEmpty() && specialJudge(problem.answer, statement))) {
                SubmissionInfo(contestName, indexOfContest,
                    submitAccountName, statement, now,
                    SubmissionResult.ACCEPTED
                )
            } else {
                SubmissionInfo(contestName, indexOfContest,
                    submitAccountName, statement, now,
                    SubmissionResult.WRONG_ANSWER
                )
            }
            submissionRepository.addSubmission(submission)
            submission
        } catch (e: Error){
            print(e)
            null
        }
}