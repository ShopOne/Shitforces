package com.nazonazo_app.shit_forces.contest

import com.fasterxml.jackson.annotation.JsonCreator
import com.google.gson.Gson
import com.nazonazo_app.shit_forces.HttpResponseClass
import com.nazonazo_app.shit_forces.problem.ResponseProblemInfo
import com.nazonazo_app.shit_forces.session.SessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletRequest

const val ONE_PAGE_SIZE = 20
@RestController
class ContestController(val contestService: ContestService,
                        val sessionService: SessionService) {
    data class RequestContest @JsonCreator constructor(val shortName: String, val name: String,
                                                       val startTime: Float, val endTime: Float, val rated: Boolean)

    //今はICPC形式のみの用意 のちのち変える
    @GetMapping("api/get-contestRanking")
    fun getContestRankingResponse(@RequestParam("shortContestName") shortContestName: String,
                          @RequestParam(value="page") page: Int,
                                                      httpServletRequest: HttpServletRequest): String {
        val sessionAccountName = sessionService.getSessionAccountName(httpServletRequest)
        val requestRanking = contestService.getContestRanking(shortContestName, page, sessionAccountName)
        val response = HttpResponseClass(requestRanking != null, Gson().toJson(requestRanking))
        return Gson().toJson(response)
    }

    @GetMapping("api/contestInfo")
    fun getContestInfoByShortNameResponse(@RequestParam("shortContestName") shortName: String):String {
        val contest = contestService.getContestInfoByShortName(shortName)
        val response = HttpResponseClass(contest != null, Gson().toJson(contest))
        return Gson().toJson(response)
    }

    @GetMapping("api/latest-contestsInfo")
    fun getLatestContestsInfoResponse(@RequestParam("contestNum", required = false) contestNum: Int?):String {
        val contests = contestService.getLatestContestsInfo(contestNum)
        val response = HttpResponseClass(contests != null, Gson().toJson(contests))
        return Gson().toJson(response)
    }
    @PostMapping("api/add-contest", headers = ["Content-Type=application/json"])
    fun addContestResponse(@RequestBody requestContest: RequestContest):String {
        val contest = contestService.addContest(requestContest)
        val response = HttpResponseClass(contest != null, Gson().toJson(contest))
        return Gson().toJson(response)
    }

    @GetMapping("api/get-submission")
    fun getAccountSubmissionOfContestResponse(@RequestParam("accountName") accountName: String,
                             @RequestParam("shortContestName") shortContestName: String,
                             httpServletRequest: HttpServletRequest
    ): String{
        val submissions = contestService.getAccountSubmissionOfContest(accountName, shortContestName, httpServletRequest)
        val response = HttpResponseClass(submissions != null, Gson().toJson(submissions))
        return Gson().toJson(response)
    }
    @PostMapping("api/post-submission", headers = ["Content-Type=application/json"])
    fun submitAnswerResponse(@RequestBody requestSubmission: RequestSubmission,
                             httpServletRequest: HttpServletRequest): String{
        val submitResult = contestService.submitAnswerToContest(requestSubmission, httpServletRequest)
        val response = HttpResponseClass(submitResult != null, Gson().toJson(submitResult))
        return Gson().toJson(response)
    }
    @GetMapping("/api/problemsInfo")
    fun getContestProblemsResponse(@RequestParam("shortContestName") shortContestName: String,
                           httpServletRequest: HttpServletRequest) : String{
        val problems = contestService.getContestProblems(shortContestName, httpServletRequest)
        val responseProblem = problems?.map{
            ResponseProblemInfo(it.contestName, it.point, it.statement, it.indexOfContest)
        }
        val response = HttpResponseClass(responseProblem != null, Gson().toJson(responseProblem))
        return Gson().toJson(response)
    }

}