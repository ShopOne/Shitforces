CREATE TABLE IF NOT EXISTS contestInfo
(
    shortName   VARCHAR(20) PRIMARY KEY,
    name        VARCHAR(30)  NOT NULL,
    statement   VARCHAR(500) NOT NULL,
    startTime   TIMESTAMP    NOT NULL,
    endTime     TIMESTAMP    NOT NULL,
    contestType VARCHAR(20)  NOT NULL,
    ratedBound  INT          NOT NULL DEFAULT -1,
    penalty     INT                   DEFAULT 0,
    UNIQUE (name)

);
CREATE TABLE IF NOT EXISTS accountInfo
(
    name            VARCHAR(20)     PRIMARY KEY,
    rating	        INT             NOT NULL DEFAULT 0,
    innerRating     INT             NOT NULL DEFAULT 0,
    partNum         INT             NOT NULL DEFAULT 0,
    passwordHash    VARCHAR         NOT NULL,
    permission      VARCHAR(15)
);
CREATE TABLE IF NOT EXISTS accountRatingChangeHistory
(
    accountName             VARCHAR(20)  NOT NULL,
    contestName             VARCHAR(30)  NOT NULL,
    indexOfParticipation    INT          NOT NULL,
    newRating               INT          NOT NULL,
    prevRating              INT          NOT NULL,
    performance             INT          NOT NULL
);
CREATE TABLE IF NOT EXISTS sessionData
(
    name            VARCHAR(20)     PRIMARY KEY,
    sessionId       VARCHAR(80)     NOT NULL,
    expirationDate  TIMESTAMP       NOT NULL
);

CREATE TABLE IF NOT EXISTS problemInfo
(
    id              SERIAL    PRIMARY KEY,
    contestName     VARCHAR(30),
    indexOfContest  INT,
    point           INT,
    statement       VARCHAR(500),
    UNIQUE(contestName, indexOfContest)
);

CREATE TABLE IF NOT EXISTS answerInfo
(
    id      INT             NOT NULL,
    answer  VARCHAR(200)    NOT NULL
);
CREATE TABLE IF NOT EXISTS submissionInfo
(
    id              SERIAL PRIMARY KEY ,
    contestName     VARCHAR(30)     NOT NULL,
    accountName     VARCHAR(20)     NOT NULL,
    indexOfContest  INT             NOT NULL,
    result          VARCHAR(50)     NOT NULL,
    statement       VARCHAR(200)    NOT NULL,
    submitTime      TIMESTAMP       NOT NULL
);