import React, { useEffect, useState } from 'react';
import api from '../api'; // Use centralized API
import { useNavigate } from 'react-router-dom';

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/api/activity/feed');
        setActivities(res.data);
      } catch (e) {}
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-gray-900 h-full flex flex-col">
      <div className="p-3 border-b border-gray-900 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
         <span>System Logs</span>
         <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activities.length === 0 && <div className="text-gray-700 text-xs">No recent events.</div>}
        
        {activities.map((act, i) => (
          <div 
            key={i} 
            onClick={() => navigate(act.link)}
            className="cursor-pointer group"
          >
            <div className="flex justify-between text-[10px] text-gray-600 font-mono mb-1">
                <span>{act.user}</span>
                <span>{new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="text-xs text-gray-400 group-hover:text-white transition-colors mb-1">
                <span className="text-gray-600 mr-2">&gt;</span>
                {act.type === 'BUG' ? <span className="text-red-400">BUG: </span> : ''}
                {act.message}
            </div>
            <div className="text-[9px] text-gray-700 truncate">
                {act.repoName} @ {act.hash.substring(0,7)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityFeed;