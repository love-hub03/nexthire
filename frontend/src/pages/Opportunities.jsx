import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getProfile, getJobs, checkReadiness } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Opportunities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [scoredJobs, setScoredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getProfile().then((res) => {
      const p = res.data.data;
      setProfile(p);
      if (p.targetRole) {
        fetchAndScoreJobs(p.targetRole);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchAndScoreJobs = async (targetRole) => {
    setLoading(true);
    try {
      const res = await getJobs(targetRole, 'india');
      const jobList = res.data.data.slice(0, 10);
      setLoading(false);
      await scoreJobs(jobList);
    } catch (err) {
      toast.error('Failed to fetch jobs');
      setLoading(false);
    }
  };

  const scoreJobs = async (jobList) => {
    setScoring(true);
    const scored = [];
    for (const job of jobList) {
      try {
        const res = await checkReadiness({
          jobDescription: job.description,
          jobTitle: job.title
        });
        scored.push({ ...job, readiness: res.data.data });
      } catch {
        scored.push({ ...job, readiness: null });
      }
      setScoredJobs([...scored]);
    }
    scored.sort((a, b) => (b.readiness?.score || 0) - (a.readiness?.score || 0));
    setScoredJobs([...scored]);
    setScoring(false);
  };

  const filtered = scoredJobs.filter(j => {
    if (filter === 'ready') return j.readiness?.verdictColor === 'green';
    if (filter === 'almost') return j.readiness?.verdictColor === 'yellow';
    if (filter === 'not') return j.readiness?.verdictColor === 'red';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} />
      <div className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">All Opportunities</h1>
          <p className="text-gray-500 text-sm mt-1">
            Jobs for: <span className="text-indigo-600">{profile?.targetRole}</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All Jobs' },
            { key: 'ready', label: 'Ready to Apply' },
            { key: 'almost', label: 'Almost Ready' },
            { key: 'not', label: 'Not Ready Yet' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">Finding jobs...</div>
        )}

        {scoring && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 text-indigo-600 text-sm">
            Analyzing readiness... {scoredJobs.length} done
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
              className="bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-5 cursor-pointer transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-indigo-600 font-bold text-sm">
                      {job.company?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{job.company} · {job.location}</p>
                    <p className="text-indigo-400 text-xs mt-0.5">via {job.source}</p>
                    {job.readiness?.missingSkills?.length > 0 && (
                      <p className="text-gray-400 text-xs mt-2">
                        Missing: {job.readiness.missingSkills.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {job.readiness && (
                    <div className="text-right">
                      <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                        job.readiness.verdictColor === 'green' ? 'bg-green-100 text-green-600' :
                        job.readiness.verdictColor === 'yellow' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-500'
                      }`}>
                        {job.readiness.score}% Match
                      </span>
                      <p className={`text-xs font-medium mt-1 ${
                        job.readiness.verdictColor === 'green' ? 'text-green-600' :
                        job.readiness.verdictColor === 'yellow' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {job.readiness.verdict}
                      </p>
                    </div>
                  )}
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Apply
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}