import { useEffect, useState } from 'react'
import './App.css'

interface Content {
  id: string;
  title: string;
  body: string;
  type: 'MAIN' | 'THEORY' | 'REINFORCEMENT';
  options?: { key: string; text: string }[];
}

interface ProgressData {
  progress: { currentTopicId: number; currentStep: string; status: string };
  topic: { id: number; title: string };
  currentContent: Content;
  history: Array<{ id: number; content_id: string; is_correct: boolean; created_at: string }>;
}

export default function App() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchProgress = async () => {
    const res = await fetch('http://localhost:4000/api/progress');
    const json = await res.json();
    setData(json);
    setSelectedOption('');
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSubmit = async () => {
    if (!data?.currentContent || !selectedOption) return;
    const res = await fetch('http://localhost:4000/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: data.currentContent.id, selectedOption })
    });
    const result = await res.json();
    if (res.ok) {
      setFeedback(result.feedback);
      fetchProgress();
    } else {
      alert(result.error);
    }
  };

  const handleAdvanceTheory = async () => {
    const res = await fetch('http://localhost:4000/api/advance-theory', { method: 'POST' });
    if (res.ok) {
      setFeedback(null);
      fetchProgress();
    }
  };

  if (!data) return <div className="p-8">Cargando...</div>;

  if (data.progress?.status === 'COMPLETED') {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-green-100 rounded border border-green-400">
        <h1 className="text-2xl font-bold text-green-800">¡Felicidades!</h1>
        <p className="mt-2 text-green-700">Has completado todo el temario de matemáticas exitosamente.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white shadow rounded-lg border">
      <header className="mb-6 border-b pb-4">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          Tema {data.topic.id}: {data.topic.title}
        </span>
        <h1 className="text-xl font-bold mt-1">{data.currentContent.title}</h1>
        <div className="mt-2 text-sm text-gray-500">Paso actual: {data.progress.currentStep}</div>
      </header>

      {feedback && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
          {feedback}
        </div>
      )}

      <main className="mb-6">
        <p className="text-lg text-gray-800 mb-4">{data.currentContent.body}</p>

        {/* Vista de Pregunta Evaluatoria */}
        {data.currentContent.options && (
          <div className="space-y-2">
            {data.currentContent.options.map((opt) => (
              <label key={opt.key} className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="option"
                  value={opt.key}
                  checked={selectedOption === opt.key}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                <span>{opt.text}</span>
              </label>
            ))}
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Enviar Respuesta
            </button>
          </div>
        )}

        {/* Vista de Contenido Teórico */}
        {data.currentContent.type === 'THEORY' && (
          <button
            onClick={handleAdvanceTheory}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Continuar a la Actividad de Refuerzo
          </button>
        )}
      </main>

      {/* Historial de Intentos */}
      <footer className="mt-8 border-t pt-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Historial de Intentos</h3>
        <ul className="space-y-1 text-xs text-gray-600">
          {data.history.map((item) => (
            <li key={item.id} className="flex justify-between border-b py-1">
              <span>Actividad: {item.content_id}</span>
              <span className={item.is_correct ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {item.is_correct ? 'Correcto' : 'Incorrecto'}
              </span>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}