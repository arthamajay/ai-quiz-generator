"""
migrate.py
----------
Run this ONCE to bring the existing database schema up to date.

What it does:
  1. Adds `num_questions` column to the `quizzes` table (if it doesn't exist).
  2. Creates the `quiz_attempts` table (if it doesn't exist).

Usage:
    python migrate.py
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:admin@localhost:5432/ai_quiz_db")
DATABASE_URL = _raw_url.strip().strip('"').strip("'")

engine = create_engine(DATABASE_URL)

MIGRATIONS = [
    # 1. Add num_questions to quizzes (safe – does nothing if column already exists)
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'quizzes' AND column_name = 'num_questions'
        ) THEN
            ALTER TABLE quizzes ADD COLUMN num_questions INTEGER DEFAULT 5;
            RAISE NOTICE 'Added num_questions column to quizzes';
        ELSE
            RAISE NOTICE 'num_questions already exists – skipping';
        END IF;
    END
    $$;
    """,

    # 2. Create quiz_attempts table (safe – does nothing if it already exists)
    """
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id              SERIAL PRIMARY KEY,
        quiz_id         INTEGER NOT NULL REFERENCES quizzes(id),
        date_attempted  TIMESTAMP DEFAULT NOW(),
        score           INTEGER NOT NULL,
        total           INTEGER NOT NULL,
        result_data     TEXT    NOT NULL
    );
    """,
]

def run_migrations():
    with engine.connect() as conn:
        for i, sql in enumerate(MIGRATIONS, 1):
            print(f"Running migration {i}...")
            conn.execute(text(sql))
            conn.commit()
            print(f"  Migration {i} done.")
    print("\n✅ All migrations applied successfully.")

if __name__ == "__main__":
    run_migrations()
