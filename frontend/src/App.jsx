import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboard from './pages/Onboard';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile';
import Resume from './pages/Resume';
import History from './pages/History';
import SavedJobs from './pages/SavedJobs';
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-400">
      Loading...
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboard" element={<PrivateRoute><Onboard /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/opportunities" element={<PrivateRoute><Opportunities /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/job/:jobId" element={<PrivateRoute><JobDetail /></PrivateRoute>} />
      <Route path="/resume" element={<PrivateRoute><Resume /></PrivateRoute>} />
      <Route path="/saved" element={<PrivateRoute><SavedJobs /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
    </Routes>
  );
}