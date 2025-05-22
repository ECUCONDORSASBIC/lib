import { useState } from 'react';

const PatientSummary = ({ anamnesis }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/patient-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anamnesis }),
      });
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      else setError(data.error || 'Error al resumir la anamnesis');
    } catch (e) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <button
        className="px-4 py-2 bg-primary text-white rounded-lg font-medium shadow hover:bg-primary/90 transition text-sm"
        onClick={handleSummarize}
        disabled={loading}
      >
        {loading ? 'Resumiendo...' : 'Resumir Anamnesis'}
      </button>
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
      {summary && (
        <div className="mt-3 text-slate-700 text-sm">
          <strong>Resumen:</strong> {summary}
        </div>
      )}
    </div>
  );
};

export default PatientSummary;
