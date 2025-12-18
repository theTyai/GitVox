import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import RepoView from './pages/RepoView';
import Profile from './pages/Profile'; // Import Profile

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="bg-gray-900 h-screen text-white flex items-center justify-center">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        
        {/* NEW Profile Route */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
        
        <Route path="/repo/:id" element={user ? <RepoView /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;