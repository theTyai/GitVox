import React, { useState } from 'react';
import axios from 'axios';

function BugReporter({ repoId, commitHash }) {
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState('Low');

  const report = async () => {
    try {
      await axios.post('http://localhost:5000/api/bugs', {
        repoId, commitHash, description: desc, severity
      });
      alert('Bug Reported Successfully');
      setDesc('');
    } catch (err) { alert('Error reporting bug'); }
  };

  return (
    <div className="w-1/3 bg-gray-800 rounded border border-gray-700 flex flex-col p-4">
      <h3 className="font-bold text-red-400 mb-4">Report Issue</h3>
      <textarea 
        className="flex-1 bg-gray-900 border border-gray-600 rounded p-3 text-sm text-white resize-none mb-3"
        placeholder="Describe the bug..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <select 
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
        className="bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white mb-3"
      >
        <option>Low</option>
        <option>Medium</option>
        <option>Critical</option>
      </select>
      <button onClick={report} className="bg-red-600 hover:bg-red-700 py-2 rounded font-bold text-sm">
        Submit Report
      </button>
    </div>
  );
}

export default BugReporter;