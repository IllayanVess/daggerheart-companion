#!/usr/bin/env python3
import sqlite3
import glob
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(here, 'daggerheart.db')

if os.path.exists(db_path):
    print('Existing database found at', db_path)
    print('Backing up to', db_path + '.bak')
    try:
        os.replace(db_path, db_path + '.bak')
    except Exception as e:
        print('Backup failed:', e)
        sys.exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

sql_files = sorted(glob.glob(os.path.join(here, '*.sql')))
for f in sql_files:
    name = os.path.basename(f)
    print('Parsing', name)
    try:
        if name.lower() == 'init.sql':
            print('Skipping sqlite shell helper file', name)
            continue

        with open(f, 'r', encoding='utf-8') as fh:
            sql_text = fh.read()

        sanitized_lines = []
        for line in sql_text.splitlines():
            if line.lstrip().startswith('.read'):
                continue
            sanitized_lines.append(line)

        sanitized_sql = '\n'.join(sanitized_lines).strip()
        if not sanitized_sql:
            print('No executable SQL found in', name, '- skipping')
            continue

        try:
            cur.executescript(sanitized_sql)
        except Exception as e:
            print('Error executing SQL from', name, ':', e)
            conn.close()
            sys.exit(1)

    except Exception as e:
        print('Error parsing', name, ':', e)
        conn.close()
        sys.exit(1)

conn.commit()
conn.close()
print('Created database:', db_path)
