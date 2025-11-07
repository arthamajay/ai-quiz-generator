export default function QuizDisplay({ quiz }) {
  if (!quiz) return null;

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h5>{quiz.title}</h5>
      </div>
      <div className="d-flex flex-row justify-content-center align-items-center mt-3">
        <span className="badge bg-info">Difficulty Level : {quiz.difficulty_level}</span>
      </div>
      <div className="card-body">
        {quiz.questions?.map((q, idx) => (
          <div key={idx} className="mb-3">
            <strong>Q{idx + 1}: {q.question}</strong>
            <ul className="list-group">
              {q.options.map((opt, i) => (
                <li key={i} className="list-group-item">{(1 + i)}. {opt}</li>
              ))}
            </ul>
            <p><strong>Answer:</strong> {q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
