import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { checkReadiness, generateRoadmap } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const job = state?.job;

  const [readiness, setReadiness] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loadingReadiness, setLoadingReadiness] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  useEffect(() => {
    if (!job) { navigate('/dashboard'); return; }
    checkReadiness({
      jobDescription: job.description,
      jobTitle: job.title
    }).then((res) => {
      setReadiness(res.data.data);
      // Save to history
     const existing = JSON.parse(localStorage.getItem(`readiness_history_${user?.id}`) || '[]');
      const newEntry = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        score: res.data.data.score,
        verdict: res.data.data.verdict,
        verdictColor: res.data.data.verdictColor,
        checkedAt: new Date().toISOString(),
        job
      };
      const updated = [newEntry, ...existing.filter(e => e.jobId !== job.id)].slice(0, 50);
      localStorage.setItem(`readiness_history_${user?.id}`, JSON.stringify(updated));
    }).catch(() => {
      toast.error('Failed to analyze readiness');
    }).finally(() => {
      setLoadingReadiness(false);
    });
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
    <div className="min-h-screen bg-black flex">
      <Sidebar user={user} />
      <div className="ml-56 flex-1 p-8 ">

        {/* Job Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              <p className="text-white/50 mt-1">{job.company}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/30 text-sm">{job.location}</span>
                {job.isRemote && (
                  <span className="bg-green-400/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-400/20">
                    Remote
                  </span>
                )}
                {job.source && (
                  <span className="text-white/20 text-xs">via {job.source}</span>
                )}
              </div>
              {job.stipend && (
                <p className="text-white/40 text-sm mt-2">💰 {job.stipend}</p>
              )}
            </div>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-white/90 text-black font-bold px-6 py-3 rounded-xl transition text-sm"
            >
              Apply Now
            </a>
          </div>
        </div>

        {/* Readiness Loading */}
        {loadingReadiness && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-6">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">Analyzing your readiness for this role...</p>
          </div>
        )}

        {!loadingReadiness && readiness && (
          <div className="space-y-4 mb-6">

            {/* Score */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/30 text-sm">Your Readiness Score</p>
                  <p className="text-5xl font-bold text-white mt-1">
                    {readiness.score}
                    <span className="text-2xl text-white/20">/100</span>
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-base font-semibold ${getVerdictClass(readiness.verdictColor)}`}>
                  {readiness.verdict}
                </div>
              </div>
              <div className="bg-white/5 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getBarClass(readiness.verdictColor)}`}
                  style={{ width: `${readiness.score}%` }}
                />
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">
                {readiness.explanation?.replace(/\*\*/g, '')}
              </p>
            </div>

           

            {/* Get Ready Button */}
            {!roadmap && (
              <button
                onClick={handleGetReady}
                disabled={loadingRoadmap}
                className="w-full bg-white hover:bg-white/90 text-black font-bold py-4 rounded-2xl transition disabled:opacity-50 text-base"
              >
                {loadingRoadmap ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Generating your roadmap...
                  </span>
                ) : '🚀 Get Ready for This Job'}
              </button>
            )}
          </div>
        )}

        {/* Roadmap */}
       {roadmap && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">
              Your Roadmap to {job.title}
            </h3>
            <pre className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {roadmap.roadmap?.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6} /g, '')}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}