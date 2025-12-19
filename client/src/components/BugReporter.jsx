import React, { useState } from 'react';
import axios from 'axios';
import { FaBug, FaExclamationTriangle } from 'react-icons/fa';

function BugReporter({ repoId, commitHash }) {
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState('Low');
  const [status, setStatus] = useState('');

  const report = async () => {
    try {
      setStatus('TRANSMITTING...');
      await axios.post('http://gitvox.onrender.com/api/bugs', { repoId, commitHash, description: desc, severity });
      setStatus('SUCCESS: TICKET_LOGGED');
      setDesc('');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) { setStatus('ERROR: CONNECTION_REFUSED'); }
  };

  return (
    <div className="h-full bg-black p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg border border-red-900 bg-[#050505] p-1 shadow-[0_0_20px_rgba(220,38,38,0.1)]">
         <div className="bg-red-900/20 border-b border-red-900 p-2 flex items-center gap-2 text-red-500 font-bold text-xs uppercase">
            <FaBug /> Bug Tracker Interface
         </div>
         
         <div className="p-6 flex flex-col gap-4">
            <div>
                <label className="block text-[10px] text-gray-500 uppercase mb-1">Target Hash</label>
                <input disabled value={commitHash} className="w-full bg-[#111] border border-gray-800 text-gray-500 text-xs p-2 font-mono" />
            </div>

            <div>
                <label className="block text-[10px] text-gray-500 uppercase mb-1">Log Description</label>
                <textarea 
                    className="w-full h-32 bg-black border border-gray-700 text-gray-300 text-sm p-3 font-mono focus:border-red-600 focus:outline-none resize-none"
                    placeholder="Describe the regression..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-[10px] text-gray-500 uppercase mb-1">Severity Level</label>
                <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-white text-sm p-2 font-mono focus:border-red-600 focus:outline-none"
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>Critical</option>
                </select>
            </div>

            <button 
                onClick={report}
                className="mt-2 bg-red-700 hover:bg-red-600 text-white py-3 font-bold text-xs uppercase tracking-widest transition border border-red-900 flex items-center justify-center gap-2"
            >
                <FaExclamationTriangle /> Submit Report
            </button>

            {status && (
                <div className={`text-center text-xs font-mono border p-1 ${status.includes('ERROR') ? 'border-red-500 text-red-500' : 'border-green-800 text-green-500'}`}>
                    {status}
                </div>
            )}
         </div>
      </div>
    </div>
  );
}

export default BugReporter;