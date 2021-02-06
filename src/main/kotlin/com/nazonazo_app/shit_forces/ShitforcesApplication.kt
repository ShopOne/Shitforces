package com.nazonazo_app.shit_forces

import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.jdbc.core.JdbcTemplate

@SpringBootApplication
class ShitforcesApplication {

    @Bean
    fun createContestInfoDataBase(jdbcTemplate: JdbcTemplate) = CommandLineRunner {
        jdbcTemplate.execute("""CREATE TABLE IF NOT EXISTS contestInfo (
            shortName VARCHAR(20)   PRIMARY KEY,
    		name 	  VARCHAR(30) NOT NULL,
            statement VARCHAR(500) NOT NULL,
			startTime TIMESTAMP NOT NULL,
            endTime   TIMESTAMP NOT NULL,
            contestType VARCHAR(20) NOT NULL,
            ratedBound INT NOT NULL DEFAULT -1,
            penalty   INT DEFAULT 0 ,
            rated     BOOLEAN NOT NULL,
            UNIQUE(name)
		)""")
    }
    @Bean
    fun createAccountInfoDataBase(jdbcTemplate: JdbcTemplate) = CommandLineRunner {
        jdbcTemplate.execute("""CREATE TABLE IF NOT EXISTS accountInfo (
				name         VARCHAR(20)    PRIMARY KEY,
				rating	     INT NOT NULL DEFAULT 0,
                innerRating  INT NOT NULL DEFAULT 0,
				passwordHash VARCHAR NOT NULL,
                permission   VARCHAR(15)
		)""")
        jdbcTemplate.execute("""CREATE TABLE IF NOT EXISTS accountRatingChangeHistory(
                accountName           VARCHAR(20)  NOT NULL,
                contestName           VARCHAR(30)  NOT NULL,
                indexOfParticipation  INT          NOT NULL,
                newRating             INT          NOT NULL,
                prevRating            INT          NOT NULL,
                performance           INT          NOT NULL
        )""")
    }
    @Bean
    fun createSessionInfoDataBase(jdbcTemplate: JdbcTemplate) = CommandLineRunner {
        jdbcTemplate.execute("""CREATE TABLE IF NOT EXISTS sessionData(
                name                VARCHAR(20) PRIMARY KEY,
                sessionId           VARCHAR(80) NOT NULL,
                expirationDate  TIMESTAMP NOT NULL
        )""")
    }
    @Bean
    fun createProblemInfoDatabase(jdbcTemplate: JdbcTemplate) = CommandLineRunner {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS problemInfo(
                id                  SERIAL PRIMARY KEY,
                contestName         VARCHAR(30),
                indexOfContest      INT,
                point               INT,
                statement           VARCHAR(200),
                UNIQUE(contestName, indexOfContest)
           )""")
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS answerInfo(
            id                     INT NOT  NULL,
            answer                 VARCHAR(200) NOT NULL
            )
        """)
    }
    @Bean
    fun createSubmissionInfoDataBase(jdbcTemplate: JdbcTemplate) = CommandLineRunner {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS submissionInfo(
            id                      SERIAL PRIMARY KEY ,
            contestName             VARCHAR(30),
            accountName             VARCHAR(20),
            indexOfContest          INT,
            result                  VARCHAR(50),
            statement               VARCHAR(200),
            submitTime              TIMESTAMP
            )
        """)
    }
}

fun main(args: Array<String>) {
    runApplication<ShitforcesApplication>(*args)
}
