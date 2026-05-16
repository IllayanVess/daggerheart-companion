-- Consumable lookup table for Daggerheart inventory content

CREATE TABLE IF NOT EXISTS Consumables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    subcategory TEXT,
    description_text TEXT NOT NULL,
    source_url TEXT
);
