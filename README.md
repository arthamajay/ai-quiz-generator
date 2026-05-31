# AI Wiki Quiz Generator

A full-stack web app that generates interactive quizzes from any Wikipedia article using Google Gemini AI. Paste a Wikipedia URL, pick your difficulty and question count, take the quiz, and track your results over time.

---

## Features

- **Wikipedia-powered content** — paste any Wikipedia URL and the app extracts the full article text using the Wikipedia REST API with an HTML scrape fallback
- **Customizable quiz generation** — choose difficulty (Easy / Medium / Hard) and number of questions (5–15) before generating
- **Interactive quiz mode** — select answers for each question, submit when done, and get instant color-coded feedback (green = correct, red = wrong) with explanations
- **Score tracking** — every attempt is saved with score, percentage, and per-question results
- **Quiz history** — browse all previously generated quizzes in a table with difficulty badge and best score; click View to review any past attempt in a modal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Database | PostgreSQL + SQLAlchemy |
| LLM | Google Gemini 2.5 Flash via LangChain |
| Scraping | Wikipedia REST API + BeautifulSoup fallback |
| Frontend | React (Vite) + Bootstrap 5 |
| Env config | python-dotenv |

---

## Project Structure

```
ai-quiz-generator/
├── backend/
│   ├── main.py                 # FastAPI routes
│   ├── database.py             # SQLAlchemy models & DB connection
│   ├── models.py               # Pydantic request/response models
│   ├── llm_quiz_generator.py   # Gemini + LangChain quiz generation
│   ├── scraper.py              # Wikipedia content extractor
│   ├── migrate.py              # One-time DB migration script
│   ├── requirements.txt
│   └── .env                    # API keys and DB URL (not committed)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── QuizDisplay.jsx # Interactive quiz + results view
│       │   └── Modal.jsx
│       ├── tabs/
│       │   ├── GenerateQuizTab.jsx
│       │   └── HistoryTab.jsx
│       └── services/
│           └── api.js          # All fetch calls to the backend
└── README.md
```

---

## Database Schema

### `quizzes`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment ID |
| url | VARCHAR | Wikipedia URL |
| title | VARCHAR | Quiz title from LLM |
| date_generated | TIMESTAMP | When the quiz was created |
| scraped_content | TEXT | Raw article text |
| full_quiz_data | TEXT (JSON) | Full quiz object from Gemini |
| difficulty_level | TEXT | easy / medium / hard |
| num_questions | INTEGER | Number of questions (5–15) |

### `quiz_attempts`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment ID |
| quiz_id | INTEGER FK | References quizzes.id |
| date_attempted | TIMESTAMP | When the attempt was made |
| score | INTEGER | Number of correct answers |
| total | INTEGER | Total questions |
| result_data | TEXT (JSON) | Per-question correct/wrong detail |

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally
- Google Gemini API key — get one at [aistudio.google.com](https://aistudio.google.com)

### Backend

```bash
# 1. Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux / Mac

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Create backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/ai_quiz_db

# 4. Create the database in PostgreSQL
# (run in psql or pgAdmin)
CREATE DATABASE ai_quiz_db;

# 5. Run migrations (creates tables / adds new columns)
python backend/migrate.py

# 6. Start the backend
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### `POST /generate_quiz`
Generate a quiz from a Wikipedia article.

**Request body:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Narendra_Modi",
  "difficulty": "medium",
  "num_questions": 10
}
```

**Response:**
```json
{
  "message": "Quiz generated successfully",
  "quiz_id": 1,
  "quiz": { "title": "...", "questions": [...] },
  "difficulty_level": "medium"
}
```

---

### `POST /submit_quiz`
Submit answers and get scored results.

**Request body:**
```json
{
  "quiz_id": 1,
  "answers": { "0": "A", "1": "C", "2": "B" }
}
```

**Response:**
```json
{
  "attempt_id": 1,
  "score": 8,
  "total": 10,
  "percentage": 80.0,
  "results": [...]
}
```

---

### `GET /history`
Returns all quizzes with latest attempt score.

### `GET /quiz/{quiz_id}`
Returns full quiz data for a specific quiz.

### `GET /quiz/{quiz_id}/attempts`
Returns all attempts for a quiz with per-question results.

---

## Notes

- Wikipedia URLs must be in the format `https://en.wikipedia.org/wiki/Article_Name`
- The scraper uses the Wikipedia REST API (`/api/rest_v1/page/mobile-sections`) as the primary method, which reliably handles all pages including those with JS-rendered content
- `migrate.py` is safe to re-run — it uses `IF NOT EXISTS` checks so it won't break existing data

---

## License

MIT
