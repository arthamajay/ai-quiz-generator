const BASE_URL = "http://localhost:8000";

export async function generateQuiz(url, difficulty, numQuestions) {
  const response = await fetch(`${BASE_URL}/generate_quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, difficulty, num_questions: numQuestions }),
  });
  if (!response.ok) throw new Error("Failed to generate quiz");
  return response.json();
}

export async function submitQuiz(quizId, answers) {
  const response = await fetch(`${BASE_URL}/submit_quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quiz_id: quizId, answers }),
  });
  if (!response.ok) throw new Error("Failed to submit quiz");
  return response.json();
}

export async function fetchHistory() {
  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

export async function fetchQuizById(id) {
  const response = await fetch(`${BASE_URL}/quiz/${id}`);
  if (!response.ok) throw new Error("Failed to fetch quiz");
  return response.json();
}

export async function fetchQuizAttempts(quizId) {
  const response = await fetch(`${BASE_URL}/quiz/${quizId}/attempts`);
  if (!response.ok) throw new Error("Failed to fetch attempts");
  return response.json();
}
