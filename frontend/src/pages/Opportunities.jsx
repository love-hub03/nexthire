import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getProfile, getJobs, checkReadiness } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Bookmark } from 'lucide-react';


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
      const jobList = res.data.data;
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
  const validScores = scored.filter(j => j.readiness?.score > 0);
  const avg = validScores.length > 0
    ? Math.round(validScores.reduce((sum, j) => sum + j.readiness.score, 0) / validScores.length)
    : 0;
  setOverallScore(avg);
  setScoring(false);
};

  const filtered = scoredJobs.filter(j => {
    if (filter === 'ready') return j.readiness?.verdictColor === 'green';
    if (filter === 'almost') return j.readiness?.verdictColor === 'yellow';
    if (filter === 'not') return j.readiness?.verdictColor === 'red';
    return true;
  });

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar user={user} />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">All Opportunities</h1>
          <p className="text-white/30 text-sm mt-1">
            Jobs for: <span className="text-white/60">{profile?.targetRole}</span>
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
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Skeleton loader */}
        {loading && (
          <SkeletonTheme baseColor="#1a1a1a" highlightColor="#2a2a2a">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Skeleton width={40} height={40} borderRadius={12} />
                      <div className="flex-1">
                        <Skeleton width="50%" height={16} className="mb-2" />
                        <Skeleton width="35%" height={12} className="mb-1" />
                        <Skeleton width="25%" height={10} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton width={90} height={32} borderRadius={8} />
                      <Skeleton width={70} height={36} borderRadius={8} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SkeletonTheme>
        )}

        {/* Scoring indicator */}
        {scoring && !loading && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Analyzing readiness for each job... {scoredJobs.length} done</p>
          </div>
        )}

        {/* Jobs list */}
        {!loading && (
          <div className="space-y-3">
            {filtered.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
                className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 cursor-pointer transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">
                        {job.company?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <p className="text-white/30 text-sm mt-0.5">{job.company} · {job.location}</p>
                      <p className="text-white/20 text-xs mt-0.5">via {job.source}</p>
                      {job.readiness?.missingSkills?.length > 0 && (
                        <p className="text-white/20 text-xs mt-2">
                          Missing: {job.readiness.missingSkills.slice(0, 3).join(', ')}
                        </p>
                      )}
                      {!job.readiness && scoring && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin" />
                          <span className="text-white/20 text-xs">Analyzing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {job.readiness && (
                      <div className="text-right">
                        <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                          job.readiness.verdictColor === 'green' ? 'bg-green-500/20 text-green-400' :
                          job.readiness.verdictColor === 'yellow' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {job.readiness.score}% Match
                        </span>
                        <p className={`text-xs font-medium mt-1 ${
                          job.readiness.verdictColor === 'green' ? 'text-green-400' :
                          job.readiness.verdictColor === 'yellow' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {job.readiness.verdict}
                        </p>
                      </div>
                    )}
                    <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const saved = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
                    const exists = saved.find(s => s.id === job.id);
                    if (exists) {
                      localStorage.setItem('saved_jobs', JSON.stringify(saved.filter(s => s.id !== job.id)));
                      toast.success('Removed from saved');
                    } else {
                      localStorage.setItem('saved_jobs', JSON.stringify([...saved, job]));
                      toast.success('Job saved!');
                    }
                  }}
                  className="text-white/20 hover:text-white transition p-2"
                >
                 
                </button>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                    >
                      Apply
                    </a>
                                          <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const saved = JSON.parse(localStorage.getItem(`saved_jobs_${user?.id}`) || '[]');
                          const exists = saved.find(s => s.id === job.id);
                          if (exists) {
                            localStorage.setItem(`saved_jobs_${user?.id}`, JSON.stringify(saved.filter(s => s.id !== job.id)));
                            toast.success('Job removed from saved');
                          } else {
                            localStorage.setItem(`saved_jobs_${user?.id}`, JSON.stringify([...saved, job]));
                            toast.success('Job saved!');
                          }
                        }}
                        className="text-white/20 hover:text-white transition"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !scoring && (
              <div className="text-center py-16 text-white/20">
                No jobs found for this filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}