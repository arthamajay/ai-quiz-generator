import { useState } from "react";
import { generateQuiz } from "../services/api";
import QuizDisplay from "../components/QuizDisplay";

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

const DIFFICULTY_COLORS = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

export default function GenerateQuizTab() {
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState(null); // { quiz, quiz_id }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate it's a Wikipedia URL
    if (!url.includes("wikipedia.org/wiki/")) {
      setError("Please enter a valid Wikipedia URL (e.g. https://en.wikipedia.org/wiki/Narendra_Modi)");
      return;
    }

    setLoading(true);
    setError("");
    setQuizData(null);
    try {
      const result = await generateQuiz(url, difficulty, numQuestions);
      setQuizData({ quiz: result.quiz, quiz_id: result.quiz_id });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="mb-4" onSubmit={handleSubmit}>
        {/* Wikipedia URL */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Wikipedia URL</label>
          <input
            type="url"
            className="form-control"
            placeholder="https://en.wikipedia.org/wiki/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="row g-3 mb-3">
          {/* Difficulty */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Difficulty Level</label>
            <div className="d-flex gap-2">
              {DIFFICULTY_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`btn btn-${
                    difficulty === level
                      ? DIFFICULTY_COLORS[level]
                      : "outline-secondary"
                  } text-capitalize flex-fill`}
                  onClick={() => setDifficulty(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <br />

          {/* Number of Questions */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Number of Questions:{" "}
              <span className="badge bg-primary">{numQuestions}</span>
            </label>
            <input
              type="range"
              className="form-range"
              min={5}
              max={15}
              step={1}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
            <div className="d-flex justify-content-between">
              <small className="text-muted">5</small>
              <small className="text-muted">15</small>
            </div>
          </div>
        </div>

        <button className="btn btn-primary px-4" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Generating...
            </>
          ) : (
            "Generate Quiz"
          )}
        </button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status" />
          <p className="text-muted">Generating your quiz, this may take up to 30 seconds...</p>
        </div>
      )}

      {!loading && quizData && (
        <QuizDisplay
          quiz={quizData.quiz}
          quizId={quizData.quiz_id}
          interactive={true}
        />
      )}
    </div>
  );
}
