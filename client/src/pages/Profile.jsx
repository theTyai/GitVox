import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FaGithub, FaSave, FaHistory, FaBug, FaComment } from 'react-icons/fa';

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [profession, setProfession] = useState(user.profession || '');
  const [myActivity, setMyActivity] = useState([]); // User specific history
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Fetch only THIS user's activity
  useEffect(() => {
    // We reuse the feed logic but would ideally filter by user ID on backend
    // For now, let's just fetch the global feed and filter locally for simplicity
    axios.get('http://localhost:5000/api/activity/feed')
         .then(res => {
            const mine = res.data.filter(a => a.user === user.username);
            setMyActivity(mine);
         })
         .catch(e => console.error(e));
  }, [user.username]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/user/update', { displayName, profession });
      setUser({ ...user, displayName, profession });
      setMsg('SUCCESS: PROFILE_UPDATED');
    } catch (err) { setMsg('ERROR: UPDATE_FAILED'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono">
      <Navbar onAddRepo={() => {}} />
      
      <div className="max-w-6xl mx-auto mt-8 p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COL: EDIT PROFILE */}
        <div className="md:col-span-1">
            <div className="bg-black border border-gray-800 p-6 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
              <div className="flex flex-col items-center mb-6">
                <img src={user.avatarUrl} className="w-32 h-32 rounded-none border-2 border-red-600 mb-4 p-1" />
                <h2 className="text-xl font-bold text-white uppercase">{user.username}</h2>
                <div className="text-xs text-red-500 mt-1">ID: {user.githubId}</div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Display Name</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Role / Class</label>
                  <input value={profession} onChange={e => setProfession(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-2 text-white focus:border-red-500 outline-none" />
                </div>
                
                {msg && <p className="text-xs text-red-400 text-center border border-red-900 p-1">{msg}</p>}

                <button disabled={loading} className="w-full bg-red-700 hover:bg-red-600 text-white py-2 font-bold text-sm uppercase transition">
                  {loading ? 'Processing...' : 'Save Configuration'}
                </button>
              </form>
            </div>
        </div>

        {/* RIGHT COL: MY CONTRIBUTIONS */}
        <div className="md:col-span-2">
            <div className="border border-gray-800 min-h-[400px]">
                <div className="bg-gray-900 p-3 border-b border-gray-800 flex items-center gap-2 text-sm font-bold text-gray-300">
                    <FaHistory className="text-red-500" />
                    USER_CONTRIBUTION_LOG
                </div>
                <div className="p-4 space-y-3">
                    {myActivity.length === 0 ? (
                        <div className="text-gray-600 text-sm font-mono p-4">No recent operations logged.</div>
                    ) : (
                        myActivity.map((act, i) => (
                            <div key={i} className="flex gap-4 p-3 border-b border-gray-900 hover:bg-gray-900/50 transition">
                                <div className="text-lg text-gray-600">
                                    {act.type === 'CHAT' ? <FaComment /> : <FaBug className="text-red-500"/>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs bg-gray-800 px-1 text-gray-400">{act.repoName}</span>
                                        <span className="text-xs text-gray-600 font-mono">{act.hash.substring(0,7)}</span>
                                        <span className="text-[10px] text-gray-700 ml-auto">{new Date(act.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{act.message}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;