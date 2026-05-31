import { useState } from "react";
import { submitQuiz } from "../services/api";

const DIFFICULTY_BADGE = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

// Extract just the letter (A/B/C/D) from an answer string like "A. Some text" or "A"
function extractLetter(str = "") {
  return str.trim().charAt(0).toUpperCase();
}

export default function QuizDisplay({ quiz, quizId, interactive = false }) {
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { index: "A" }
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const diffColor = DIFFICULTY_BADGE[quiz.difficulty_level?.toLowerCase()] || "secondary";
  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  const handleSelect = (qIdx, optionLetter) => {
    if (result) return; // locked after submission
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optionLetter }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await submitQuiz(quizId, selectedAnswers);
      setResult(res);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setResult(null);
    setSubmitError("");
  };

  return (
    <div className="card mb-4 shadow-sm">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{quiz.title}</h5>
        <span className={`badge bg-${diffColor} text-capitalize`}>
          {quiz.difficulty_level}
        </span>
      </div>

      {/* Summary */}
      {quiz.summary && (
        <div className="card-body pb-0">
          <p className="text-muted small">{quiz.summary}</p>
        </div>
      )}

      {/* Score banner after submission */}
      {result && (
        <div
          className={`mx-3 mt-3 alert ${
            result.percentage >= 70 ? "alert-success" : "alert-warning"
          } d-flex justify-content-between align-items-center`}
        >
          <div>
            <strong>
              Score: {result.score} / {result.total}
            </strong>{" "}
            &nbsp;({result.percentage}%)
          </div>
          {interactive && (
            <button className="btn btn-sm btn-outline-secondary" onClick={handleRetry}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="card-body">
        {questions.map((q, idx) => {
          const resultItem = result?.results?.[idx];
          const userLetter = selectedAnswers[idx];
          const correctLetter = extractLetter(q.answer);

          return (
            <div
              key={idx}
              className={`mb-4 p-3 rounded border ${
                resultItem
                  ? resultItem.is_correct
                    ? "border-success bg-success bg-opacity-10"
                    : "border-danger bg-danger bg-opacity-10"
                  : "border-light"
              }`}
            >
              <p className="fw-semibold mb-2">
                Q{idx + 1}: {q.question}
              </p>

              <div className="d-flex flex-column gap-2">
                {q.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i); // A, B, C, D
                  const isSelected = userLetter === letter;
                  const isCorrect = letter === correctLetter;

                  let btnVariant = "outline-secondary";
                  if (result) {
                    if (isCorrect) btnVariant = "success";
                    else if (isSelected && !isCorrect) btnVariant = "danger";
                  } else if (isSelected) {
                    btnVariant = "primary";
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      className={`btn btn-${btnVariant} text-start`}
                      onClick={() => handleSelect(idx, letter)}
                      disabled={!!result}
                    >
                      {opt}
                      {result && isCorrect && (
                        <span className="ms-2">✓</span>
                      )}
                      {result && isSelected && !isCorrect && (
                        <span className="ms-2">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation shown after submit */}
              {result && q.explanation && (
                <div className="mt-2 p-2 bg-light rounded small text-dark">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit button — only in interactive mode before submission */}
        {interactive && !result && (
          <div className="d-flex align-items-center gap-3 mt-2">
            <button
              className="btn btn-success px-4"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </button>
            {!allAnswered && (
              <small className="text-muted">
                {questions.length - Object.keys(selectedAnswers).length} question(s) remaining
              </small>
            )}
          </div>
        )}

        {submitError && (
          <div className="alert alert-danger mt-3">{submitError}</div>
        )}

        {/* Related topics */}
        {quiz.related_topics?.length > 0 && (
          <div className="mt-3">
            <small className="text-muted">
              <strong>Related topics:</strong>{" "}
              {quiz.related_topics.map((t, i) => (
                <span key={i}>
                  <a
                    href={`https://en.wikipedia.org/wiki/${encodeURIComponent(t)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t}
                  </a>
                  {i < quiz.related_topics.length - 1 ? ", " : ""}
                </span>
              ))}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
