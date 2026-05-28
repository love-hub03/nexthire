import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { signInWithGoogle } from '../services/firebase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/onboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const { user } = result;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        name: user.displayName,
        email: user.email,
        googleId: user.uid,
        avatar: user.photoURL
      });
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      if (res.data.isNewUser) {
        navigate('/onboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google signup failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex overflow-hidden" style={{ perspective: '1200px' }}>

      {/* Left Panel — STATIC, no animation */}
      <div
        className="hidden md:flex w-1/2 min-h-screen flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">N</span>
            </div>
            <span className="text-white font-bold">NextHire AI</span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-4">Start Your Journey</p>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Begin your<br />
            <span className="text-white/30">career path.</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-10">
            Upload your resume or answer a few questions. We'll match you with jobs you're actually ready for.
          </p>
          <div className="space-y-3">
            {[
              'AI-powered readiness scoring',
              'Jobs from 6+ platforms in one feed',
              'Personalized learning roadmaps',
              'Track your growth over time',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                <p className="text-white/40 text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — FLIP animation from Login */}
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full md:w-1/2 min-h-screen bg-black flex flex-col justify-center px-8 md:px-16 border-l border-white/5"
      >
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-10 w-fit">
          <Link to="/login" className="text-white/40 hover:text-white text-sm font-medium px-5 py-2 rounded-lg transition">
            Sign in
          </Link>
          <span className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg">
            Register
          </span>
        </div>

        <div className="max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
          <p className="text-white/30 text-sm mb-8">Start your AI-powered career journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">Full Name</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition">
                <User className="w-4 h-4 text-white/20 shrink-0" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/20"
                  placeholder="Lovepreet Saini"
                />
              </div>
            </div>

            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">Email</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition">
                <Mail className="w-4 h-4 text-white/20 shrink-0" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">Password</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition">
                <Lock className="w-4 h-4 text-white/20 shrink-0" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/20"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-black text-sm bg-white hover:bg-white/90 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Creating account...' : 'Continue with Google'}
          </button>

          <p className="text-white/20 text-xs text-center mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-white/50 hover:text-white underline transition">
              Sign in ↗
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}