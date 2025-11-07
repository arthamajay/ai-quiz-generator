const BASE_URL = "http://localhost:8000";

export async function generateQuiz(url) {
  const response = await fetch(`${BASE_URL}/generate_quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) throw new Error("Failed to generate quiz");
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
