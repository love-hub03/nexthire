import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile, uploadResume } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function Resume() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      setProfile(res.data.data);
      setLoading(false);
    });
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const res = await uploadResume(formData);
      toast.success(`Resume uploaded! ${res.data.data.skillsExtracted} skills extracted.`);
      getProfile().then((r) => setProfile(r.data.data));
    } catch (err) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex">
      <Sidebar user={user} />
      <div className="ml-56 flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar user={user} />
      <div className="ml-56 flex-1 p-8 max-w-3xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Resume</h1>
          <p className="text-white/30 text-sm mt-1">Upload and manage your resume</p>
        </div>

        {/* Upload section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          {profile?.resumeText ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400 font-semibold text-sm">Resume uploaded and parsed</p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <FileText className="w-8 h-8 text-white/30" />
                <div>
                  <p className="text-white text-sm font-medium">Your Resume</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {profile.resumeText.split(' ').length} words extracted
                  </p>
                </div>
              </div>
              <p className="text-white/30 text-xs mb-4">Upload a new resume to replace the current one</p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No resume uploaded yet</h3>
              <p className="text-white/30 text-sm">Upload your PDF resume to get better job matches</p>
            </div>
          )}

          <label className={`block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
            uploading ? 'border-white/10' : 'border-white/10 hover:border-white/30'
          }`}>
            <Upload className="w-6 h-6 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm font-medium">
              {uploading ? 'Uploading and extracting skills...' : 'Click to upload PDF resume'}
            </p>
            <p className="text-white/20 text-xs mt-1">Max 5MB · PDF only</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {uploading && (
            <div className="flex items-center gap-3 mt-4">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Extracting skills from your resume...</p>
            </div>
          )}
        </div>

        {/* Extracted skills */}
        {profile?.skills?.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              Extracted Skills ({profile.skills.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill.name}
                  className="bg-white/10 border border-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full"
                >
                  {skill.displayName || skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resume preview */}
        {profile?.resumeText && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
            <h2 className="text-white font-semibold mb-4">Resume Text Preview</h2>
            <p className="text-white/30 text-xs leading-relaxed line-clamp-6">
              {profile.resumeText.substring(0, 600)}...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}