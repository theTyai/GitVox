import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user, logout, setUser } = useContext(AuthContext);
  const [url, setUrl] = useState('');
  const [profession, setProfession] = useState(user.profession || '');
  const navigate = useNavigate();

  const handleIngest = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/repo', { url });
      navigate(`/repo/${res.data.repo._id}`);
    } catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const updateProfile = async () => {
    await axios.post('http://localhost:5000/api/user/update', { profession });
    setUser({ ...user, profession });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
           <div className="flex items-center gap-4">
             <img src={user.avatarUrl} className="w-12 h-12 rounded-full border-2 border-purple-500" />
             <div>
               <h2 className="text-xl font-bold">{user.username}</h2>
               <input 
                 value={profession} 
                 onChange={(e) => setProfession(e.target.value)}
                 onBlur={updateProfile}
                 className="bg-transparent text-sm text-gray-400 border-b border-gray-700 focus:outline-none"
                 placeholder="Add profession..."
               />
             </div>
           </div>
           <button onClick={logout} className="text-red-400 hover:text-red-300">Logout</button>
        </div>

        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
          <h1 className="text-3xl font-bold mb-6">Ingest Repository</h1>
          <div className="flex gap-4">
            <input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/facebook/react"
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={handleIngest} className="bg-purple-600 hover:bg-purple-700 px-8 rounded-lg font-bold">Start</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;