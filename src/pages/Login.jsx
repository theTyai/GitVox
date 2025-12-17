import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaGithub } from 'react-icons/fa';

function Login() {
  const { login } = useContext(AuthContext);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">GitVox</h1>
      <p className="mb-8 text-gray-400">Collaborate on Code. Contextually.</p>
      <button 
        onClick={login}
        className="flex items-center gap-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 px-8 py-4 rounded-xl text-xl font-bold transition-all"
      >
        <FaGithub size={24} /> Login with GitHub
      </button>
    </div>
  );
}

export default Login;