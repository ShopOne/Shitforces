package com.nazonazo_app.shit_forces

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class ShitforcesApplication

fun main(args: Array<String>) {
    runApplication<ShitforcesApplication>(*args)
}
