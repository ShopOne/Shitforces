import psycopg2
from random import randrange

conn = psycopg2.connect("dbname=db host=localhost port=5432 user=shop_one password=pass_pass")
cur = conn.cursor()


# accountInfo;
insert_str = "insert into accountInfo (name, passwordHash, permission) values ('creator', '$2a$10$jLSv.GbS0xvmQYc9ixQpjOJhLnxqJwPrsYsLGB9EZH9LamoBG0gOi', 'ADMINISTER');"
cur.execute(insert_str)
for i in range(100):
    insert_str = "insert into accountInfo (name, passwordHash, permission, rating, innerRating, partnum) values ('hoge{}', '$2a$10$jLSv.GbS0xvmQYc9ixQpjOJhLnxqJwPrsYsLGB9EZH9LamoBG0gOi', 'GENERAL', {}, {}, 1);".format(i, i * 10.5, i + 20.5)
    cur.execute(insert_str)

# contestInfo
insert_str = "insert into contestInfo (id, name, statement, startTime, endTime, contestType, ratedBound) values ('contest1', 'contest1', '説明文です', now(), now() + interval '30 days', 'AtCoder', 0);"
cur.execute(insert_str)

# problemInfo
insert_str = "insert into problemInfo (contestId, indexOfContest, point, statement) values ('contest1', 0, 1, 'ほげほげほげ');"
cur.execute(insert_str)
insert_str = "insert into problemInfo (contestId, indexOfContest, point, statement) values ('contest1', 1, 1, 'ほげほげほげ');"
cur.execute(insert_str)

# answerInfo
insert_str = "insert into answerInfo (id, answer) values (1, 'hogehoge');"
cur.execute(insert_str)
insert_str = "insert into answerInfo (id, answer) values (1, 'hogehoge');"
cur.execute(insert_str)

# contestCreator
insert_str = "insert into contestCreator (accountName, contestId, position) values ('hogehoge', 'creator', 'CORDINATOR');"
cur.execute(insert_str)

# submissionInfo
for i in range(100):
    if randrange(10) > 1:
        insert_str = "insert into submissionInfo (contestId, accountName, indexOfContest, result, statement, submitTime) values ('contest1', 'hoge{}', 0, 'ACCEPTED', 'hogehogehoge', now() + interval '{} hours');".format(i, randrange(700))
        cur.execute(insert_str)
    if randrange(10) > 1:
        insert_str = "insert into submissionInfo (contestId, accountName, indexOfContest, result, statement, submitTime) values ('contest1', 'hoge{}', 1, 'ACCEPTED', 'hogehogehoge', now() + interval '{} hours');".format(i, randrange(700))
        cur.execute(insert_str)



"""
for i in range(100):
    insert_str = "insert into accountInfo (name, passwordHash, permission, rating, innerRating, partNum) values ('hoge{}', '$2a$10$jLSv.GbS0xvmQYc9ixQpjOJhLnxqJwPrsYsLGB9EZH9LamoBG0gOi', 'GENERAL', {}, {}, 1);".format(i, (i + 1) * 100, (i + 2) * 100)
    cur.execute(insert_str)
for i in range(100):
    insert_str = "insert into contestInfo (id, name, statement, startTime, endTime, contestType, ratedBound) values ('contest{}', 'contest{}', '説明文です', now(), now() + interval '-{} days', 'AtCoder', 0);".format(i, i, i)
    cur.execute(insert_str)
"""

conn.commit()
cur.close()
conn.close()
