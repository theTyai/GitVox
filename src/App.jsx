import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RepoView from './pages/RepoView';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        {/* Pass repo ID via route */}
        <Route path="/repo/:id" element={user ? <RepoView /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;