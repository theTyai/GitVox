import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaSearch, FaBell, FaPlus, FaUserSecret, FaTerminal, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar({ onAddRepo }) {
  const { user, logout } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  // Fetch logic same as before...
  useEffect(() => {
    // ... (keep your existing notification/search logic here)
  }, []);

  return (
    <nav className="bg-black border-b border-red-900/50 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* LOGO */}
      <Link to="/dashboard" className="flex items-center gap-2 group">
        <FaTerminal className="text-red-600 text-xl group-hover:animate-pulse" />
        <span className="text-2xl font-bold tracking-tighter">
          <span className="text-white">Git</span>
          <span className="text-red-600">Vox</span>
        </span>
      </Link>

      {/* SEARCH */}
      <div className="relative w-1/3 hidden md:block">
        <div className="absolute left-3 top-3 text-red-700">
           <FaSearch />
        </div>
        <input 
          type="text" 
          placeholder="SEARCH_REPOSITORY..." 
          className="w-full bg-black border border-gray-800 focus:border-red-600 pl-10 pr-4 py-2 text-sm text-red-500 placeholder-red-900/50 focus:outline-none transition-all uppercase"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-10 left-0 w-full bg-black border border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.2)] z-50">
            {searchResults.map(repo => (
              <div 
                key={repo._id} 
                onClick={() => { navigate(`/repo/${repo._id}`); setSearchResults([]); }}
                className="p-2 hover:bg-red-900/20 cursor-pointer border-b border-gray-900 text-sm text-gray-300"
              >
                <span className="text-red-500 font-bold">&gt;</span> {repo.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-6">
        <button onClick={onAddRepo} className="text-gray-500 hover:text-red-500 transition" title="INIT_NEW_TARGET">
          <FaPlus size={16} />
        </button>

        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)} className="text-gray-500 hover:text-red-500 relative">
            <FaBell size={16} />
            {notifications.some(n => !n.read) && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>}
          </button>
          
          {showNotifs && (
             <div className="absolute right-0 mt-4 w-72 bg-black border border-red-800 shadow-xl z-50">
                <div className="bg-red-900/20 p-2 text-xs text-red-500 font-bold border-b border-red-900">SYSTEM_NOTIFICATIONS</div>
                {notifications.length === 0 ? <div className="p-4 text-xs text-gray-600">NO_LOGS</div> : 
                   notifications.map(n => (
                     <div key={n._id} className="p-3 border-b border-gray-900 text-xs hover:bg-gray-900 cursor-pointer">
                        <span className="text-red-500">[ALERT]</span> {n.message}
                     </div>
                   ))
                }
             </div>
          )}
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-gray-800">
           <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-white uppercase">{user.username}</div>
              <div className="text-[10px] text-red-600">UID: {user.githubId}</div>
           </div>
           <button onClick={() => navigate('/profile')} className="hover:text-white transition"><FaUserSecret size={20}/></button>
           <button onClick={logout} className="text-red-800 hover:text-red-500 transition"><FaSignOutAlt size={16}/></button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;