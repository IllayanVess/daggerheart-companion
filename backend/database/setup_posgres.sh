initdb -D ./postgresql
pg_ctl -D ./postgresql -l logfile start
psql postgres
