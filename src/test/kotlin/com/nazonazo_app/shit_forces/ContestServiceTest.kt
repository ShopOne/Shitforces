package com.nazonazo_app.shit_forces

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.contest.ContestInfo
import com.nazonazo_app.shit_forces.contest.SharedContestService
import com.nazonazo_app.shit_forces.contest.rating.SharedCalcRatingService
import com.nazonazo_app.shit_forces.contest.standings.AccountInfoOnContestStandings
import com.nazonazo_app.shit_forces.contest.standings.ContestStandingsInfo
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.junit.Before
import org.junit.Test
import org.springframework.boot.test.context.SpringBootTest
import java.sql.Timestamp

@SpringBootTest
class ContestServiceTest {
    @MockK
    private lateinit var sharedContestService: SharedContestService
    @MockK
    private lateinit var sharedAccountService: SharedAccountService
    @InjectMockKs
    private lateinit var sharedCalcRatingService: SharedCalcRatingService

    @Before
    fun setUp() = MockKAnnotations.init(this)

    // ソートなぞなぞコンテスト1,2を元に作成
    @Test
    fun testRatingCalculation0() {
        val contestInfo0 = ContestInfo(
            "test0", "test0", "",
            Timestamp(System.currentTimeMillis()), Timestamp(System.currentTimeMillis()),
            0, 2800, ContestInfo.ContestType.ICPC, false, listOf()
        )
        val contestInfo1 = ContestInfo(
            "test1", "test1", "",
            Timestamp(System.currentTimeMillis()), Timestamp(System.currentTimeMillis()),
            0, 800, ContestInfo.ContestType.ICPC, false, listOf()
        )
        val names0 = listOf(
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
            "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"
        )
        val names1 = listOf("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12")
        val ranking0 = names0.mapIndexed { index, name ->
            AccountInfoOnContestStandings(name, 0, 0, listOf(), listOf(), index + 1)
        }
        val ranking1 = listOf(
            AccountInfoOnContestStandings("1", 0, 0, listOf(), listOf(), 1),
            AccountInfoOnContestStandings("2", 0, 0, listOf(), listOf(), 2),
            AccountInfoOnContestStandings("3", 0, 0, listOf(), listOf(), 3),
            AccountInfoOnContestStandings("q", 0, 0, listOf(), listOf(), 4),
            AccountInfoOnContestStandings("a", 0, 0, listOf(), listOf(), 5),
            AccountInfoOnContestStandings("h", 0, 0, listOf(), listOf(), 6),
            AccountInfoOnContestStandings("t", 0, 0, listOf(), listOf(), 7),
            AccountInfoOnContestStandings("4", 0, 0, listOf(), listOf(), 8),
            AccountInfoOnContestStandings("g", 0, 0, listOf(), listOf(), 9),
            AccountInfoOnContestStandings("5", 0, 0, listOf(), listOf(), 10),
            AccountInfoOnContestStandings("6", 0, 0, listOf(), listOf(), 11),
            AccountInfoOnContestStandings("7", 0, 0, listOf(), listOf(), 12),
            AccountInfoOnContestStandings("8", 0, 0, listOf(), listOf(), 13),
            AccountInfoOnContestStandings("9", 0, 0, listOf(), listOf(), 14),
            AccountInfoOnContestStandings("k", 0, 0, listOf(), listOf(), 15),
            AccountInfoOnContestStandings("10", 0, 0, listOf(), listOf(), 16),
            AccountInfoOnContestStandings("j", 0, 0, listOf(), listOf(), 17),
            AccountInfoOnContestStandings("11", 0, 0, listOf(), listOf(), 18),
            AccountInfoOnContestStandings("d", 0, 0, listOf(), listOf(), 19),
            AccountInfoOnContestStandings("12", 0, 0, listOf(), listOf(), 20)
        )
        names0.forEach {
            val account = AccountInfo(
                it, 0.0, 0.0, 0, "", "",
                0, Timestamp(0)
            )
            every {
                sharedAccountService.getAccountByName(it)
            } returns account
        }
        names1.forEach {
            val account = AccountInfo(
                it, 0.0, 0.0, 0, "", "",
                0, Timestamp(0)
            )
            every {
                sharedAccountService.getAccountByName(it)
            } returns account
        }
        every {
            sharedContestService.getContestStandings("test0", null, null)
        } returns
            ContestStandingsInfo(
                ranking0,
                listOf(),
                listOf(),
                20,
                null
            )
        every {
            sharedContestService.getContestStandings("test1", null, null)
        } returns
            ContestStandingsInfo(
                ranking1,
                listOf(),
                listOf(),
                20,
                null
            )
        every {
            sharedAccountService.updateAccountRating(any(), any(), any(), any(), any(), any())
        } returns Unit
        val result0 = sharedCalcRatingService.calcAndUpdateRating(contestInfo0)
        result0.forEach {
            val account = AccountInfo(
                it.name, it.rating, it.innerRating, 1, "", "",
                0, Timestamp(0)
            )
            every {
                sharedAccountService.getAccountByName(it.name)
            } returns account
        }
        val result1 = sharedCalcRatingService.calcAndUpdateRating(contestInfo1)
        val resultCorrectionRate = listOf(
            147, 147, 147, 330, 740, 113, 74, 760, 42, 34,
            28, 24, 20, 561, 14, 598, 9, 905, 3
        )
        result1.forEachIndexed { index, it ->
            val account = AccountInfo(
                it.name, it.rating, it.innerRating,
                if (it.name.toIntOrNull() == null) 2 else 1, "", "",
                0, Timestamp(0)
            )
            assertThat(resultCorrectionRate[index], `is`(account.calcCorrectionRate()))
        }
    }
}
