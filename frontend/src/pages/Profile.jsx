import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { X, Plus } from 'lucide-react';

const SKILL_CATEGORIES = {
  'Frontend': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular', 'Tailwind CSS', 'Redux'],
  'Backend': ['Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'PHP', 'REST API', 'GraphQL'],
  'Database': ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase', 'SQLite'],
  'DevOps': ['Git', 'Docker', 'Linux', 'AWS', 'Azure', 'GCP', 'Kubernetes', 'CI/CD'],
  'AI/ML': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Keras', 'OpenCV', 'NLP'],
  'Mobile': ['React Native', 'Flutter', 'Android', 'iOS', 'Kotlin', 'Swift'],
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    headline: '',
    targetRole: '',
    github: '',
    linkedin: '',
    portfolio: '',
  });
  const [skills, setSkills] = useState([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    getProfile().then((res) => {
      const p = res.data.data;
      setProfile(p);
      setForm({
        headline: p.headline || '',
        targetRole: p.targetRole || '',
        github: p.links?.github || '',
        linkedin: p.links?.linkedin || '',
        portfolio: p.links?.portfolio || '',
      });
      setSkills(p.skills || []);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        headline: form.headline,
        targetRole: form.targetRole,
        skills,
        links: {
          github: form.github,
          linkedin: form.linkedin,
          portfolio: form.portfolio,
        }
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skillName) => {
    const exists = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (exists) return;
    setSkills([...skills, {
      name: skillName.toLowerCase(),
      displayName: skillName,
      category: 'other',
      proficiencyLevel: 'intermediate'
    }]);
  };

  const removeSkill = (skillName) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };

  const handleAddCustomSkill = () => {
    if (!newSkill.trim()) return;
    addSkill(newSkill.trim());
    setNewSkill('');
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
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-white/30 text-sm mt-1">Manage your career profile and skills</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-5">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">Name</label>
              <p className="text-white text-sm">{user?.name}</p>
            </div>
            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">Email</label>
              <p className="text-white text-sm">{user?.email}</p>
            </div>
            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">Headline</label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 focus:border-white/30 text-white text-sm py-2 focus:outline-none transition placeholder-white/20"
                placeholder="e.g. Full Stack Developer | React & Node.js"
              />
            </div>
            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">Target Role</label>
              <input
                type="text"
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 focus:border-white/30 text-white text-sm py-2 focus:outline-none transition placeholder-white/20"
                placeholder="e.g. Frontend Developer Intern"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-5">Links</h2>
          <div className="space-y-4">
            {[
              { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
              { key: 'portfolio', label: 'Portfolio', placeholder: 'https://yourportfolio.com' },
            ].map((link) => (
              <div key={link.key}>
                <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">{link.label}</label>
                <input
                  type="text"
                  value={form[link.key]}
                  onChange={(e) => setForm({ ...form, [link.key]: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 focus:border-white/30 text-white text-sm py-2 focus:outline-none transition placeholder-white/20"
                  placeholder={link.placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Skills ({skills.length})</h2>
            <button
              onClick={() => setShowSkillPicker(!showSkillPicker)}
              className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Skills
            </button>
          </div>

          {/* Current skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 bg-white/10 border border-white/10 text-white text-xs px-3 py-1.5 rounded-full"
              >
                <span>{skill.displayName || skill.name}</span>
                <button
                  onClick={() => removeSkill(skill.name)}
                  className="text-white/30 hover:text-white transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-white/20 text-sm">No skills added yet</p>
            )}
          </div>

          {/* Skill picker */}
          {showSkillPicker && (
            <div className="border-t border-white/10 pt-4">
              {/* Custom skill input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                  className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 text-white text-sm py-2 focus:outline-none transition placeholder-white/20"
                  placeholder="Type a skill and press Enter"
                />
                <button
                  onClick={handleAddCustomSkill}
                  className="text-white/40 hover:text-white text-sm transition px-3"
                >
                  Add
                </button>
              </div>

              {/* Category buttons */}
              {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => (
                <div key={category} className="mb-4">
                  <p className="text-white/20 text-xs uppercase tracking-widest mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => {
                      const added = skills.find(s => s.name.toLowerCase() === skill.toLowerCase());
                      return (
                        <button
                          key={skill}
                          onClick={() => added ? removeSkill(skill.toLowerCase()) : addSkill(skill)}
                          className={`px-3 py-1 rounded-full text-xs transition border ${
                            added
                              ? 'bg-white text-black border-white font-semibold'
                              : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-full font-bold text-black text-sm bg-white hover:bg-white/90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>

      </div>
    </div>
  );
}