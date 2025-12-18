import React from 'react';
import { FaUserSecret, FaIdCard, FaTimes, FaGithub } from 'react-icons/fa';

function UserProfileModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4 font-mono">
      <div className="bg-[#0a0a0a] border border-red-900 w-full max-w-sm shadow-[0_0_50px_rgba(220,38,38,0.2)] relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-red-900/10 p-4 border-b border-red-900 flex justify-between items-center">
           <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs">
              <FaIdCard /> Identity Record
           </div>
           <button onClick={onClose} className="text-gray-500 hover:text-white"><FaTimes /></button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center relative z-10">
           <div className="w-24 h-24 border-2 border-red-600 rounded-sm p-1 mb-4 relative">
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all" />
              <div className="absolute -bottom-2 -right-2 bg-black text-red-500 text-[10px] border border-red-600 px-1 font-bold">
                 LIVE
              </div>
           </div>

           <h2 className="text-xl font-bold text-white uppercase tracking-tight">{user.displayName || user.username}</h2>
           <p className="text-red-500 text-xs uppercase tracking-widest mb-6">@{user.username}</p>

           <div className="w-full space-y-3 text-left">
              <div className="bg-black border border-gray-800 p-3 flex justify-between items-center">
                 <span className="text-[10px] text-gray-500 uppercase">Role / Class</span>
                 <span className="text-xs text-gray-300 font-bold">{user.profession || 'Unknown Agent'}</span>
              </div>
              <div className="bg-black border border-gray-800 p-3 flex justify-between items-center">
                 <span className="text-[10px] text-gray-500 uppercase">Git ID</span>
                 <span className="text-xs text-gray-300 font-bold">{user.githubId}</span>
              </div>
              <div className="bg-black border border-gray-800 p-3 flex justify-between items-center">
                 <span className="text-[10px] text-gray-500 uppercase">Clearance</span>
                 <span className="text-xs text-green-500 font-bold animate-pulse">AUTHORIZED</span>
              </div>
           </div>
        </div>

        {/* Scanlines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
      </div>
    </div>
  );
}

export default UserProfileModal;