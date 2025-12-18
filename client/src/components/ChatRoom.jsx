import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', { withCredentials: true, autoConnect: false });

function ChatRoom({ repoId, commitHash }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join_commit', { commitHash, repoId });
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => { socket.off('receive_message'); socket.disconnect(); };
  }, [commitHash, repoId]);

  const sendMessage = () => {
    if(!input.trim()) return;
    socket.emit('send_message', { commitHash, repoId, message: input });
    setInput('');
  };

  return (
    <div className="flex-1 bg-gray-800 rounded border border-gray-700 flex flex-col">
      <div className="p-3 border-b border-gray-700 font-bold text-gray-300">Discussion</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className="flex gap-3">
             <img src={m.sender.avatarUrl} className="w-8 h-8 rounded-full" />
             <div>
               <div className="flex items-baseline gap-2">
                 <span className="font-bold text-sm text-purple-400">{m.sender.username}</span>
                 <span className="text-xs text-gray-500">{m.sender.profession}</span>
               </div>
               <p className="text-gray-200 text-sm">{m.message}</p>
             </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-gray-700">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none"/>
      </div>
    </div>
  );
}
export default ChatRoom;