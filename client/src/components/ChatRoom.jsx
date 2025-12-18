import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { BASE_URL } from '../api'; // Import the dynamic URL
import { FaTerminal } from 'react-icons/fa';

// Initialize socket outside component to prevent multiple instances
const socket = io(BASE_URL, { 
    withCredentials: true, 
    autoConnect: false,
    transports: ['websocket', 'polling']
});

function ChatRoom({ repoId, commitHash }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    // 1. Connect
    socket.connect();
    
    // 2. Join the specific commit room
    socket.emit('join_commit', { commitHash, repoId });

    // 3. Listen for incoming messages
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      // Auto-scroll to bottom
      setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    socket.on('receive_message', handleReceiveMessage);

    // 4. Cleanup on unmount
    return () => { 
        socket.off('receive_message', handleReceiveMessage); 
        socket.disconnect(); 
    };
  }, [commitHash, repoId]);

  const sendMessage = () => {
    if(!input.trim()) return;
    
    // Emit message to server
    socket.emit('send_message', { 
        commitHash, 
        repoId, 
        message: input 
    });
    
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {messages.length === 0 && (
            <div className="text-gray-700 text-xs font-mono mt-4">
                [SYSTEM] Channel open. No previous traffic.
            </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className="group hover:bg-[#111] p-1 -mx-2 px-2 rounded-sm flex items-start gap-2 text-sm">
             <span className="text-gray-500 text-[10px] w-12 pt-1 font-mono">
                {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
             <span className="font-bold text-red-600 text-xs pt-0.5">
                &lt;{m.sender.username}&gt;
             </span>
             <span className="text-gray-300 font-mono break-all">
                {m.message}
             </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-[#111] border-t border-gray-800">
        <div className="flex items-center gap-2 bg-black border border-gray-700 p-2 focus-within:border-red-600 transition-colors">
            <span className="text-red-500 font-bold text-xs">user@gitvox:$</span>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              autoFocus
              className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none placeholder-gray-700"
              placeholder="./send_message..."
            />
        </div>
        <div className="text-[9px] text-gray-600 mt-1 uppercase text-right">Encrypted Transmission // Socket.IO Secure</div>
      </div>
    </div>
  );
}

export default ChatRoom;