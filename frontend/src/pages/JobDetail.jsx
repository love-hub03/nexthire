import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { checkReadiness, generateRoadmap } from '../services/api';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const job = state?.job;

  const [readiness, setReadiness] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loadingReadiness, setLoadingReadiness] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  useEffect(() => {
    if (!job) {
      navigate('/dashboard');
      return;
    }
    checkReadiness({
      jobDescription: job.description,
      jobTitle: job.title
    })
      .then((res) => setReadiness(res.data.data))
      .catch(() => toast.error('Failed to analyze readiness'))
      .finally(() => setLoadingReadiness(false));
  }, []);

  const handleGetReady = async () => {
    setLoadingRoadmap(true);
    try {
      const res = await generateRoadmap({
        targetRole: job.title,
        missingSkills: readiness?.missingSkills || [],
        timeframe: '2 months'
      });
      setRoadmap(res.data.data);
    } catch (err) {
      toast.error('Failed to generate roadmap');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const getVerdictClass = (color) => {
    if (color === 'green') return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (color === 'yellow') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const getBarClass = (color) => {
    if (color === 'green') return 'bg-green-500';
    if (color === 'yellow') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              <p className="text-blue-400 mt-1">{job.company}</p>
              <p className="text-gray-400 text-sm mt-2">{job.location}</p>
            </div>
            
             <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Apply Now
            </a>
          </div>
        </div>

        {loadingReadiness && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400 mb-6">
            Analyzing your readiness for this role...
          </div>
        )}

        {!loadingReadiness && readiness && (
          <div className="space-y-4 mb-6">

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Your Readiness Score</p>
                  <p className="text-5xl font-bold text-white mt-1">
                    {readiness.score}
                    <span className="text-2xl text-gray-500">/100</span>
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-lg font-semibold ${getVerdictClass(readiness.verdictColor)}`}>
                  {readiness.verdict}
                </div>
              </div>
              <div className="bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getBarClass(readiness.verdictColor)}`}
                  style={{ width: `${readiness.score}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {readiness.explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-green-400 font-semibold mb-3">You Have</h3>
                <div className="flex flex-wrap gap-2">
                  {readiness.matchingSkills.length > 0
                    ? readiness.matchingSkills.map((skill) => (
                        <span key={skill} className="bg-green-400/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-400/20">
                          {skill}
                        </span>
                      ))
                    : <p className="text-gray-500 text-sm">None matched</p>
                  }
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-red-400 font-semibold mb-3">You Need</h3>
                <div className="flex flex-wrap gap-2">
                  {readiness.missingSkills.length > 0
                    ? readiness.missingSkills.map((skill) => (
                        <span key={skill} className="bg-red-400/10 text-red-400 text-xs px-3 py-1 rounded-full border border-red-400/20">
                          {skill}
                        </span>
                      ))
                    : <p className="text-gray-500 text-sm">Nothing missing!</p>
                  }
                </div>
              </div>
            </div>

            {readiness.missingSkills.length > 0 && !roadmap && (
              <button
                onClick={handleGetReady}
                disabled={loadingRoadmap}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition disabled:opacity-50 text-lg"
              >
                {loadingRoadmap ? 'Generating your roadmap...' : 'Get Ready for This Job'}
              </button>
            )}

          </div>
        )}

        {roadmap && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">
              Your Roadmap to {job.title}
            </h3>
            <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {roadmap.roadmap}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}