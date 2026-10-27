const API_BASE_URL = 'http://localhost:4000/api';

export async function fetchProgress() {
  const response = await fetch(`${API_BASE_URL}/progress`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al obtener progreso');
  }
  return response.json();
}

export async function submitAnswer(contentId: string, selectedOption: string) {
  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, selectedOption }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al enviar respuesta');
  }
  return data;
}

export async function advanceTheory() {
  const response = await fetch(`${API_BASE_URL}/advance-theory`, {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al avanzar desde teoría');
  }
  return data;
}

export async function restartTopics() {
  const response = await fetch(`${API_BASE_URL}/restart-topics`, {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al reinciar el temario');
  }
  return data;
}