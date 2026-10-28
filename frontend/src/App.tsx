import { useEffect, useState } from 'react';
import { fetchProgress, submitAnswer, advanceTheory, restartTopics } from './services/api';

interface Option {
  key: string;
  text: string;
}

interface Content {
  id: string;
  topic_id: number;
  type: 'ACTIVIDAD_PRINCIPAL' | 'TEORIA' | 'REFUERZO';
  title: string;
  body: string;
  options?: Option[];
}

interface HistoryItem {
  id: number;
  content_id: string;
  selected_option: string;
  is_correct: boolean;
  created_at: string;
}

interface ProgressResponse {
  progress: {
    currentTopicId: number;
    currentStep: string;
    status: 'EN_PROGRESO' | 'COMPLETADO';
  };
  topic: { id: number; title: string } | null;
  currentContent: Content | null;
  history: HistoryItem[];
}

export default function App() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const res = await fetchProgress();
      setData(res);
      setSelectedOption('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!data?.currentContent || !selectedOption) return;
    try {
      setError(null);
      const res = await submitAnswer(data.currentContent.id, selectedOption);
      setFeedback(res.feedback);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAdvanceTheory = async () => {
    try {
      setError(null);
      setFeedback(null);
      await advanceTheory();
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    try {
      setError(null);
      setFeedback(null);
      await restartTopics();
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!data) return <div className="p-8 text-center text-gray-600">Cargando edukt.com...</div>;

  if (data.progress.status === 'COMPLETADO') {
    return (
      <div className="max-w-2xl p-8 mx-auto mt-12 text-center border border-green-300 rounded-lg shadow bg-green-50">
        <h1 className="text-3xl font-bold text-green-800">¡Temario Completado! 🎉</h1>
        <p className="mt-4 text-green-700">Has respondido correctamente todas las actividades de la ruta de matemáticas.</p>
        <button
          onClick={handleReset}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
              Reiniciar temario
        </button>
      </div>
    );
  }

  const { topic, currentContent, progress, history } = data;

  return (
    <div className="max-w-3xl p-6 mx-auto my-10 bg-white border shadow-sm rounded-xl">
      {/* Encabezado y Ruta de Aprendizaje */}
      <header className="pb-4 mb-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold tracking-wide text-blue-600 uppercase">
            Tema {topic?.id}: {topic?.title}
          </span>
          <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
            Paso: {progress.currentStep}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{currentContent?.title}</h1>
      </header>

      {/* Mensajes de Error o Retroalimentación */}
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      )}
      {feedback && (
        <div className="p-3 mb-4 text-sm text-blue-800 border border-blue-200 rounded-lg bg-blue-50">
          {feedback}
        </div>
      )}

      {/* Contenido Dinámico */}
      <main className="space-y-6">
        <div className="p-4 text-lg leading-relaxed text-gray-800 border rounded-lg bg-gray-50">
          {currentContent?.body}
        </div>

        {/* Tarjeta de Ejercicio Evaluatorio (Principal o Refuerzo) */}
        {currentContent?.options && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Selecciona tu respuesta:</p>
            {currentContent.options.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition ${
                  selectedOption === opt.key ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={opt.key}
                  checked={selectedOption === opt.key}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                <span className="text-gray-800">{opt.text}</span>
              </label>
            ))}
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Enviar Respuesta
            </button>
          </div>
        )}

        {/* Tarjeta de Contenido Teórico */}
        {currentContent?.type === 'TEORIA' && (
          <div>
            <button
              onClick={handleAdvanceTheory}
              className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            >
              Entendido, continuar a Actividad de Refuerzo →
            </button>
          </div>
        )}
      </main>

      {/* Historial de Intentos */}
      <footer className="pt-6 mt-10 border-t">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Historial de Intentos</h3>
        {history.length === 0 ? (
          <p className="text-xs text-gray-400">Aún no has realizado intentos.</p>
        ) : (
          <ul className="space-y-2 overflow-y-auto max-h-40">
            {history.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-2 text-xs border rounded bg-gray-50">
                <span className="text-gray-600">
                  Actividad: <strong>{item.content_id}</strong> | Opción: {item.selected_option}
                </span>
                <span className={item.is_correct ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {item.is_correct ? 'Correcto' : 'Incorrecto'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </footer>
    </div>
  );
}