import { useState } from 'react';
import Navbar from '../components/Navbar';
import { checkReadiness } from '../services/api';
import toast from 'react-hot-toast';

export default function Readiness() {
  const [form, setForm] = useState({ jobTitle: '', jobDescription: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await checkReadiness(form);
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check readiness');
    } finally {
      setLoading(false);
    }
  };

  const verdictColors = {
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Career Readiness Check</h1>
        <p className="text-gray-400 mb-8">Paste a job description to see if you're ready to apply.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Job Title</label>
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Frontend Developer Intern"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Job Description</label>
              <textarea
                required
                value={form.jobDescription}
                onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Paste the full job description here..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Check My Readiness'}
            </button>
          </form>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Score and Verdict */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Readiness Score</p>
                  <p className="text-5xl font-bold text-white mt-1">{result.score}<span className="text-2xl text-gray-500">/100</span></p>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-lg font-semibold ${verdictColors[result.verdictColor]}`}>
                  {result.verdict}
                </div>
              </div>
              <div className="bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${result.verdictColor === 'green' ? 'bg-green-500' : result.verdictColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{result.explanation}</p>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-green-400 font-semibold mb-3">✓ Matching Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills.length > 0 ? result.matchingSkills.map((skill) => (
                    <span key={skill} className="bg-green-400/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-400/20">{skill}</span>
                  )) : <p className="text-gray-500 text-sm">None found</p>}
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-red-400 font-semibold mb-3">✗ Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.length > 0 ? result.missingSkills.map((skill) => (
                    <span key={skill} className="bg-red-400/10 text-red-400 text-xs px-3 py-1 rounded-full border border-red-400/20">{skill}</span>
                  )) : <p className="text-gray-500 text-sm">None — you're fully matched!</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}