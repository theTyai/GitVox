import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';
import BugReporter from '../components/BugReporter';

function RepoView() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [repoData, setRepoData] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [collaborator, setCollaborator] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/repo/${id}`)
      .then(res => setRepoData(res.data))
      .catch(err => alert("Access Denied or Error"));
  }, [id]);

  const addCollaborator = async () => {
    try {
      await axios.post(`http://localhost:5000/api/repo/${id}/collaborator`, { username: collaborator });
      alert("Added!");
      setCollaborator('');
    } catch (err) { alert(err.response.data.error); }
  };

  if (!repoData) return <div className="text-white p-8">Loading or Unauthorized...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar: Commits */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="font-bold text-lg">{repoData.repo.name}</h2>
          
          {/* Add Collaborator (Only Owner) */}
          {repoData.repo.owner === user._id && (
            <div className="mt-4 flex gap-2">
              <input 
                value={collaborator}
                onChange={(e) => setCollaborator(e.target.value)}
                placeholder="Add friend (GitHub ID)"
                className="w-full bg-gray-900 p-2 rounded text-xs"
              />
              <button onClick={addCollaborator} className="bg-green-600 px-3 rounded text-xs font-bold">+</button>
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {repoData.commits.map(c => (
             <div 
               key={c.sha}
               onClick={() => setSelectedCommit(c)}
               className={`p-3 rounded cursor-pointer border transition ${selectedCommit?.sha === c.sha ? 'border-purple-500 bg-gray-800' : 'border-gray-700 hover:bg-gray-800'}`}
             >
               <p className="text-xs text-purple-400 font-mono mb-1">{c.sha.substring(0,7)}</p>
               <p className="text-sm truncate">{c.commit.message}</p>
             </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        {selectedCommit ? (
           <div className="flex-1 flex flex-col p-4 gap-4 h-full">
             <div className="bg-gray-800 p-4 rounded border border-gray-700">
               <h2 className="font-bold text-xl">{selectedCommit.commit.message}</h2>
               <p className="text-sm text-gray-400">{selectedCommit.commit.author.name}</p>
             </div>
             
             <div className="flex-1 flex gap-4 overflow-hidden">
                <ChatRoom repoId={id} commitHash={selectedCommit.sha} />
                <BugReporter repoId={id} commitHash={selectedCommit.sha} />
             </div>
           </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a commit to start collaborating
          </div>
        )}
      </div>
    </div>
  );
}

export default RepoView;