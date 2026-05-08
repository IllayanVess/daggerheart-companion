-- Domain cards table for Daggerheart character creator

CREATE TABLE IF NOT EXISTS DomainCards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_name TEXT NOT NULL UNIQUE,
    domain_name TEXT NOT NULL,
    card_level INTEGER NOT NULL,
    card_type TEXT NOT NULL,
    recall_cost INTEGER,
    card_text TEXT NOT NULL,
    source_url TEXT
);
