-- Equipment tables for Daggerheart character creator

CREATE TABLE IF NOT EXISTS Equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    subcategory TEXT,
    tier INTEGER,
    trait_name TEXT,
    range_name TEXT,
    damage_text TEXT,
    damage_type TEXT,
    burden TEXT,
    thresholds_major INTEGER,
    thresholds_severe INTEGER,
    base_score INTEGER,
    feature_text TEXT,
    description_text TEXT NOT NULL,
    source_url TEXT
);
