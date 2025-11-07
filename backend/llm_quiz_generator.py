import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models import QuizOutput
from dotenv import load_dotenv

load_dotenv()

def generate_quiz_from_text(article_text: str):
    # Initialize Pydantic output parser
    parser = PydanticOutputParser(pydantic_object=QuizOutput)

    # Initialize Google Gemini model
    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=os.getenv("GEMINI_API_KEY")
    )

    # Define the prompt template
    prompt = PromptTemplate(
        template=(
            "You are an AI quiz generator. Given the following Wikipedia article text, generate a quiz.\n\n"
            "Requirements:\n"
            "1. Create 5-10 questions.\n"
            "2. Each question must have 4 options labeled A, B, C, D.\n"
            "3. Indicate the correct option explicitly in a field called 'answer'.\n"
            "4. Provide a brief explanation for the answer in 'explanation'.\n"
            "5. Assign a difficulty: 'easy', 'medium', or 'hard'.\n"
            "6. Suggest 2-3 related Wikipedia topics in 'related_topics'.\n\n"
            "Return the quiz as strict JSON following this schema:\n"
            "{format_instructions}\n\n"
            "Wikipedia article text:\n{article}"
        ),
        input_variables=["article"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )

    # Create the chain: prompt -> model -> parser
    chain = prompt | model | parser

    # Invoke the chain with the article text
    return chain.invoke({"article": article_text})
