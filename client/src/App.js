import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RepoView from './pages/RepoView';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="bg-gray-900 h-screen text-white flex items-center justify-center">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/repo/:id" element={user ? <RepoView /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;