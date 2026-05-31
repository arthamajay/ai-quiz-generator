from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Strip surrounding quotes and whitespace that may come from .env formatting
_raw_url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:admin@localhost:5432/ai_quiz_db")
DATABASE_URL = _raw_url.strip().strip('"').strip("'")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    date_generated = Column(DateTime, default=datetime.utcnow)
    scraped_content = Column(Text)
    full_quiz_data = Column(Text)
    difficulty_level = Column(Text)
    num_questions = Column(Integer, default=5)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    date_attempted = Column(DateTime, default=datetime.utcnow)
    score = Column(Integer, nullable=False)          # number of correct answers
    total = Column(Integer, nullable=False)          # total questions
    result_data = Column(Text, nullable=False)       # JSON: per-question correct/wrong


Base.metadata.create_all(bind=engine)
