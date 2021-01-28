package com.nazonazo_app.shit_forces.contest

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
@RestController
class ContestController(val contestService: ContestService,
                        val sharedContestService: SharedContestService,
                        val sharedSessionService: SharedSessionService
                        ) {
    data class RequestContest constructor(val shortName: String, val name: String,
                                          val startTime: Float, val endTime: Float, val rated: Boolean)

    //今はICPC形式のみの用意 のちのち変える
    @GetMapping("api/get-contestRanking")
    fun getContestRankingResponse(@RequestParam("shortContestName") shortContestName: String,
                                  @RequestParam(value="page") page: Int,
                                  httpServletRequest: HttpServletRequest
    ): RequestRanking {
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
        return sharedContestService.getContestRanking(shortContestName, page, sessionAccountName)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @GetMapping("api/contestInfo")
    fun getContestInfoByShortNameResponse(@RequestParam("shortContestName") shortName: String):ContestInfo {
        return contestService.getContestInfoByShortName(shortName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @GetMapping("api/latest-contestsInfo")
    fun getLatestContestsInfoResponse(@RequestParam("contestNum") contestNum: Int?):List<ContestInfo> {
        return contestService.getLatestContestsInfo(contestNum)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    @PostMapping("api/add-contest", headers = ["Content-Type=application/json"])
    fun addContestResponse(@RequestBody requestContest: RequestContest):ContestInfo {
        return contestService.addContest(requestContest)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
    }

    @GetMapping("api/get-submission")
    fun getAccountSubmissionOfContestResponse(@RequestParam("accountName") accountName: String,
                             @RequestParam("shortContestName") shortContestName: String,
                             httpServletRequest: HttpServletRequest
    ): List<SubmissionInfo> {
        return contestService.getAccountSubmissionOfContest(accountName, shortContestName, httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    @PostMapping("api/post-submission", headers = ["Content-Type=application/json"])
    fun submitAnswerResponse(@RequestBody requestSubmission: RequestSubmission,
                             httpServletRequest: HttpServletRequest
    ): SubmissionInfo {
        return contestService.submitAnswerToContest(requestSubmission, httpServletRequest)
    }
    @GetMapping("/api/problemsInfo")
    fun getContestProblemsResponse(@RequestParam("shortContestName") shortContestName: String,
                                   httpServletRequest: HttpServletRequest
    ): List<ResponseProblemInfo> {
        val problems = contestService.getContestProblems(shortContestName, httpServletRequest)
        return problems?.map{
            ResponseProblemInfo(it.contestName, it.point, it.statement, it.indexOfContest)
        } ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }

}