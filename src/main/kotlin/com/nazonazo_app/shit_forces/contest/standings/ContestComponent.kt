package com.nazonazo_app.shit_forces.contest.standings

import com.nazonazo_app.shit_forces.contest.ContestInfo
import com.nazonazo_app.shit_forces.contest.ContestRepository
import io.github.redouane59.twitter.TwitterClient
import io.github.redouane59.twitter.signature.TwitterCredentials
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

const val ERROR_TIME_TWEET = 3 // スケジューラ―の誤差を3分許容
@Component
class ContestComponent(
    private val contestRepository: ContestRepository
) {
    @Scheduled(cron = "0 */10 * * * *")
    fun tweetContestInfo() {
        val now = System.currentTimeMillis()
        val contests = contestRepository.findUpcomingContest()
        // 環境変数にアクセストークンが無いのであれば処理はしない
        System.getenv("TWITTER_ACCESS_TOKEN") ?: return
        contests.forEach {
            val contestTime = it.startTime.time
            val diff = (contestTime - now) / (1000 * 60) // 分単位での差
            // 30分前
            if (30 - ERROR_TIME_TWEET <= diff && diff <= 30 + ERROR_TIME_TWEET) {
                postTweet(it, 30)
            }
            if (10 - ERROR_TIME_TWEET <= diff && diff <= 10 + ERROR_TIME_TWEET) {
                postTweet(it, 10)
            }
        }
    }

    fun postTweet(contest: ContestInfo, time: Int) {
        val client = TwitterClient(
            TwitterCredentials.builder()
                .accessToken(System.getenv("TWITTER_ACCESS_TOKEN"))
                .accessTokenSecret(System.getenv("TWITTER_SECRET_TOKEN"))
                .apiKey(System.getenv("TWITTER_API_KEY"))
                .apiSecretKey(System.getenv("TWITTER_API_SECRET"))
                .build()
        )
        val url = "https://shitforces.herokuapp.com/contest/${contest.id}"
        client.postTweet("あと${time}分です。\n是非ご参加ください。\n#Shitforce #くそなぞなぞ\n$url")
    }
}
