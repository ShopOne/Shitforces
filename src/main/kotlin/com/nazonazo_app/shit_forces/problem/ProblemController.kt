package com.nazonazo_app.shit_forces.problem

import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@CrossOrigin(origins = ["http://localhost:3000"], allowCredentials = "true")
@RestController
class ProblemController(
    val sharedProblemService: SharedProblemService
) {
    @GetMapping("api/problem/{problemId}/favCount")
    fun getFavCountResponse(@PathVariable("problemId") problemId: Int): Int {
        return sharedProblemService.getFavCount(problemId)
    }
}
