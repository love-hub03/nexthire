import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboard from './pages/Onboard';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import Opportunities from './pages/Opportunities';

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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboard" element={<PrivateRoute><Onboard /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/opportunities" element={<PrivateRoute><Opportunities /></PrivateRoute>} />
      <Route path="/job/:jobId" element={<PrivateRoute><JobDetail /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}