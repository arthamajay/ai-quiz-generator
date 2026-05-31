from pydantic import BaseModel
from typing import List

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