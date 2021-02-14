package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.problem.ResponseProblemInfo
import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import javax.servlet.http.HttpServletRequest

const val ONE_PAGE_SIZE = 20
const val SUBMIT_INTERVAL_TIME = 10 * 1000

@CrossOrigin
@RestController
class ContestController(val contestService: ContestService,
                        val sharedContestService: SharedContestService,
                        val sharedAccountService: SharedAccountService,
                        val sharedSessionService: SharedSessionService
                        ) {
    data class RequestContest constructor(val shortName: String, val name: String,
                                          val startTime: Float, val endTime: Float, val rated: Boolean)

    @PostMapping("api/contests/{short_contest_name}/rating")
    fun updateRatingByContestResult(@PathVariable("short_contest_name") shortContestName: String,
                                    httpServletRequest: HttpServletRequest) {
        val contest = contestService.getContestInfoByShortName(shortContestName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        val accountInfo = sharedAccountService.getAccountByName(sessionAccountName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        if (accountInfo.authority !== AccountInfo.AccountAuthority.ADMINISTER) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        contestService.updateRating(contest)
    }
    @GetMapping("api/contests/{short_contest_name}/ranking")
    fun getContestRankingResponse(@PathVariable("short_contest_name") shortContestName: String,
                                  @RequestParam(value="page") page: Int,
                                  httpServletRequest: HttpServletRequest
    ): RequestRanking {
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
        return sharedContestService.getContestRanking(shortContestName, page, sessionAccountName)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @GetMapping("api/contests/{short_contest_name}")
    fun getContestInfoByShortNameResponse(@PathVariable("short_contest_name") shortName: String):ContestInfo {
        return contestService.getContestInfoByShortName(shortName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @GetMapping("api/contests/latest")
    fun getLatestContestsInfoResponse(@RequestParam("contest_num") contestNum: Int?):List<ContestInfo> {
        return contestService.getLatestContestsInfo(contestNum)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    /*
    @PostMapping("api/contests/", headers = ["Content-Type=application/json"])
    fun addContestResponse(@RequestBody requestContest: RequestContest):ContestInfo {
        return contestService.addContest(requestContest)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
    }
     */

    @GetMapping("api/submissions/{account_name}")
    fun getAccountSubmissionOfContestResponse(@PathVariable("account_name") accountName: String,
                                              @RequestParam("short_contest_name") shortContestName: String,
                                              httpServletRequest: HttpServletRequest
    ): List<SubmissionInfo> {
        return contestService.getAccountSubmissionOfContest(accountName, shortContestName, httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    @PostMapping("api/submissions", headers = ["Content-Type=application/json"])
    fun submitAnswerResponse(@RequestBody requestSubmission: RequestSubmission,
                             httpServletRequest: HttpServletRequest
    ): SubmissionInfo {
        return contestService.submitAnswerToContest(requestSubmission, httpServletRequest)
    }
    @GetMapping("api/contests/{short_contest_name}/problems")
    fun getContestProblemsResponse(@PathVariable("short_contest_name") shortContestName: String,
                                   httpServletRequest: HttpServletRequest
    ): List<ResponseProblemInfo> {
        val problems = contestService.getContestProblems(shortContestName, httpServletRequest)
        return problems?.map{
            ResponseProblemInfo(it.contestName, it.point, it.statement, it.indexOfContest)
        } ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    @PostMapping("api/contests/{short_contest_name}/new-rating")
    fun updateRatingByContestResultResponse(@PathVariable("short_contest_name") shortContestName: String,
                                            httpServletRequest: HttpServletRequest) {

        val contestInfo = contestService.getContestInfoByName(shortContestName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        val requestAccount = sharedAccountService.getAccountByName(accountName)
        if (requestAccount?.authority != AccountInfo.AccountAuthority.ADMINISTER) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        contestService.updateRating(contestInfo)
    }

}