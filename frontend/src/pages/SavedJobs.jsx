import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SavedJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);

  const storageKey = `saved_jobs_${user?.id}`;

  useEffect(() => {
    if (user?.id) {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setSavedJobs(saved);
    }
  }, [user]);

  const removeJob = async (jobId) => {
    const result = await Swal.fire({
      title: 'Remove saved job?',
      text: 'This job will be removed from your saved list.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffffff',
      cancelButtonColor: '#333333',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      background: '#111111',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      const updated = savedJobs.filter(j => j.id !== jobId);
      setSavedJobs(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      Swal.fire({
        title: 'Removed!',
        icon: 'success',
        background: '#111111',
        color: '#ffffff',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar user={user} />
      <div className="ml-56 flex-1 p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
          <p className="text-white/30 text-sm mt-1">{savedJobs.length} jobs saved</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Bookmark className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">No saved jobs yet</p>
            <p className="text-white/30 text-sm mb-6">Save jobs you're interested in to review them later</p>
            <button
              onClick={() => navigate('/opportunities')}
              className="bg-white/10 hover:bg-white/20 text-white text-sm px-6 py-2 rounded-full transition"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((job) => (
              <div key={job.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                    onClick={() => navigate(`/job/${job.id}`, { state: { job } })}
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">{job.company?.charAt(0) || 'C'}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{job.title}</h3>
                      <p className="text-white/30 text-sm mt-0.5">{job.company} · {job.location}</p>
                      <p className="text-white/20 text-xs mt-0.5">via {job.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition"
                    >
                      Apply
                    </a>
                    <button
                      onClick={() => removeJob(job.id)}
                      className="text-white/20 hover:text-red-400 transition"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
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