import { useState, useEffect } from "react";
import { fetchHistory, fetchQuizById } from "../services/api";
import QuizDisplay from "../components/QuizDisplay";
import Modal from "../components/Modal";

export default function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(console.error);
  }, []);

  const viewQuiz = async (id) => {
    const quiz = await fetchQuizById(id);
    setSelectedQuiz(quiz);
    setShowModal(true);
  };

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>URL</th>
            <th>Title</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.id}</td>
              <td>{h.url}</td>
              <td>{h.title}</td>
              <td>
                <button className="btn btn-sm btn-info" onClick={() => viewQuiz(h.id)}>
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title={selectedQuiz?.title}
      >
        <QuizDisplay quiz={selectedQuiz} />
      </Modal>
    </div>
  );
}
