from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, Quiz 
from scraper import extract_wikipedia_content
from llm_quiz_generator import generate_quiz_from_text
import json
from pydantic import BaseModel, EmailStr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WikiRequest(BaseModel):
    url: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "AI Wiki Quiz Generator Backend ✅"}

@app.post("/generate_quiz")
def generate_quiz(request: WikiRequest, db: Session = Depends(get_db)):
    text = extract_wikipedia_content(request.url)
    quiz = generate_quiz_from_text(text)
    new_quiz = Quiz(
        url=request.url,
        title=getattr(quiz, "title", "Untitled Quiz"),
        scraped_content=text,
        full_quiz_data=json.dumps(quiz.model_dump()),
        difficulty_level=quiz.difficulty_level
    )

    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    return {
        "message": "Quiz generated successfully",
        "quiz_id": new_quiz.id,
        "quiz": quiz.model_dump() ,
        "difficulty_level":new_quiz.difficulty_level
    }

@app.get("/history")
def get_history():
    session = SessionLocal()
    quizzes = session.query(Quiz).all()
    session.close()
    return [{"id": q.id, "title": q.title, "url": q.url, "date": q.date_generated,"difficulty_level":q.difficulty_level} for q in quizzes]

@app.get("/quiz/{quiz_id}")
def get_quiz(quiz_id: int):
    session = SessionLocal()
    quiz = session.query(Quiz).filter(Quiz.id == quiz_id).first()
    session.close()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return json.loads(quiz.full_quiz_data)
