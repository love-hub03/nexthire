import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, updateProfile } from '../services/api';
import toast from 'react-hot-toast';

export default function Onboard() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState('');
  const navigate = useNavigate();

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      await uploadResume(formData);
      toast.success('Resume uploaded!');
      setStep(2);
    } catch (err) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = async () => {
    try {
      const skillList = skills.split(',').map(s => ({
        name: s.trim().toLowerCase(),
        category: 'other',
        proficiencyLevel: 'intermediate'
      })).filter(s => s.name);

      await updateProfile({ targetRole, skills: skillList });
      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">NextHire <span className="text-blue-500">AI</span></h1>
          <p className="text-gray-400 mt-2">Let's set up your profile</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? 'bg-blue-500' : 'bg-gray-800'}`} />
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Upload your resume</h2>
              <p className="text-gray-400 text-sm mb-6">We'll extract your skills automatically from your resume.</p>
              
              <label className="block w-full border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-white font-medium">{uploading ? 'Uploading...' : 'Click to upload PDF'}</p>
                <p className="text-gray-500 text-sm mt-1">Max 5MB</p>
                <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
              </label>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 text-gray-400 hover:text-white text-sm transition"
              >
                Skip — I'll enter skills manually
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Tell us about yourself</h2>
              <p className="text-gray-400 text-sm mb-6">This helps us match you with the right jobs.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Frontend Developer Intern"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Your Skills (comma separated)</label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="e.g. React, JavaScript, Node.js, MongoDB"
                  />
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}