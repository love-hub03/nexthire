import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get history from localStorage
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('readiness_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('readiness_history');
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar user={user} />
      <div className="ml-56 flex-1 p-8 max-w-3xl">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">History</h1>
            <p className="text-white/30 text-sm mt-1">Your past readiness checks</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-white/20 hover:text-white/50 text-sm transition"
            >
              Clear all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-white/20 text-4xl mb-4">📋</p>
            <p className="text-white font-semibold mb-2">No history yet</p>
            <p className="text-white/30 text-sm mb-6">
              Your readiness checks will appear here after you analyze jobs
            </p>
            <button
              onClick={() => navigate('/opportunities')}
              className="bg-white/10 hover:bg-white/20 text-white text-sm px-6 py-2 rounded-full transition"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-white/20 transition"
                onClick={() => navigate(`/job/${item.jobId}`, { state: { job: item.job } })}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{item.jobTitle}</h3>
                    <p className="text-white/30 text-sm mt-0.5">{item.company}</p>
                    <p className="text-white/20 text-xs mt-1">
                      {new Date(item.checkedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      item.verdictColor === 'green' ? 'bg-green-500/20 text-green-400' :
                      item.verdictColor === 'yellow' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.score}% Match
                    </span>
                    <p className={`text-xs font-medium mt-1 ${
                      item.verdictColor === 'green' ? 'text-green-400' :
                      item.verdictColor === 'yellow' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {item.verdict}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}