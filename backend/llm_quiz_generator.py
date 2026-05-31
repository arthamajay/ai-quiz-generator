import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models import QuizOutput
from dotenv import load_dotenv

load_dotenv()


def generate_quiz_from_text(article_text: str, difficulty: str = "medium", num_questions: int = 5) -> QuizOutput:
    parser = PydanticOutputParser(pydantic_object=QuizOutput)

    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=os.getenv("GEMINI_API_KEY")
    )

    prompt = PromptTemplate(
        template=(
            "You are an AI quiz generator. Given the following Wikipedia article text, generate a quiz.\n\n"
            "Requirements:\n"
            "1. Create exactly {num_questions} questions — no more, no less.\n"
            "2. The difficulty level of ALL questions must be '{difficulty}' "
            "(easy = basic recall, medium = understanding, hard = analysis/application).\n"
            "3. Each question must have exactly 4 options labeled A, B, C, D.\n"
            "4. Indicate the correct option explicitly in the 'answer' field (e.g. 'A').\n"
            "5. Provide a brief explanation for the answer in the 'explanation' field.\n"
            "6. Set 'difficulty_level' in the output to '{difficulty}'.\n"
            "7. Suggest 2-3 related Wikipedia topics in 'related_topics'.\n\n"
            "Return the quiz as strict JSON following this schema:\n"
            "{format_instructions}\n\n"
            "Wikipedia article text:\n{article}"
        ),
        input_variables=["article", "difficulty", "num_questions"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )

    chain = prompt | model | parser

    return chain.invoke({
        "article": article_text,
        "difficulty": difficulty,
        "num_questions": num_questions
    })
