CREATE TABLE IF NOT EXISTS favHistory(
    accountName  VARCHAR(20) NOT NULL,
    problemId SERIAL,
    UNIQUE(accountName, problemId)
);
