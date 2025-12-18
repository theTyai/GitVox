import React, { useState } from 'react';
import axios from 'axios';
import { FaUsers, FaPlus, FaCircle, FaClock, FaTimes, FaTrash } from 'react-icons/fa';

function TeamModal({ repo, onClose, onUpdate, isOwner, currentUser }) {
  const [newCollab, setNewCollab] = useState('');
  
  const handleAdd = async () => {
    try {
        await axios.post(`http://localhost:5000/api/repo/${repo._id}/collaborator`, { username: newCollab });
        onUpdate();
        setNewCollab('');
    } catch (err) { alert(err.response?.data?.error); }
  };

  const handleRemove = async (username) => {
      if(!window.confirm("Revoke access?")) return;
      await axios.delete(`http://localhost:5000/api/repo/${repo._id}/collaborator`, { data: { username } });
      onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[150] font-mono">
      <div className="bg-[#0a0a0a] border border-gray-800 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-gray-900/50 p-4 border-b border-gray-800 flex justify-between items-center">
             <div className="flex items-center gap-2 text-white font-bold uppercase tracking-widest">
                 <FaUsers className="text-gray-500"/> Team Roster
             </div>
             <button onClick={onClose} className="text-gray-500 hover:text-white"><FaTimes/></button>
        </div>

        {/* Add User */}
        {isOwner && (
            <div className="p-4 border-b border-gray-800 bg-black flex gap-2">
                <input 
                    value={newCollab}
                    onChange={e => setNewCollab(e.target.value)}
                    placeholder="GITHUB_USERNAME..."
                    className="flex-1 bg-[#111] border border-gray-700 text-white text-xs p-3 focus:border-white outline-none uppercase"
                />
                <button onClick={handleAdd} className="bg-white text-black px-4 font-bold text-xs uppercase hover:bg-gray-200">
                    <FaPlus /> Invite
                </button>
            </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 bg-[#050505] space-y-1">
            
            {/* Active Users */}
            <div className="px-2 py-1 text-[10px] text-gray-600 uppercase font-bold mt-2">Active Personnel</div>
            {repo.allowedUsers.map(u => (
                <div key={u} className="flex justify-between items-center p-3 bg-[#111] border border-transparent hover:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white border border-gray-600">
                            {u.slice(0,2).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-300 font-bold">{u}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-green-500 flex items-center gap-1 bg-green-900/20 px-2 py-0.5 rounded-full">
                            <FaCircle size={6} /> VERIFIED
                        </span>
                        {isOwner && u !== currentUser && (
                            <button onClick={() => handleRemove(u)} className="text-red-900 hover:text-red-500"><FaTrash size={10}/></button>
                        )}
                    </div>
                </div>
            ))}

            {/* Pending Users */}
            {repo.pendingUsers?.length > 0 && (
                <>
                <div className="px-2 py-1 text-[10px] text-gray-600 uppercase font-bold mt-4">Pending Authorization</div>
                {repo.pendingUsers.map(u => (
                    <div key={u} className="flex justify-between items-center p-3 bg-[#111] border border-dashed border-gray-800 opacity-70">
                        <div className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-transparent border border-dashed border-gray-600 flex items-center justify-center text-[10px] text-gray-500">
                                ?
                            </div>
                            <span className="text-sm text-gray-400">{u}</span>
                        </div>
                        <span className="text-[10px] text-yellow-600 flex items-center gap-1 border border-yellow-900/30 px-2 py-0.5">
                            <FaClock size={8} /> AWAITING
                        </span>
                    </div>
                ))}
                </>
            )}
        </div>
      </div>
    </div>
  );
}

export default TeamModal;