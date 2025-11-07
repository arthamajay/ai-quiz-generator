from pydantic import BaseModel
from typing import List, Dict, Any

class Question(BaseModel):
    question: str
    options: List[str]
    answer: str

class QuizOutput(BaseModel):
    title: str
    summary: str
    questions: List[Question]
    difficulty_level:str

class QuizRequest(BaseModel):
    url: str
