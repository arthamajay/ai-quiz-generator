from pydantic import BaseModel
from typing import List, Dict

class Question(BaseModel):
    question: str
    options: List[str]
    answer: str
    explanation: str

class QuizOutput(BaseModel):
    title: str
    summary: str
    difficulty_level: str
    related_topics: List[str]
    questions: List[Question]

class QuizRequest(BaseModel):
    url: str
    difficulty: str = "medium"       # easy | medium | hard
    num_questions: int = 5           # 5–15

class SubmitQuizRequest(BaseModel):
    quiz_id: int
    answers: Dict[int, str]          # { question_index: selected_option }
