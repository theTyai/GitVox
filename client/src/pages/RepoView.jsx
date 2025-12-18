import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';
import BugReporter from '../components/BugReporter';
import Navbar from '../components/Navbar';
import TeamModal from '../components/TeamModal';
import UserProfileModal from '../components/UserProfileModal';
import { FaArrowLeft, FaCodeBranch, FaClock, FaUser, FaHdd, FaUsers, FaCheck, FaBug, FaCommentDots, FaGlobe } from 'react-icons/fa';

function RepoView() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [repoData, setRepoData] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [activeTab, setActiveTab] = useState('CHAT'); 
  
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [globalActivity, setGlobalActivity] = useState([]);
  
  // Helpers
  const isPending = repoData?.repo?.pendingUsers?.includes(user.username);

  useEffect(() => { fetchRepoData(); }, [id]);

  // Fetch Global Activity when NO commit is selected
  useEffect(() => {
    if (!selectedCommit && repoData) {
        axios.get(`http://localhost:5000/api/repo/${id}/global-activity`)
             .then(res => setGlobalActivity(res.data))
             .catch(console.error);
    }
  }, [selectedCommit, repoData]);

  const fetchRepoData = () => {
    axios.get(`http://localhost:5000/api/repo/${id}`)
      .then(res => setRepoData(res.data))
      .catch(() => alert("ACCESS_DENIED"));
  };

  const handleAcceptInvite = async () => {
      await axios.post(`http://localhost:5000/api/repo/${id}/accept`);
      fetchRepoData(); // Refresh to remove pending status
  };

  const toggleBugStatus = async (bugId) => {
      await axios.post(`http://localhost:5000/api/bug/${bugId}/toggle`);
      // Refresh global list or local list
      if (!selectedCommit) {
           const res = await axios.get(`http://localhost:5000/api/repo/${id}/global-activity`);
           setGlobalActivity(res.data);
      }
      // Note: If inside a commit view, BugReporter component handles its own refresh usually, 
      // but for this "Global" view we update local state.
  };

  if (!repoData) return <div className="bg-black h-screen text-gray-500 font-mono flex items-center justify-center">INITIALIZING_UPLINK...</div>;

  return (
    <div className="h-screen bg-[#050505] text-gray-300 font-mono flex flex-col overflow-hidden selection:bg-red-900 selection:text-white">
      <Navbar onAddRepo={() => {}} />

      {/* HEADER BAR */}
      <div className="bg-[#0a0a0a] border-b border-gray-800 p-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white transition">
                <FaArrowLeft />
            </button>
            <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                    <FaHdd className="text-red-600"/> 
                    {repoData.repo.repoOwner} / {repoData.repo.name}
                </h1>
                <p className="text-[10px] text-gray-600">OID: {repoData.repo._id}</p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Team Button */}
            <button 
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white border border-gray-800 hover:border-gray-500 px-3 py-1.5 transition-all uppercase"
            >
                <FaUsers /> Personnel ({repoData.repo.allowedUsers.length})
            </button>
            <div className="text-[10px] bg-red-900/10 text-red-500 px-2 py-1 border border-red-900/30 uppercase font-bold tracking-wider">
                Encrypted
            </div>
        </div>
      </div>

      {/* PENDING INVITE BANNER */}
      {isPending && (
          <div className="bg-red-900 text-white text-xs p-2 text-center font-bold flex items-center justify-center gap-4 animate-pulse">
              <span>⚠ ACCESS RESTRICTED: PENDING INVITATION</span>
              <button onClick={handleAcceptInvite} className="bg-white text-red-900 px-3 py-0.5 rounded-sm hover:bg-gray-200">
                  <FaCheck /> ACCEPT PROTOCOL
              </button>
          </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR: COMMIT LIST */}
        <div className="w-80 bg-[#020202] border-r border-gray-800 flex flex-col">
            <div className="p-3 bg-[#0a0a0a] border-b border-gray-800 text-[10px] font-bold text-gray-500 uppercase flex justify-between tracking-widest">
                <span>Timeline</span>
                <span className="text-red-600">HEAD: MASTER</span>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                {/* Option to deselect commit (Go to Global) */}
                <div 
                    onClick={() => setSelectedCommit(null)}
                    className={`p-3 border-b border-gray-900 cursor-pointer transition-all uppercase text-xs font-bold flex items-center gap-2 ${!selectedCommit ? 'bg-red-900/20 text-red-500 border-l-2 border-l-red-500' : 'text-gray-500 hover:bg-[#111]'}`}
                >
                    <FaGlobe /> Global Ops Log
                </div>

                {repoData.commits.map((c) => (
                    <div 
                        key={c.sha} 
                        onClick={() => setSelectedCommit(c)}
                        className={`p-3 border-b border-gray-900 cursor-pointer group transition-all ${selectedCommit?.sha === c.sha ? 'bg-[#111] text-white border-l-2 border-l-white' : 'hover:bg-[#0a0a0a] text-gray-500 border-l-2 border-l-transparent'}`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <FaCodeBranch className="text-[10px]" />
                            <span className="text-xs font-bold font-mono">
                                {c.sha.substring(0, 7)}
                            </span>
                            <span className="ml-auto text-[9px] opacity-50">{new Date(c.commit.author.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] truncate opacity-70 font-sans">
                            {c.commit.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 bg-[#050505] flex flex-col relative">
            
            {/* 1. GLOBAL FEED (When no commit selected) */}
            {!selectedCommit && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-800 bg-[#080808] flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">Global Operations Log</h2>
                        <div className="text-xs text-gray-500">Showing all activity across repository</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {globalActivity.map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 border border-gray-800 bg-[#0a0a0a] hover:border-gray-600 transition-colors group">
                                <div className="pt-1">
                                    {item.type === 'CHAT' 
                                        ? <div className="w-8 h-8 bg-gray-800 flex items-center justify-center text-gray-400"><FaCommentDots/></div>
                                        : <div className="w-8 h-8 bg-red-900/20 flex items-center justify-center text-red-500"><FaBug/></div>
                                    }
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-sm">{item.type === 'CHAT' ? item.data.sender.username : item.data.reporter.username}</span>
                                            <span className="text-[10px] text-gray-600 uppercase bg-gray-900 px-1 border border-gray-800">{item.type}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">hash: {item.data.commitHash.substring(0,7)}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-600">{new Date(item.date).toLocaleString()}</span>
                                    </div>

                                    {item.type === 'CHAT' ? (
                                        <p className="text-sm text-gray-400">{item.data.message}</p>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-red-400 font-bold">{item.data.description}</p>
                                            <button 
                                                onClick={() => toggleBugStatus(item.data._id)}
                                                className={`text-[10px] px-2 py-1 font-bold uppercase border ${item.data.status === 'Resolved' ? 'text-green-500 border-green-900 bg-green-900/10' : 'text-red-500 border-red-900 bg-red-900/10'}`}
                                            >
                                                {item.data.status || 'OPEN'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. COMMIT CONTEXT VIEW (When commit selected) */}
            {selectedCommit && (
                <>
                    <div className="p-4 border-b border-gray-800 bg-[#080808]">
                        <h2 className="text-lg font-bold text-white leading-tight mb-1">{selectedCommit.commit.message}</h2>
                        <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><FaUser size={10}/> {selectedCommit.commit.author.name}</span>
                            <span className="flex items-center gap-1"><FaClock size={10}/> {new Date(selectedCommit.commit.author.date).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex border-b border-gray-800 bg-[#050505]">
                        <button onClick={() => setActiveTab('CHAT')} className={`px-6 py-2 text-xs font-bold uppercase tracking-wider border-r border-gray-800 hover:bg-gray-900 ${activeTab === 'CHAT' ? 'bg-[#111] text-white border-t-2 border-t-red-600' : 'text-gray-600'}`}>./Chat_Stream</button>
                        <button onClick={() => setActiveTab('BUG')} className={`px-6 py-2 text-xs font-bold uppercase tracking-wider border-r border-gray-800 hover:bg-gray-900 ${activeTab === 'BUG' ? 'bg-[#111] text-white border-t-2 border-t-red-600' : 'text-gray-600'}`}>./Bug_Report</button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                         {activeTab === 'CHAT' && <ChatRoom repoId={id} commitHash={selectedCommit.sha} />}
                         {activeTab === 'BUG' && <BugReporter repoId={id} commitHash={selectedCommit.sha} />}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* MODALS */}
      {showTeamModal && (
          <TeamModal 
            repo={repoData.repo} 
            isOwner={repoData.repo.owner === user._id}
            currentUser={user.username}
            onClose={() => setShowTeamModal(false)}
            onUpdate={fetchRepoData}
          />
      )}
    </div>
  );
}

export default RepoView;