import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../components/Sidebar';
import { getProfile, getJobs, checkReadiness } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
      const jobList = res.data.data.slice(0, 6);
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
    const avg = Math.round(scored.reduce((sum, j) => sum + (j.readiness?.score || 0), 0) / scored.length);
    setOverallScore(avg);
    setScoring(false);
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} />

      <div className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getHour()}, <span className="text-indigo-600">{user?.name?.split(' ')[0]}!</span> 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Let's make today a step closer to your dream role.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500 w-64 focus:outline-none"
                placeholder="Search jobs, skills or companies..."
              />
            </div>
          </div>
        </div>

        {/* No profile */}
        {!profile?.targetRole && !loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-6">
            <p className="text-gray-900 font-semibold mb-2">Complete your profile first</p>
            <p className="text-gray-500 text-sm mb-4">Upload resume and set target role to see matched jobs.</p>
            <button
              onClick={() => navigate('/onboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm transition"
            >
              Set Up Profile
            </button>
          </div>
        )}

        {/* Top row */}
        {overallScore > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Gauge */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Career Readiness</p>
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
                      <Cell fill="#f3f4f6" />
                    </Pie>
                  </PieChart>
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <p className="text-xl font-bold text-gray-900">{overallScore}%</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: verdict.color }}>{verdict.label}</p>
                  <p className="text-gray-400 text-xs mt-1">Based on {scoredJobs.length} jobs</p>
                </div>
              </div>
            </div>

            {/* Position stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Position for Target Role</p>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                  Target: {profile?.targetRole}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-green-600 font-bold text-lg">{readyJobs.length}</p>
                  <p className="text-green-600 text-xs font-medium">Ready to Apply</p>
                  <p className="text-gray-400 text-xs mt-1">High match, go ahead!</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xs">~</span>
                  </div>
                  <p className="text-amber-500 font-bold text-lg">{almostJobs.length}</p>
                  <p className="text-amber-500 text-xs font-medium">Almost Ready</p>
                  <p className="text-gray-400 text-xs mt-1">Improve a few skills</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xs">✗</span>
                  </div>
                  <p className="text-red-500 font-bold text-lg">{notReadyJobs.length}</p>
                  <p className="text-red-500 text-xs font-medium">Not Ready Yet</p>
                  <p className="text-gray-400 text-xs mt-1">Need more skills</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            Finding jobs for you...
          </div>
        )}

        {scoring && !loading && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 text-indigo-600 text-sm">
            Analyzing your readiness... {scoredJobs.length}/{scoredJobs.length + 1} jobs done
          </div>
        )}

        {/* Jobs */}
        {scoredJobs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Top Opportunities for You</h2>
              <button
                onClick={() => navigate('/opportunities')}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scoredJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
                  className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-sm">
                        {job.company?.charAt(0) || 'C'}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                 <p className="text-gray-400 text-xs mt-1">{job.company} · {job.location}</p>
                 <p className="text-indigo-400 text-xs">via {job.source}</p>

                  {job.readiness && (
                    <div className="mt-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        job.readiness.verdictColor === 'green' ? 'bg-green-100 text-green-600' :
                        job.readiness.verdictColor === 'yellow' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-500'
                      }`}>
                        {job.readiness.score}% Match
                      </span>
                      <p className={`text-xs font-semibold mt-2 ${
                        job.readiness.verdictColor === 'green' ? 'text-green-600' :
                        job.readiness.verdictColor === 'yellow' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {job.readiness.verdict.toUpperCase()}
                      </p>
                      {job.readiness.missingSkills.length > 0 && (
                        <p className="text-gray-400 text-xs mt-1">
                          Missing: {job.readiness.missingSkills.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`, { state: { job } }); }}
                      className="flex-1 text-xs border border-gray-200 hover:border-indigo-300 text-gray-600 py-1.5 rounded-lg transition"
                    >
                      View Roadmap
                    </button>
                      <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition text-center"
                    >
                      Apply Now
                    </a>
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