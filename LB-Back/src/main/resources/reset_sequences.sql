-- PostgreSQL: 자동증가 ID(IDENTITY) 시퀀스를 각 테이블의 MAX(id)로 맞춤
-- 데이터 이관/수동 INSERT 후 실행 시, 다음 INSERT 시 PK 충돌 방지
SELECT setval(pg_get_serial_sequence('auth_user', 'id'), (SELECT COALESCE(MAX(id), 0) FROM auth_user));
SELECT setval(pg_get_serial_sequence('club', 'id'), (SELECT COALESCE(MAX(id), 0) FROM club));
SELECT setval(pg_get_serial_sequence('board', 'id'), (SELECT COALESCE(MAX(id), 0) FROM board));
SELECT setval(pg_get_serial_sequence('meal_item', 'id'), (SELECT COALESCE(MAX(id), 0) FROM meal_item));
SELECT setval(pg_get_serial_sequence('meal', 'id'), (SELECT COALESCE(MAX(id), 0) FROM meal));
SELECT setval(pg_get_serial_sequence('comment', 'id'), (SELECT COALESCE(MAX(id), 0) FROM comment));
SELECT setval(pg_get_serial_sequence('club_member', 'id'), (SELECT COALESCE(MAX(id), 0) FROM club_member));
SELECT setval(pg_get_serial_sequence('diet_log', 'id'), (SELECT COALESCE(MAX(id), 0) FROM diet_log));
SELECT setval(pg_get_serial_sequence('file', 'id'), (SELECT COALESCE(MAX(id), 0) FROM file));
SELECT setval(pg_get_serial_sequence('exercise', 'id'), (SELECT COALESCE(MAX(id), 0) FROM exercise));