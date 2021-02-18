CREATE TABLE ContestCreator(
    accountName  VARCHAR(20) NOT NULL,
    contestId  VARCHAR(20)   NOT NULL,
    position   VARCHAR(20)   NOT NULL,
    UNIQUE(accountName, contestId)
);