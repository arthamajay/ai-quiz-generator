import { useState } from "react";
import { generateQuiz } from "../services/api";
import QuizDisplay from "../components/QuizDisplay";

export default function GenerateQuizTab() {
  const [url, setUrl] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await generateQuiz(url);
      setQuiz(result.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="mb-3" onSubmit={handleSubmit}>
        <input
          type="url"
          className="form-control mb-2"
          placeholder="Enter Wikipedia URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit">
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      {quiz && <QuizDisplay quiz={quiz} />}
    </div>
  );
}
