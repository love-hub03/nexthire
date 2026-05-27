import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, updateProfile } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const SKILL_OPTIONS = {
  'Frontend': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular', 'Tailwind CSS', 'Redux', 'Git', 'Figma'],
  'Backend': ['Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'PHP', 'REST API', 'GraphQL', 'Docker', 'Git'],
  'Full Stack': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'REST API', 'TypeScript'],
  'AI/ML': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Keras', 'OpenCV', 'NLP', 'Jupyter', 'Git', 'SQL'],
  'Data Science': ['Python', 'R', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn', 'SQL', 'Tableau', 'Power BI', 'Excel', 'Jupyter', 'Spark'],
  'Mobile': ['React Native', 'Flutter', 'Android', 'iOS', 'Kotlin', 'Swift', 'JavaScript', 'Dart', 'Firebase', 'Git'],
  'DevOps': ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'Terraform', 'Jenkins', 'Ansible', 'Bash'],
};

const QUESTIONS = [
  {
    id: 'status',
    question: 'What is your current status?',
    type: 'single',
    options: ['Student', 'Fresh Graduate', 'Working Professional']
  },
  {
    id: 'field',
    question: 'What field interests you most?',
    type: 'single',
    options: ['Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Science', 'Mobile', 'DevOps']
  },
  {
    id: 'experience',
    question: 'How would you rate your coding experience?',
    type: 'single',
    options: ['Beginner', 'Intermediate', 'Advanced']
  },
  {
    id: 'skills',
    question: 'Which technologies do you already know?',
    type: 'multi',
    options: [] // dynamically filled based on field
  },
  {
    id: 'projects',
    question: 'Have you built any projects?',
    type: 'single',
    options: ['No projects yet', '1-2 projects', '3-5 projects', '5+ projects']
  },
  {
    id: 'opportunity',
    question: 'What type of opportunity are you looking for?',
    type: 'single',
    options: ['Internship', 'Full-time Job', 'Both']
  },
  {
    id: 'location',
    question: 'Work preference?',
    type: 'single',
    options: ['Remote Only', 'Open to Relocation', 'Work from Office']
  },
  {
    id: 'targetRole',
    question: 'Do you have a specific target role in mind?',
    type: 'text',
    placeholder: 'e.g. Data Scientist Intern, Frontend Developer...',
    optional: true
  }
];

export default function Onboard() {
  const [mode, setMode] = useState(null); // 'resume' or 'questions'
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const navigate = useNavigate();

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const res = await uploadResume(formData);
      const extracted = res.data.data.skills || [];
      setExtractedSkills(extracted);
      toast.success(`Resume uploaded! ${extracted.length} skills extracted.`);
      // After resume upload go to target role question only
      setMode('resume-done');
    } catch (err) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleAnswer = (questionId, value, isMulti) => {
    if (isMulti) {
      const current = answers[questionId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const handleNext = () => {
    const current = QUESTIONS[step];
    if (!current.optional && !answers[current.id] && current.type !== 'multi') {
      toast.error('Please select an option to continue');
      return;
    }
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Build skills from answers
      const selectedSkills = (answers.skills || []).map(s => ({
        name: s.toLowerCase(),
        category: 'other',
        proficiencyLevel: answers.experience?.toLowerCase() || 'beginner'
      }));

      // Build target role from answers
      const targetRole = answers.targetRole ||
        `${answers.field || ''} ${answers.opportunity === 'Internship' ? 'Intern' : 'Developer'}`.trim();

      await updateProfile({
        targetRole,
        skills: selectedSkills.length > 0 ? selectedSkills : undefined,
        headline: `${answers.status} · ${answers.field} · ${answers.experience}`,
        openToRemote: answers.location === 'Remote Only',
      });

      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeDone = async () => {
    setSaving(true);
    try {
      const targetRole = answers.targetRole || 'Software Developer';
      await updateProfile({ targetRole });
      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

 const currentQuestion = {
  ...QUESTIONS[step],
  // Override skills options based on selected field
  options: QUESTIONS[step].id === 'skills'
    ? (SKILL_OPTIONS[answers.field] || SKILL_OPTIONS['Full Stack'])
    : QUESTIONS[step].options
}; 
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  // Landing — choose mode
  if (!mode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-black text-sm">N</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Let's get you started</h1>
            <p className="text-white/40 text-sm">How would you like to set up your profile?</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl p-6 cursor-pointer transition text-center"
            >
              <Upload className="w-8 h-8 text-white/50 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Upload Resume</h3>
              <p className="text-white/30 text-xs">We'll extract your skills automatically</p>
              <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
              {uploading && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <span className="text-white/30 text-xs">Extracting skills...</span>
                </div>
              )}
            </motion.label>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setMode('questions')}
              className="bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl p-6 transition text-center"
            >
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-lg">?</span>
              </div>
              <h3 className="text-white font-bold mb-2">Answer Questions</h3>
              <p className="text-white/30 text-xs">Tell us about your skills and interests</p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // After resume upload — just ask target role
  if (mode === 'resume-done') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Check className="w-5 h-5 text-green-400" />
              <p className="text-green-400 text-sm font-semibold">{extractedSkills.length} skills extracted from resume</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {extractedSkills.slice(0, 15).map(skill => (
                <span key={skill} className="bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full border border-white/10">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-white/30 text-xs tracking-widest uppercase mb-3 block">
                Target Role (optional)
              </label>
              <input
                type="text"
                value={answers.targetRole || ''}
                onChange={(e) => setAnswers({ ...answers, targetRole: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 focus:border-white/30 text-white text-sm py-2 focus:outline-none transition placeholder-white/20"
                placeholder="e.g. Frontend Developer Intern"
              />
            </div>

            <button
              onClick={handleResumeDone}
              disabled={saving}
              className="w-full py-4 rounded-full font-bold text-black text-sm bg-white hover:bg-white/90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Go to Dashboard →'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Questions flow
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/20 text-xs">{step + 1} of {QUESTIONS.length}</span>
            <span className="text-white/20 text-xs">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-0.5 bg-white/10 rounded-full">
            <motion.div
              className="h-0.5 bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-2">{currentQuestion.question}</h2>
            {currentQuestion.optional && (
              <p className="text-white/30 text-xs mb-6">Optional — you can skip this</p>
            )}
            {!currentQuestion.optional && (
              <p className="text-white/30 text-xs mb-6">Select one to continue</p>
            )}

            {/* Single select */}
            {currentQuestion.type === 'single' && (
              <div className="space-y-2">
                {currentQuestion.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(currentQuestion.id, option, false)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition border ${
                      answers[currentQuestion.id] === option
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Multi select */}
            {currentQuestion.type === 'multi' && (
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map(option => {
                  const selected = (answers[currentQuestion.id] || []).includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(currentQuestion.id, option, true)}
                      className={`px-3 py-1.5 rounded-full text-xs transition border ${
                        selected
                          ? 'bg-white text-black border-white font-semibold'
                          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text input */}
            {currentQuestion.type === 'text' && (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value, false)}
                className="w-full bg-transparent border-b border-white/10 focus:border-white/30 text-white text-sm py-3 focus:outline-none transition placeholder-white/20"
                placeholder={currentQuestion.placeholder}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : setMode(null)}
            className="flex items-center gap-2 text-white/30 hover:text-white text-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={saving}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-white/90 transition disabled:opacity-50"
          >
            {step === QUESTIONS.length - 1 ? (saving ? 'Saving...' : 'Finish') : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}