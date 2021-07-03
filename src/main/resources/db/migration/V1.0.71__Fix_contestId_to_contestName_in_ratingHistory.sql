UPDATE accountratingchangehistory SET contestId = contestInfo.name from contestinfo
    WHERE contestid = contestInfo.id;
ALTER TABLE accountratingchangehistory RENAME COLUMN contestId to contestName;
