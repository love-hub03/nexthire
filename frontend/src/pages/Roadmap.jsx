import { useState } from 'react';
import Navbar from '../components/Navbar';
import { generateRoadmap } from '../services/api';
import toast from 'react-hot-toast';

export default function Roadmap() {
  const [form, setForm] = useState({
    targetRole: '',
    missingSkills: '',
    timeframe: '3 months'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generateRoadmap({
        targetRole: form.targetRole,
        missingSkills: form.missingSkills.split(',').map(s => s.trim()).filter(Boolean),
        timeframe: form.timeframe
      });
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Learning Roadmap</h1>
        <p className="text-gray-400 mb-8">Get a personalized week-by-week plan to reach your target role.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Target Role</label>
              <input
                type="text"
                required
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Frontend Developer Intern"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Skills to Learn (comma separated)</label>
              <input
                type="text"
                value={form.missingSkills}
                onChange={(e) => setForm({ ...form, missingSkills: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. TypeScript, Next.js, Docker"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Timeframe</label>
              <select
                value={form.timeframe}
                onChange={(e) => setForm({ ...form, timeframe: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Generating Roadmap...' : 'Generate My Roadmap'}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Your Roadmap</h3>
              <span className="text-blue-400 text-sm">{result.timeframe}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {result.roadmap}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}