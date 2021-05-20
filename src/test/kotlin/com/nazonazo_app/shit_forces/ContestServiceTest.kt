package com.nazonazo_app.shit_forces

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.contest.ContestInfo
import com.nazonazo_app.shit_forces.contest.ContestRankingAccountInfo
import com.nazonazo_app.shit_forces.contest.ContestRepository
import com.nazonazo_app.shit_forces.contest.ContestService
import com.nazonazo_app.shit_forces.contest.RequestRanking
import com.nazonazo_app.shit_forces.contest.SharedContestService
import com.nazonazo_app.shit_forces.problem.SharedProblemService
import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import java.sql.Timestamp
import kotlin.math.pow
import kotlin.math.sqrt
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.junit.Before
import org.junit.Test
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class ContestServiceTest {
    @MockK
    private lateinit var sharedContestService: SharedContestService
    @MockK
    private lateinit var sharedAccountService: SharedAccountService
    @MockK
    private lateinit var contestRepository: ContestRepository
    @MockK
    private lateinit var sharedSessionService: SharedSessionService
    @MockK
    private lateinit var sharedProblemService: SharedProblemService
    @MockK
    private lateinit var sharedSubmissionService: SharedSubmissionService

    @InjectMockKs
    private lateinit var contestService: ContestService

    @Before
    fun setUp() = MockKAnnotations.init(this)

    // ソートなぞなぞコンテスト1,2を元に作成
    @Test
    fun testRatingCalculation0() {
        val contestInfo0 = ContestInfo("test0", "test0", "",
            Timestamp(System.currentTimeMillis()), Timestamp(System.currentTimeMillis()),
            0, 2800, ContestInfo.ContestType.ICPC, false, listOf()
        )
        val contestInfo1 = ContestInfo("test1", "test1", "",
            Timestamp(System.currentTimeMillis()), Timestamp(System.currentTimeMillis()),
            0, 800, ContestInfo.ContestType.ICPC, false, listOf()
        )
        val names0 = listOf("a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
            "k", "l", "m", "n", "o", "p", "q", "r", "s", "t")
        val names1 = listOf("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12")
        val ranking0 = names0.mapIndexed { index, name ->
            ContestRankingAccountInfo(name, 0, 0, listOf(), listOf(), index + 1)
        }
        val ranking1 = listOf(
            ContestRankingAccountInfo("1", 0, 0, listOf(), listOf(), 1),
            ContestRankingAccountInfo("2", 0, 0, listOf(), listOf(), 2),
            ContestRankingAccountInfo("3", 0, 0, listOf(), listOf(), 3),
            ContestRankingAccountInfo("q", 0, 0, listOf(), listOf(), 4),
            ContestRankingAccountInfo("a", 0, 0, listOf(), listOf(), 5),
            ContestRankingAccountInfo("h", 0, 0, listOf(), listOf(), 6),
            ContestRankingAccountInfo("t", 0, 0, listOf(), listOf(), 7),
            ContestRankingAccountInfo("4", 0, 0, listOf(), listOf(), 8),
            ContestRankingAccountInfo("g", 0, 0, listOf(), listOf(), 9),
            ContestRankingAccountInfo("5", 0, 0, listOf(), listOf(), 10),
            ContestRankingAccountInfo("6", 0, 0, listOf(), listOf(), 11),
            ContestRankingAccountInfo("7", 0, 0, listOf(), listOf(), 12),
            ContestRankingAccountInfo("8", 0, 0, listOf(), listOf(), 13),
            ContestRankingAccountInfo("9", 0, 0, listOf(), listOf(), 14),
            ContestRankingAccountInfo("k", 0, 0, listOf(), listOf(), 15),
            ContestRankingAccountInfo("10", 0, 0, listOf(), listOf(), 16),
            ContestRankingAccountInfo("j", 0, 0, listOf(), listOf(), 17),
            ContestRankingAccountInfo("11", 0, 0, listOf(), listOf(), 18),
            ContestRankingAccountInfo("d", 0, 0, listOf(), listOf(), 19),
            ContestRankingAccountInfo("12", 0, 0, listOf(), listOf(), 20)
        )
        names0.forEach {
            val account = AccountInfo(it, 0.0, 0.0, 0, "", "")
            every {
                sharedAccountService.getAccountByName(it)
            } returns account
            every {
                sharedAccountService.calcCorrectionRate(account)
            } returns calcCorrectionRateTestImpl(account)
        }
        names1.forEach {
            val account = AccountInfo(it, 0.0, 0.0, 0, "", "")
            every {
                sharedAccountService.getAccountByName(it)
            } returns account
            every {
                sharedAccountService.calcCorrectionRate(account)
            } returns calcCorrectionRateTestImpl(account)
        }
        every {
            sharedContestService.getContestRanking("test0", null, null)
        } returns
            RequestRanking(
                ranking0,
                listOf(),
                listOf(),
                20,
                null
            )
        every {
            sharedContestService.getContestRanking("test1", null, null)
        } returns
                RequestRanking(
                    ranking1,
                    listOf(),
                    listOf(),
                    20,
                    null
                )
        every {
            sharedAccountService.updateAccountRating(any(), any(), any(), any(), any())
        } returns Unit
        every {
            contestRepository.changeToEndCalcRating(any())
        } returns Unit
        every {
            sharedAccountService.calcCorrectionRate(any())
        } returns 0
        val result0 = contestService.updateRating(contestInfo0)
        result0.forEach {
            val account = AccountInfo(it.name, it.rating, it.innerRating, 1, "", "")
            every {
                sharedAccountService.getAccountByName(it.name)
            } returns account
            every {
                sharedAccountService.calcCorrectionRate(account)
            } returns calcCorrectionRateTestImpl(account)
        }
        val result1 = contestService.updateRating(contestInfo1)
        val resultCorrectionRate = listOf(147, 147, 147, 330, 740, 113, 74, 760, 42, 34,
        28, 24, 20, 561, 14, 598, 9, 905, 3)
        result1.forEachIndexed { index, it ->
            val account = AccountInfo(it.name, it.rating, it.innerRating,
                if (it.name.toIntOrNull() == null) 2 else 1, "", "")
            assertThat(resultCorrectionRate[index], `is`(calcCorrectionRateTestImpl(account)))
        }
    }
    private fun calcCorrectionRateTestImpl(account: AccountInfo): Int {
        if (account.partNum == 0) return 0
        val r = account.rating
        val p = account.partNum
        val minus = (sqrt(1 - 0.81.pow(p)) / (1 - 0.9.pow(p)) - 1) / (sqrt(19.0) - 1) * 1200
        val miRating = r - minus
        var ret = miRating
        if (miRating <= 400) {
            val diff = (400 - miRating) / 400
            ret = (400 * Math.E.pow(-diff))
        }
        return ret.toInt()
    }
}
