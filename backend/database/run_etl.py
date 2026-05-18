import psycopg2
from pathlib import Path
import pandas as pd
from io import StringIO

# --------------------------------------------------
# CONFIG
# --------------------------------------------------
DB_NAME = "companion"

DB_CONFIG = {
    "host": "localhost",
    "database": "postgres",  # connect to default DB first
    #    "user": "my_user",
    #    "password": "my_password",
    "port": 5432,
}

DATA_DIR = Path("data")
SCHEMA_FILE = Path("schema.sql")

# --------------------------------------------------
# 1. CREATE DATABASE (IF NOT EXISTS)
# --------------------------------------------------
print("🧱 Checking database...")

conn = psycopg2.connect(**DB_CONFIG)
conn.autocommit = True
cursor = conn.cursor()

cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
exists = cursor.fetchone()

if not exists:
    cursor.execute(f"CREATE DATABASE {DB_NAME}")
    print(f"✅ Database '{DB_NAME}' created")
else:
    print(f"ℹ️ Database '{DB_NAME}' already exists")

cursor.close()
conn.close()

# --------------------------------------------------
# 2. CONNECT TO YOUR TARGET DB
# --------------------------------------------------
DB_CONFIG["database"] = DB_NAME

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# --------------------------------------------------
# 3. CREATE SCHEMA (ALL TABLES)
# --------------------------------------------------
print("\n📦 Creating schema...")

schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
print(schema_sql)
cur.execute(schema_sql)
conn.commit()

print("✅ Schema created")

# --------------------------------------------------
# 4. LOAD ALL CSV FILES
# --------------------------------------------------
print("\n📥 Loading CSV files...\n")

for csv_file in DATA_DIR.glob("*.csv"):
    table_name = csv_file.stem

    print(f"➡️ Loading {csv_file.name} → {table_name}")

    df = pd.read_csv(csv_file, sep=";")

    # clean column names
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace(r"[^a-z0-9_]", "", regex=True)
    )

    # truncate table before reload
    cur.execute(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;")
    conn.commit()

    # COPY (fast insert)
    buffer = StringIO()
    df.to_csv(buffer, index=False, header=False)
    buffer.seek(0)

    copy_sql = f"""
    COPY {table_name} ({", ".join(df.columns)})
    FROM STDIN WITH CSV
    """

    cur.copy_expert(copy_sql, buffer)
    conn.commit()

    print(f"✅ Inserted {len(df)} rows into {table_name}\n")

# --------------------------------------------------
# 5. CHECK TABLES
# --------------------------------------------------
print("🔍 Row counts:\n")

cur.execute("""
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
""")

tables = [t[0] for t in cur.fetchall()]

for table in tables:
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    count = cur.fetchone()[0]
    print(f"📊 {table}: {count} rows")

# --------------------------------------------------
# 6. CLEANUP
# --------------------------------------------------
cur.close()
conn.close()

print("\n🎉 ETL COMPLETE")
