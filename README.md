# AI Wiki Quiz Generator

## Overview

**AI Wiki Quiz Generator** is a full-stack application that allows users to generate quizzes from Wikipedia articles. Users can enter a Wikipedia URL, and the system will scrape the article, generate quiz questions using a Large Language Model (LLM), and display them in a clean, interactive frontend.  

The system also maintains a **history** of past quizzes for review.

---

## Features

### Generate Quiz
- Enter a Wikipedia article URL.
- Scrapes article content using **BeautifulSoup**.
- Generates 5–10 multiple-choice questions with:
  - Question text
  - 4 options (A-D)
  - Correct answer
  - Short explanation
  - Difficulty level (easy, medium, hard)
  - Suggested related Wikipedia topics
- Stores generated data in **MySQL/PostgreSQL**.
- Displays quiz in structured, card-based layout.

### Take Quiz Mode
- User can attempt the quiz.
- Select answers for each question.
- Submit to see score and correct answers.
- Option to retry or generate a new quiz.

### Quiz History
- Table view of previously generated quizzes.
- Click **Details** to view full quiz in a modal.

---

## Tech Stack

- **Backend:** Python, FastAPI / Django
- **Database:** MySQL / PostgreSQL
- **Frontend:** React with Bootstrap
- **LLM:** Gemini API via LangChain
- **Scraping:** BeautifulSoup
- **Other:** dotenv for environment variables

---

## Project Structure

```
ai-quiz-generator/
├── backend/                  # Python backend code
│   ├── main.py               # FastAPI app
│   ├── database.py           # Database setup
│   ├── models.py             # SQLAlchemy / Django models
│   ├── quiz_generator.py     # LLM quiz logic
│   └── requirements.txt
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components (QuizDisplay, Modal, etc.)
│   │   ├── tabs/             # GenerateQuizTab, HistoryTab
│   │   ├── services/         # API service calls
│   │   └── index.js
│   ├── package.json
│   └── public/
└── README.md
```

---

## Setup Instructions

### Backend

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the environment:

- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set environment variables in `.env`:

```
GEMINI_API_KEY=<your_gemini_api_key>
DATABASE_URL=<your_db_url>
```

5. Run the backend:

```bash
uvicorn main:app --reload
```

---

### Frontend

1. Navigate to frontend:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

4. Open in browser at: `http://localhost:5173`

---

## API Endpoints

### Generate Quiz

- **POST** `/genrate_quiz`
- **Body:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Alan_Turing"
}
```
- **Response:**
```json
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Alan_Turing",
  "title": "Alan Turing",
  "summary": "...",
  "quiz": [...],
  "related_topics": ["Cryptography", "Computer Science"]
}
```

### Fetch Quiz History

- **GET** `/history`
- Returns all previously generated quizzes.

- **GET** `/quiz/{quiz_id}`
- Returns full quiz data for a specific ID.

---

## Notes

- Only HTML scraping is used; Wikipedia API is **not used**.
- Duplicate URLs are cached to prevent repeated API calls.
- Quiz difficulty and related topics are generated using **LangChain prompt templates**.

---

## Optional / Bonus Features

- Take Quiz Mode with score calculation
- Retry quiz / generate new quiz without page reload
- Section-wise question grouping in UI
- Display related topics and explanation after submission

---

## Screenshots

1. **Generate Quiz Page**  
![Generate Quiz](screenshots/generate_quiz.png)

2. **Quiz History**  
![History](screenshots/history.png)

3. **Quiz Details Modal**  
![Details](screenshots/details_modal.png)

---

## License

MIT L