#!/usr/bin/env python3
import sqlite3
import glob
import os
import sys
from datetime import datetime

here = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(here, 'daggerheart.db')

# ===== SAFETY ADDITION =====
def has_characters(db_path):
    """Check if database has any characters"""
    if not os.path.exists(db_path):
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        # Check if characters table exists
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='characters'")
        if cur.fetchone():
            cur.execute("SELECT COUNT(*) FROM characters")
            count = cur.fetchone()[0]
            conn.close()
            return count > 0
        conn.close()
    except Exception:
        pass
    return False

# Check for existing characters
has_chars = has_characters(db_path)

if has_chars:
    print("⚠️  WARNING: Database contains existing characters!")
    print("This script will BACKUP and then REPLACE your database.")
    print("Your characters will be moved to the .bak file.")
    print()
    response = input("Type 'BACKUP' to continue and backup characters, or 'CANCEL' to abort: ")
    
    if response.upper() == 'CANCEL':
        print("Operation cancelled. Your database is unchanged.")
        sys.exit(0)
    elif response.upper() == 'BACKUP':
        # Create timestamped backup instead of overwriting
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{db_path}.backup_{timestamp}"
        print(f"Creating safety backup at: {backup_path}")
        import shutil
        shutil.copy2(db_path, backup_path)
        print("Backup created. Proceeding with database rebuild...")
        
        # Ask if they want to proceed
        confirm = input("Delete current database and create fresh one? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Cancelled.")
            sys.exit(0)
        
        # Now delete the old database
        os.remove(db_path)
    else:
        print("Invalid response. Cancelled.")
        sys.exit(0)

# If we get here, either no characters exist OR user confirmed
if os.path.exists(db_path):
    print('Existing database found at', db_path)
    print('Backing up to', db_path + '.bak')
    try:
        os.replace(db_path, db_path + '.bak')
    except Exception as e:
        print('Backup failed:', e)
        sys.exit(1)

# Rest of your existing script continues...
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