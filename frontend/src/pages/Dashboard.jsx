import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../components/Sidebar';
import { getProfile, getJobs, checkReadiness } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { Bookmark } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [scoredJobs, setScoredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

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
      const jobList = res.data.data.slice(0, 12);
      setLoading(false);
      await scoreJobs(jobList);
    } catch (err) {
      toast.error('Failed to fetch jobs');
      setLoading(false);
    }
  };

  const scoreJobs = async (jobList) => {
  setScoring(true);
  const results = await Promise.all(
    jobList.map(async (job) => {
      try {
        const res = await checkReadiness({
          jobDescription: job.description,
          jobTitle: job.title
        });
        return { ...job, readiness: res.data.data };
      } catch {
        return { ...job, readiness: null };
      }
    })
  );
  const sorted = results.sort((a, b) => (b.readiness?.score || 0) - (a.readiness?.score || 0));
  setScoredJobs(sorted);
  const validScores = sorted.filter(j => j.readiness?.score > 0);
  const avg = validScores.length > 0
    ? Math.round(validScores.reduce((sum, j) => sum + j.readiness.score, 0) / validScores.length)
    : 0;
  setOverallScore(avg);
  setScoring(false);
};
  const handleSaveJob = (e, job) => {
    e.stopPropagation();
    const key = `saved_jobs_${user?.id}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    const exists = saved.find(s => s.id === job.id);
    if (exists) {
      localStorage.setItem(key, JSON.stringify(saved.filter(s => s.id !== job.id)));
      toast.success('Job removed from saved');
    } else {
      localStorage.setItem(key, JSON.stringify([...saved, job]));
      toast.success('Job saved!');
    }
  };

  const readyJobs = scoredJobs.filter(j => j.readiness?.verdictColor === 'green');
  const almostJobs = scoredJobs.filter(j => j.readiness?.verdictColor === 'yellow');
  const notReadyJobs = scoredJobs.filter(j => j.readiness?.verdictColor === 'red');

  const getVerdict = (score) => {
    if (score >= 70) return { label: 'Ready to Apply', color: '#10b981' };
    if (score >= 45) return { label: 'Almost Ready', color: '#f59e0b' };
    return { label: 'Not Ready Yet', color: '#ef4444' };
  };

  const verdict = getVerdict(overallScore);
  const gaugeData = [
    { value: overallScore },
    { value: 100 - overallScore }
  ];

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar user={user} />

      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getHour()}, <span className="text-white/60">{user?.name?.split(' ')[0]}!</span>
            </h1>
            <p className="text-white/30 text-sm mt-1">Let's make today a step closer to your dream role.</p>
          </div>
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/40 w-64 focus:outline-none focus:border-white/20"
            placeholder="Search jobs, skills or companies..."
          />
        </div>

        {/* No profile */}
        {!profile?.targetRole && !loading && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-6">
            <p className="text-white font-semibold mb-2">Complete your profile first</p>
            <p className="text-white/40 text-sm mb-4">Upload resume and set target role to see matched jobs.</p>
            <button
              onClick={() => navigate('/onboard')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-lg text-sm transition"
            >
              Set Up Profile
            </button>
          </div>
        )}

        {/* Top row */}
        {overallScore > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Career Readiness</p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <PieChart width={100} height={60}>
                    <Pie
                      data={gaugeData}
                      cx={45}
                      cy={55}
                      startAngle={180}
                      endAngle={0}
                      innerRadius={35}
                      outerRadius={48}
                      dataKey="value"
                    >
                      <Cell fill={verdict.color} />
                      <Cell fill="rgba(255,255,255,0.05)" />
                    </Pie>
                  </PieChart>
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <p className="text-xl font-bold text-white">{overallScore}%</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: verdict.color }}>{verdict.label}</p>
                  <p className="text-white/30 text-xs mt-1">Based on {scoredJobs.length} jobs</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Your Position</p>
                <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-1 rounded-lg">
                  {profile?.targetRole}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-400 font-bold text-2xl">{readyJobs.length}</p>
                  <p className="text-green-400 text-xs font-medium mt-1">Ready to Apply</p>
                  <p className="text-white/20 text-xs mt-1">High match</p>
                </div>
                <div className="text-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 font-bold text-2xl">{almostJobs.length}</p>
                  <p className="text-amber-400 text-xs font-medium mt-1">Almost Ready</p>
                  <p className="text-white/20 text-xs mt-1">Few skills needed</p>
                </div>
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 font-bold text-2xl">{notReadyJobs.length}</p>
                  <p className="text-red-400 text-xs font-medium mt-1">Not Ready Yet</p>
                  <p className="text-white/20 text-xs mt-1">Build skills first</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <DashboardSkeleton />}

        {scoring && !loading && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Analyzing your readiness for each job... {scoredJobs.length} done</p>
          </div>
        )}

        {/* Jobs */}
        {scoredJobs.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white">Top Opportunities for You</h2>
              <button
                onClick={() => navigate('/opportunities')}
                className="text-white/40 hover:text-white text-sm transition"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scoredJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-sm">
                      {job.company?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-sm">{job.title}</h3>
                  <p className="text-white/30 text-xs mt-1">{job.company} · {job.location}</p>
                  <p className="text-white/20 text-xs">via {job.source}</p>

                  {job.readiness && (
                    <div className="mt-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        job.readiness.verdictColor === 'green' ? 'bg-green-500/20 text-green-400' :
                        job.readiness.verdictColor === 'yellow' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {job.readiness.score}% Match
                      </span>
                      <p className={`text-xs font-semibold mt-2 ${
                        job.readiness.verdictColor === 'green' ? 'text-green-400' :
                        job.readiness.verdictColor === 'yellow' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {job.readiness.verdict.toUpperCase()}
                      </p>
                      {job.readiness.missingSkills.length > 0 && (
                        <p className="text-white/20 text-xs mt-1">
                          Missing: {job.readiness.missingSkills.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`, { state: { job } }); }}
                      className="flex-1 text-xs border border-white/10 hover:border-white/20 text-white/50 hover:text-white py-1.5 rounded-lg transition"
                    >
                      View Roadmap
                    </button>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg transition text-center"
                    >
                      Apply Now
                    </a>
                    <button
                      onClick={(e) => handleSaveJob(e, job)}
                      className="text-white/20 hover:text-white transition p-1"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}