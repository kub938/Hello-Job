create table schedule_status
(
    schedule_status_id   int auto_increment
        primary key,
    schedule_status_name varchar(255)                            null,
    schedule_status_step enum ('DONE', 'IN_PROGRESS', 'PENDING') null
);

INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (1, '서류작성전', 'PENDING');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (2, '서류작성중', 'PENDING');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (3, '미제출', 'PENDING');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (4, '서류제출', 'IN_PROGRESS');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (5, '서류합격', 'IN_PROGRESS');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (6, '1차합격', 'IN_PROGRESS');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (7, '2차합격', 'IN_PROGRESS');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (8, '3차합격', 'IN_PROGRESS');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (9, '진행중', 'IN_PROGRESS');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (10, '최종합격', 'DONE');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (11, '최종탈락', 'DONE');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (12, '서류탈락', 'DONE');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (13, '1차탈락', 'DONE');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (14, '2차탈락', 'DONE');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (15, '3차탈락', 'DONE');
INSERT INTO hellojob.schedule_status (schedule_status_id, schedule_status_name, schedule_status_step) VALUES (16, '전형종료', 'DONE');
