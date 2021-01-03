package com.nazonazo_app.shit_forces

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable

@Controller
class SinglePageController {
    @GetMapping("/**/{path:[^.]*}")
    fun any(@PathVariable path: String): String {
        return "forward:/index.html"
    }
}
