package com.nazonazo_app.shit_forces.submission

import com.nazonazo_app.shit_forces.contest.ContestInfo
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.session.SharedSessionService
import java.sql.Timestamp
import org.springframework.stereotype.Service

@Service
class SharedSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val sharedSessionService: SharedSessionService,
    private val sharedProblemService: SharedProblemService
) {

    private fun specialJudge(answer: List<String>, statement: String): Boolean {
        var res = false
        answer.forEach {
            when (it) {
                "special:All" -> res = true
            }
        }
        return res
    }

    fun changeSubmissionAccountName(prevName: String, newName: String) {
        submissionRepository.changeNameOfSubmission(prevName, newName)
    }
    fun getContestSubmission(contest: ContestInfo): List<SubmissionInfo> =
        submissionRepository.findContestSubmission(contest.id)

    fun getContestSubmissionInTime(contest: ContestInfo): List<SubmissionInfo> =
        submissionRepository.findContestSubmissionInTime(contest.id, contest.startTime, contest.endTime)

    fun getValidContestSubmission(contest: ContestInfo): List<SubmissionInfo> {
        val submissions = getContestSubmissionInTime(contest)
        val problems = sharedProblemService.getProblemsByContestId(contest.id)
        val validSubmissions = mutableListOf<SubmissionInfo>()
        // Pair<アカウント名, 提出インデックス>
        val alreadySubmitSet = mutableSetOf<Pair<String, Int>>()
        submissions.forEach {
            val pastSubmit = validSubmissions.find { submit ->
                submit.accountName == it.accountName && submit.indexOfContest == it.indexOfContest
            }
            if (!problems[it.indexOfContest].isQuiz || pastSubmit == null) {
                validSubmissions.add(it)
                alreadySubmitSet.add(Pair(it.accountName, it.indexOfContest))
            }
        }
        return validSubmissions
    }

    fun getSubmissionOfAccount(accountName: String, contestId: String): List<SubmissionInfo> =
        submissionRepository.findSubmissions(accountName, contestId)

    fun submitAnswer(
        indexOfContest: Int,
        contestId: String,
        statement: String,
        submitAccountName: String
    ): SubmissionInfo? =
        try {
            val problem = sharedProblemService.getContestProblemByNameAndIndex(contestId, indexOfContest)
                ?: throw Error("問題が見つかりません")

            // TODO: インタラクティブにいずれ対応
            val now = Timestamp(System.currentTimeMillis())
            val submission = if (statement in problem.answer ||
                (problem.answer.isNotEmpty() && specialJudge(problem.answer, statement))) {
                SubmissionInfo(contestId, indexOfContest,
                    submitAccountName, statement, now,
                    SubmissionResult.ACCEPTED
                )
            } else {
                SubmissionInfo(contestId, indexOfContest,
                    submitAccountName, statement, now,
                    SubmissionResult.WRONG_ANSWER
                )
            }
            submissionRepository.addSubmission(submission)
            submission
        } catch (e: Error) {
            print(e)
            null
        }
}
