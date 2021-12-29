package com.nazonazo_app.shit_forces

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class SinglePageController {
    @GetMapping(".*")
    fun any(): String {
        return "forward:/index.html"
    }
}
