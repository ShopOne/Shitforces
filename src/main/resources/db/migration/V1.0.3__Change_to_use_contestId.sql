ALTER TABLE contestInfo RENAME COLUMN shortName TO id;
ALTER TABLE submissionInfo RENAME COLUMN contestName TO contestId;
ALTER TABLE accountratingchangehistory RENAME COLUMN contestname to contestId;
ALTER TABLE problemInfo RENAME COLUMN contestName TO contestId;
UPDATE submissionInfo SET contestId = contestInfo.id from contestInfo
    where submissionInfo.contestId = contestInfo.name;
UPDATE problemInfo SET contestId = contestInfo.id from contestInfo
    where problemInfo.contestId = contestInfo.name;
UPDATE accountratingchangehistory SET contestId = contestInfo.id from contestInfo
    where accountratingchangehistory.contestId = contestInfo.name;
