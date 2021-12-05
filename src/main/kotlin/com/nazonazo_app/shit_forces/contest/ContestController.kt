package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.contest.standings.ContestStandingsInfo
import com.nazonazo_app.shit_forces.problem.ResponseProblemInfo
import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import com.nazonazo_app.shit_forces.submission.ResponseContestSubmissionOfRaid
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

const val ONE_PAGE_SIZE = 20
const val SUBMIT_INTERVAL_TIME = 5 * 1000
const val LATEST_CONTEST_PAGE_SIZE = 10

@CrossOrigin(origins = ["http://localhost:3000"], allowCredentials = "true")
@RestController
class ContestController(
    val contestService: ContestService,
    val sharedContestService: SharedContestService,
    val sharedAccountService: SharedAccountService,
    val sharedSessionService: SharedSessionService
) {

    @PostMapping("api/contests/{contest-id}/rating")
    fun updateRatingByContestResult(
        @PathVariable("contest-id") contestId: String,
        httpServletRequest: HttpServletRequest
    ) {
        contestService.updateRating(contestId, httpServletRequest)
    }

    @GetMapping("api/contests/{contest-id}/standings")
    fun getContestStandingsResponse(
        @PathVariable("contest-id") contestId: String,
        @RequestParam(value = "page", required = false) page: Int?,
        httpServletRequest: HttpServletRequest
    ): ContestStandingsInfo {
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
        return sharedContestService.getContestStandings(contestId, page, sessionAccountName)
    }

    @GetMapping("api/contests/{contest-id}")
    fun getContestInfoByContestIdResponse(@PathVariable("contest-id") contestId: String): ResponseContestInfo {
        return ResponseContestInfoInterface.build(
            contestService.getContestInfoByContestId(contestId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        )
    }

    @GetMapping("api/contests/latest")
    fun getLatestContestsInfoResponse(@RequestParam("contest_page") contestPage: Int): LatestContestsInfo {
        return contestService.getLatestContestsInfo(contestPage)
    }

    @GetMapping("api/contests/upcoming")
    fun getUpcomingContestsInfoResponse(): LatestContestsInfo {
        return contestService.getUpcomingContestsInfo()
    }

    @PostMapping("api/contests", headers = ["Content-Type=application/json"])
    fun addContestResponse(
        @RequestBody requestContest: RequestContestInfoForUpdate,
        httpServletRequest: HttpServletRequest
    ) {
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        val sessionAccount = sharedAccountService.getAccountByName(sessionAccountName)
        if (sessionAccount?.authority != AccountInfo.AccountAuthority.ADMINISTER) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        contestService.addContest(requestContest)
    }

    @GetMapping("api/submissions/{account-name}")
    fun getAccountSubmissionOfContestResponse(
        @PathVariable("account-name") accountName: String,
        @RequestParam("contest_id") contestId: String,
        httpServletRequest: HttpServletRequest
    ): List<SubmissionInfo> {
        return contestService.getAccountSubmissionOfContest(accountName, contestId, httpServletRequest)
    }

    @GetMapping("api/submissions/{contest_id}/raid")
    fun getContestSubmissionOfRaidResponse(
        @PathVariable("contest_id") contestId: String,
        @RequestParam("index_of_contest") indexOfContest: Int
    ): List<ResponseContestSubmissionOfRaid> {
        return contestService.getContestSubmissionOfRaid(contestId, indexOfContest)
    }

    @PostMapping("api/submissions", headers = ["Content-Type=application/json"])
    fun submitAnswerResponse(
        @RequestBody requestSubmission: RequestSubmission,
        httpServletResponse: HttpServletResponse,
        httpServletRequest: HttpServletRequest
    ): SubmissionInfo {
        return contestService.submitAnswerToContest(requestSubmission, httpServletRequest, httpServletResponse)
    }

    @GetMapping("api/contests/{contest_id}/problems")
    fun getContestProblemsResponse(
        @PathVariable("contest_id") contestId: String,
        httpServletRequest: HttpServletRequest
    ): List<ResponseProblemInfo> {
        val problems = contestService.getContestProblems(contestId, httpServletRequest)
        return problems?.map {
            ResponseProblemInfo(it.contestId, it.point, it.statement, it.indexOfContest, it.isQuiz, it.id!!)
        } ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @PutMapping("api/contests/{contest_id}")
    fun putContestInfoResponse(
        @PathVariable("contest_id") contestId: String,
        @RequestBody putRequestContest: RequestContestForPut,
        httpServletRequest: HttpServletRequest
    ) {
        contestService.putContestInfo(contestId, putRequestContest, httpServletRequest)
    }

    @PatchMapping("api/contests/{contest_id}")
    fun patchContestInfoResponse(
        @PathVariable("contest_id") contestId: String,
        @RequestBody putRequestContest: RequestContestForPut,
        httpServletRequest: HttpServletRequest
    ) {
        contestService.patchContestInfo(contestId, putRequestContest, httpServletRequest)
    }

    @GetMapping("api/problems/{problem_id}/answer")
    fun getAnswerByIdResponse(
        @PathVariable("problem_id") id: Int,
        httpServletRequest: HttpServletRequest
    ): List<String> {
        return contestService.getProblemAnswer(id, httpServletRequest)
    }
}
