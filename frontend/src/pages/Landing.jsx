import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Search, Zap, Target, Map } from 'lucide-react';
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const bgCards = [
    { title: 'Frontend Developer Intern', company: 'Razorpay', score: 92, verdict: 'READY', color: 'green' },
    { title: 'React Developer', company: 'Swiggy', score: 78, verdict: 'ALMOST READY', color: 'yellow' },
    { title: 'Full Stack Intern', company: 'Zepto', score: 45, verdict: 'BUILD FIRST', color: 'red' },
    { title: 'UI Engineer', company: 'CRED', score: 88, verdict: 'READY', color: 'green' },
    { title: 'Node.js Developer', company: 'PhonePe', score: 61, verdict: 'ALMOST READY', color: 'yellow' },
    { title: 'MERN Stack Intern', company: 'Groww', score: 95, verdict: 'READY', color: 'green' },
    { title: 'Backend Engineer', company: 'Meesho', score: 32, verdict: 'BUILD FIRST', color: 'red' },
    { title: 'DevOps Intern', company: 'Ola', score: 71, verdict: 'ALMOST READY', color: 'yellow' },
    { title: 'Python Developer', company: 'Flipkart', score: 84, verdict: 'READY', color: 'green' },
    { title: 'Data Engineer', company: 'Paytm', score: 55, verdict: 'ALMOST READY', color: 'yellow' },
    { title: 'iOS Developer', company: 'Nykaa', score: 28, verdict: 'BUILD FIRST', color: 'red' },
    { title: 'Cloud Architect', company: 'Infosys', score: 90, verdict: 'READY', color: 'green' },
  ];

  const verdictColor = {
    green: 'text-green-400 border-green-400/30',
    yellow: 'text-yellow-400 border-yellow-400/30',
    red: 'text-red-400 border-red-400/30',
  };

  const features = [
    { icon: '🔍', title: 'Unified Job Discovery', desc: 'LinkedIn, Indeed, Glassdoor and Remotive in one feed.' },
    { icon: '🧠', title: 'AI Readiness Engine', desc: 'Honest verdict — Ready, Almost Ready, or Build First.' },
    { icon: '⚡', title: 'Skill Gap Detection', desc: 'See exactly what\'s blocking you from getting shortlisted.' },
    { icon: '🗺️', title: 'Personalized Roadmap', desc: 'Week-by-week plan to become the candidate they want.' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">NextHire AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-white/60 hover:text-white text-sm transition">Sign In</Link>
          <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition">
            Get Started →
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-3 p-6 opacity-25 rotate-3 scale-110">
          {bgCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
            >
              <div className={`text-xs font-bold mb-2 border px-2 py-0.5 rounded-full inline-block ${verdictColor[card.color]}`}>
                {card.verdict}
              </div>
              <p className="text-white text-sm font-semibold truncate">{card.title}</p>
              <p className="text-white/40 text-xs mt-1">{card.company}</p>
              <p className="text-2xl font-bold text-white mt-2">{card.score}<span className="text-sm text-white/30">/100</span></p>
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 border border-white/20 text-white/60 text-xs px-4 py-2 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            AI-Powered Career Intelligence · Free to Use
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-7xl font-black leading-[1.0] tracking-tight mb-8 uppercase"
          >
            CAREER INTELLIGENCE
            <br />
            <span className="text-white/25">FOR EVERY STUDENT</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg text-white/50 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Stop guessing which jobs to apply for. Get your readiness score, see your skill gaps, and follow a personalized roadmap to get hired.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-10 py-4 rounded-full transition text-base"
            >
              START FOR FREE →
            </Link>
            <Link
              to="/login"
              className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition text-lg"
            >
              ↗
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </div>

       {/* Bidirectional Marquee */}
      <div className="border-t border-white/10 py-12 overflow-hidden">
        <p className="text-center text-white/20 text-xs font-semibold tracking-widest uppercase mb-10">
          Jobs aggregated from
        </p>
            {/* Row 1 — moves left */}
        <div className="overflow-hidden mb-5">
          <motion.div
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex gap-20 whitespace-nowrap"
          >
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex gap-20 items-center">
                {['LinkedIn', 'Indeed', 'Glassdoor', 'Remotive', 'Wellfound', 'AngelList'].map((item) => (
                  <span key={item} className="text-white/25 text-2xl font-bold tracking-tight">{item}</span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 — moves right */}
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="flex gap-20 whitespace-nowrap"
          >
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex gap-20 items-center">
                {['Internshala', 'Naukri', 'Cutshort', 'HackerEarth', 'Unstop', 'TopHire'].map((item) => (
                  <span key={item} className="text-white/25 text-2xl font-bold tracking-tight">{item}</span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-10 py-28">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-16"
        >
          How it works
        </motion.p>
        <div className="grid grid-cols-3 gap-16">
          {[
            { num: '01', title: 'Upload your resume', desc: 'Our AI reads your profile in seconds and extracts every skill and experience automatically.' },
            { num: '02', title: 'Get your readiness score', desc: 'We match you against real job descriptions — Ready, Almost Ready, or Build First.' },
            { num: '03', title: 'Follow your roadmap', desc: 'A personalized week-by-week plan to close your gaps and unlock more opportunities.' },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <p className="text-white/10 text-6xl font-bold mb-6">{step.num}</p>
              <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
     {/* Features */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-10 py-28">
          <div className="grid grid-cols-3 gap-12">
            {/* Left side */}
            <div className="flex flex-col justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 border border-white/20 text-white/50 text-xs px-3 py-1.5 rounded-full mb-6 w-fit"
              >
                ✦ Core Features
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-black leading-tight mb-6"
              >
                Everything you need to
                <span className="text-indigo-400"> get hired faster.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-white/40 text-sm leading-relaxed mb-8"
              >
                One platform that replaces 5 different tools. From job discovery to readiness analysis to personalized roadmaps.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-full transition text-sm"
                >
                  Explore Platform →
                </Link>
              </motion.div>
            </div>

            {/* Right side — 2x2 grid */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {[
                {
                  icon: <Search className="w-5 h-5" />,
                  title: 'Unified Job Discovery',
                  desc: 'LinkedIn, Indeed, Glassdoor and Remotive aggregated in one intelligent feed ranked by your readiness.'
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: 'AI Readiness Engine',
                  desc: 'Semantic matching gives you an honest verdict — Ready, Almost Ready, or Build First — before you apply.'
                },
                {
                  icon: <Target className="w-5 h-5" />,
                  title: 'Skill Gap Detection',
                  desc: 'See precisely what skills are missing and why you\'d likely be rejected for each specific role.'
                },
                {
                  icon: <Map className="w-5 h-5" />,
                  title: 'Personalized Roadmap',
                  desc: 'Week-by-week AI learning plan tied to the specific jobs you want. Every step unlocks more opportunities.'
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

     

    

      {/* CTA */}
      <div className="border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto px-10 py-32 text-center"
        >
          <h2 className="text-6xl font-black tracking-tight uppercase mb-6">
            STOP GUESSING.
            <br />
            <span className="text-white/20">START APPLYING.</span>
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto">
            Join students who stopped applying blindly and started applying strategically.
          </p>
          <Link
            to="/register"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-14 py-5 rounded-full transition text-base inline-block"
          >
            GET STARTED FREE →
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-xs">N</span>
            </div>
            <span className="font-bold text-white text-sm">NextHire AI</span>
          </div>
          <p className="text-white/20 text-sm">Built for students. Powered by AI. © 2026</p>
        </div>
      </div>

    </div>
  );
}