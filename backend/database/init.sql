-- init.sql: runner that ensures foreign keys are enabled and applies schema files in order
PRAGMA foreign_keys = ON;
.read Classes.sql
.read Heritage.sql


