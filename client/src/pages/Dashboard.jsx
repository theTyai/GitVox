import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ActivityFeed from '../components/ActivityFeed';
import Footer from '../components/Footer'; // Import Footer
import { AuthContext } from '../context/AuthContext';
import { FaSearch, FaPlus, FaHdd, FaCircle, FaServer, FaLock, FaGlobe, FaUserPlus } from 'react-icons/fa';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTargets, setActiveTargets] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [filter, setFilter] = useState('');
  const [inviteUser, setInviteUser] = useState('');
  const navigate = useNavigate();

  // Load Active Targets
  useEffect(() => {
    const fetchTargets = async () => {
        try {
            const res = await axios.get('http://gitvox.onrender.com/api/repos');
            setActiveTargets(res.data);
        } catch (e) { console.error(e); }
    };
    fetchTargets();
  }, []);

  // Load GitHub Repos on Modal Open
  useEffect(() => {
    if (showAddModal) {
      setLoadingRepos(true);
      axios.get('http://gitvox.onrender.com/api/github/my-repos')
        .then(res => setGithubRepos(res.data))
        .catch(console.error)
        .finally(() => setLoadingRepos(false));
    }
  }, [showAddModal]);

  const handleIngest = async (repoUrl) => {
    try {
      const res = await axios.post('http://gitvox.onrender.com/api/repo', { 
          url: repoUrl,
          inviteUser: inviteUser 
      });
      setShowAddModal(false);
      navigate(`/repo/${res.data.repo._id}`);
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
  };

  const filteredGithubRepos = githubRepos.filter(r => r.full_name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-mono flex flex-col">
      <Navbar onAddRepo={() => setShowAddModal(true)} />

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT: MAIN CONTENT */}
        <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-900 pb-4">
                <div>
                    <h1 className="text-white text-2xl font-bold uppercase tracking-tight">Command Center</h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                        ROOT@{user.username} // ACTIVE_SESSION
                    </p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-red-900/20"
                >
                    <FaPlus /> Deploy Target
                </button>
            </div>

            {/* Active Targets */}
            <div className="flex-1">
                <div className="text-[10px] uppercase text-gray-600 mb-4 tracking-widest font-bold flex items-center gap-2">
                    <FaHdd /> Mounted Repositories
                </div>
                
                {activeTargets.length === 0 ? (
                    <div className="border border-dashed border-gray-800 bg-[#0a0a0a] rounded p-12 text-center">
                        <FaServer className="mx-auto text-4xl text-gray-800 mb-4"/>
                        <p className="text-sm text-gray-500 font-bold mb-2 uppercase">No active targets found</p>
                        <p className="text-xs text-gray-600 mb-6">Initialize a repository to begin collaboration.</p>
                        <button onClick={() => setShowAddModal(true)} className="text-xs text-red-500 border-b border-red-500 hover:text-white hover:border-white transition-colors pb-0.5">
                            Connect Repository
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTargets.map(repo => (
                            <div 
                                key={repo._id} 
                                onClick={() => navigate(`/repo/${repo._id}`)}
                                className="group bg-[#0a0a0a] border border-gray-900 hover:border-red-600 p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-gray-600 group-hover:text-red-600 transition-colors">
                                        <FaHdd size={24} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                                        <FaCircle size={6} className="animate-pulse" /> Active
                                    </div>
                                </div>
                                <div className="font-bold text-white mb-1 tracking-tight">{repo.name}</div>
                                <div className="text-xs text-gray-500 uppercase">{repo.repoOwner}</div>
                                
                                <div className="mt-6 pt-4 border-t border-gray-900 text-[10px] text-gray-600 font-mono flex justify-between uppercase">
                                    <span>Sync</span>
                                    <span>{new Date(repo.lastSynced).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: ACTIVITY LOG */}
        <div className="lg:col-span-1">
            <ActivityFeed />
        </div>
      </div>

      {/* FOOTER */}
      <Footer />

      {/* MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0a] border border-red-900 w-full max-w-2xl shadow-[0_0_50px_rgba(220,38,38,0.1)] flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-red-900/30 bg-red-900/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                        <FaServer /> Select Target
                    </span>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white text-xs font-bold uppercase">[ESC] Close</button>
                </div>

                {/* Inputs */}
                <div className="p-4 border-b border-gray-800 space-y-4 bg-black">
                    <div className="flex items-center gap-3 bg-[#0a0a0a] border border-gray-800 px-3 py-3 focus-within:border-red-600 transition-colors">
                        <FaSearch className="text-gray-600"/>
                        <input 
                            autoFocus
                            className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-gray-600 uppercase"
                            placeholder="Filter repositories..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-[#0a0a0a] border border-gray-800 px-3 py-3 focus-within:border-red-600 transition-colors">
                        <span className="text-gray-600 text-[10px] uppercase font-bold w-12">Invite</span>
                        <input 
                            className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-gray-600"
                            placeholder="username (optional)"
                            value={inviteUser}
                            onChange={e => setInviteUser(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 bg-[#050505] custom-scrollbar">
                    {loadingRepos ? (
                        <div className="p-12 text-center text-xs text-red-500 font-bold uppercase animate-pulse">Accessing GitHub API...</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredGithubRepos.map(repo => (
                                <div key={repo.id} className="flex items-center justify-between p-3 hover:bg-[#111] border border-transparent hover:border-gray-800 transition-colors cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600">
                                            {repo.private ? <FaLock size={12} className="text-yellow-700"/> : <FaGlobe size={12} className="text-blue-800"/>}
                                        </span>
                                        <div>
                                            <div className="text-xs text-gray-300 font-bold">{repo.full_name}</div>
                                        </div>
                                    </div>
                                    
                                    {(repo.permissions?.admin || repo.permissions?.push) ? (
                                        <button 
                                            onClick={() => handleIngest(repo.html_url)}
                                            className="text-[10px] bg-red-900/10 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white px-3 py-1 font-bold uppercase transition"
                                        >
                                            Connect
                                        </button>
                                    ) : (
                                        <span className="text-[9px] text-gray-700 border border-gray-900 px-2 py-1 uppercase">Read Only</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;