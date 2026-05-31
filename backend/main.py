from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, Quiz, QuizAttempt
from scraper import extract_wikipedia_content
from llm_quiz_generator import generate_quiz_from_text
from models import QuizRequest, SubmitQuizRequest
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
def generate_quiz(request: QuizRequest, db: Session = Depends(get_db)):
    # Clamp num_questions between 5 and 15
    num_q = max(5, min(15, request.num_questions))
    difficulty = request.difficulty.lower()
    if difficulty not in ("easy", "medium", "hard"):
        difficulty = "medium"

    text = extract_wikipedia_content(request.url)
    quiz = generate_quiz_from_text(text, difficulty=difficulty, num_questions=num_q)

    new_quiz = Quiz(
        url=request.url,
        title=getattr(quiz, "title", "Untitled Quiz"),
        scraped_content=text,
        full_quiz_data=json.dumps(quiz.model_dump()),
        difficulty_level=quiz.difficulty_level,
        num_questions=num_q,
    )

    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    return {
        "message": "Quiz generated successfully",
        "quiz_id": new_quiz.id,
        "quiz": quiz.model_dump(),
        "difficulty_level": new_quiz.difficulty_level,
    }


@app.post("/submit_quiz")
def submit_quiz(request: SubmitQuizRequest, db: Session = Depends(get_db)):
    quiz_row = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()
    if not quiz_row:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz_data = json.loads(quiz_row.full_quiz_data)
    questions = quiz_data.get("questions", [])

    results = []
    score = 0

    for idx, q in enumerate(questions):
        user_answer = request.answers.get(idx, "").strip().upper()
        correct_answer = q["answer"].strip().upper()

        # Extract just the letter if answer is like "A. Some text"
        if correct_answer and len(correct_answer) > 1:
            correct_answer = correct_answer[0]
        if user_answer and len(user_answer) > 1:
            user_answer = user_answer[0]

        is_correct = user_answer == correct_answer
        if is_correct:
            score += 1

        results.append({
            "question_index": idx,
            "question": q["question"],
            "options": q["options"],
            "user_answer": request.answers.get(idx, "Not answered"),
            "correct_answer": q["answer"],
            "explanation": q.get("explanation", ""),
            "is_correct": is_correct,
        })

    total = len(questions)
    percentage = round((score / total) * 100, 1) if total > 0 else 0

    attempt = QuizAttempt(
        quiz_id=request.quiz_id,
        score=score,
        total=total,
        result_data=json.dumps(results),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "quiz_id": request.quiz_id,
        "score": score,
        "total": total,
        "percentage": percentage,
        "results": results,
    }


@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).all()
    history = []
    for q in quizzes:
        # Get latest attempt for this quiz if any
        latest_attempt = (
            db.query(QuizAttempt)
            .filter(QuizAttempt.quiz_id == q.id)
            .order_by(QuizAttempt.date_attempted.desc())
            .first()
        )
        history.append({
            "id": q.id,
            "title": q.title,
            "url": q.url,
            "date": q.date_generated,
            "difficulty_level": q.difficulty_level,
            "num_questions": q.num_questions,
            "attempt": {
                "score": latest_attempt.score,
                "total": latest_attempt.total,
                "percentage": round((latest_attempt.score / latest_attempt.total) * 100, 1),
                "date": latest_attempt.date_attempted,
            } if latest_attempt else None,
        })
    return history


@app.get("/quiz/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return json.loads(quiz.full_quiz_data)


@app.get("/quiz/{quiz_id}/attempts")
def get_quiz_attempts(quiz_id: int, db: Session = Depends(get_db)):
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.quiz_id == quiz_id)
        .order_by(QuizAttempt.date_attempted.desc())
        .all()
    )
    return [
        {
            "attempt_id": a.id,
            "score": a.score,
            "total": a.total,
            "percentage": round((a.score / a.total) * 100, 1),
            "date": a.date_attempted,
            "results": json.loads(a.result_data),
        }
        for a in attempts
    ]
