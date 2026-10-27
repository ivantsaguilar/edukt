const API_URL = 'http://localhost:4000/api';

export async function fetchProgress() {
  const res = await fetch(`${API_URL}/progress`);
  return res.json();
}

export async function sendAnswer(contentId: string, selectedOption: string) {
  const res = await fetch(`${API_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, selectedOption })
  });
  return res.json();
}