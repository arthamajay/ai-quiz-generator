import { useState, useEffect } from "react";
import { fetchHistory, fetchQuizById, fetchQuizAttempts } from "../services/api";
import QuizDisplay from "../components/QuizDisplay";
import Modal from "../components/Modal";

const DIFFICULTY_BADGE = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

export default function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAttempts, setSelectedAttempts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeAttemptIdx, setActiveAttemptIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(console.error);
  }, []);

  const viewQuiz = async (id) => {
    setLoading(true);
    try {
      const [quiz, attempts] = await Promise.all([
        fetchQuizById(id),
        fetchQuizAttempts(id),
      ]);
      setSelectedQuiz(quiz);
      setSelectedAttempts(attempts);
      setActiveAttemptIdx(0);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuiz(null);
    setSelectedAttempts([]);
  };

  // Build a quiz-with-answers view for a specific attempt
  const buildAttemptQuiz = (quiz, attempt) => {
    if (!attempt) return quiz;
    // Merge user answers into questions for display
    const questions = quiz.questions.map((q, idx) => {
      const r = attempt.results[idx];
      return { ...q, _userAnswer: r?.user_answer, _isCorrect: r?.is_correct };
    });
    return { ...quiz, questions };
  };

  const currentAttempt = selectedAttempts[activeAttemptIdx] || null;

  return (
    <div>
      {history.length === 0 ? (
        <p className="text-muted">No quizzes generated yet.</p>
      ) : (
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Questions</th>
              <th>Best Score</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => {
              const diffColor =
                DIFFICULTY_BADGE[h.difficulty_level?.toLowerCase()] || "secondary";
              return (
                <tr key={h.id}>
                  <td>{h.id}</td>
                  <td>
                    <span className="fw-semibold">{h.title}</span>
                    <br />
                    <small className="text-muted">{h.url}</small>
                  </td>
                  <td>
                    <span className={`badge bg-${diffColor} text-capitalize`}>
                      {h.difficulty_level}
                    </span>
                  </td>
                  <td>{h.num_questions ?? "—"}</td>
                  <td>
                    {h.attempt ? (
                      <span
                        className={`badge ${
                          h.attempt.percentage >= 70
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {h.attempt.score}/{h.attempt.total} ({h.attempt.percentage}%)
                      </span>
                    ) : (
                      <span className="badge bg-secondary">Not attempted</span>
                    )}
                  </td>
                  <td>
                    <small>{new Date(h.date).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => viewQuiz(h.id)}
                      disabled={loading}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Modal
        show={showModal}
        handleClose={closeModal}
        title={selectedQuiz?.title}
      >
        {selectedAttempts.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-semibold small">Attempt History</label>
            <div className="d-flex flex-wrap gap-2">
              {selectedAttempts.map((a, i) => (
                <button
                  key={a.attempt_id}
                  type="button"
                  className={`btn btn-sm ${
                    i === activeAttemptIdx
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setActiveAttemptIdx(i)}
                >
                  #{i + 1} — {a.score}/{a.total} ({a.percentage}%)
                </button>
              ))}
            </div>
          </div>
        )}

        {currentAttempt && (
          <div
            className={`alert ${
              currentAttempt.percentage >= 70 ? "alert-success" : "alert-warning"
            } py-2`}
          >
            <strong>
              Score: {currentAttempt.score} / {currentAttempt.total}
            </strong>{" "}
            ({currentAttempt.percentage}%) &nbsp;·&nbsp;
            <small>{new Date(currentAttempt.date).toLocaleString()}</small>
          </div>
        )}

        {selectedQuiz && (
          <AttemptReview quiz={selectedQuiz} attempt={currentAttempt} />
        )}

        {!currentAttempt && selectedQuiz && (
          <p className="text-muted small mt-2">No attempts recorded for this quiz.</p>
        )}
      </Modal>
    </div>
  );
}

// Read-only review of a quiz attempt showing correct/wrong per question
function AttemptReview({ quiz, attempt }) {
  const questions = quiz.questions || [];

  return (
    <div>
      {questions.map((q, idx) => {
        const resultItem = attempt?.results?.[idx];
        const correctLetter = q.answer?.trim().charAt(0).toUpperCase();
        const userLetter = resultItem?.user_answer?.trim().charAt(0).toUpperCase();
        const isCorrect = resultItem?.is_correct;

        return (
          <div
            key={idx}
            className={`mb-3 p-3 rounded border ${
              attempt
                ? isCorrect
                  ? "border-success bg-success bg-opacity-10"
                  : "border-danger bg-danger bg-opacity-10"
                : "border-light"
            }`}
          >
            <p className="fw-semibold mb-2">
              Q{idx + 1}: {q.question}
            </p>
            <div className="d-flex flex-column gap-1">
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isCorrectOpt = letter === correctLetter;
                const isUserOpt = letter === userLetter;

                let cls = "btn btn-sm text-start ";
                if (attempt) {
                  if (isCorrectOpt) cls += "btn-success";
                  else if (isUserOpt && !isCorrectOpt) cls += "btn-danger";
                  else cls += "btn-outline-secondary";
                } else {
                  cls += "btn-outline-secondary";
                }

                return (
                  <button key={i} type="button" className={cls} disabled>
                    <strong>{letter}.</strong> {opt}
                    {attempt && isCorrectOpt && <span className="ms-1">✓</span>}
                    {attempt && isUserOpt && !isCorrectOpt && (
                      <span className="ms-1">✗</span>
                    )}
                  </button>
                );
              })}
            </div>
            {q.explanation && (
              <div className="mt-2 p-2 bg-light rounded small text-dark">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
