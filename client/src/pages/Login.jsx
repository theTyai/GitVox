import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaGithub } from 'react-icons/fa';

function Login() {
  const { login } = useContext(AuthContext);
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-mono">
      <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
        <span className="text-white">Git</span><span className="text-red-600">Vox</span>
      </h1>
      <button onClick={login} className="flex items-center gap-3 bg-gray-800 border border-gray-700 px-8 py-4 rounded-none text-xl font-bold hover:bg-gray-700 hover:border-white transition-all">
        <FaGithub /> Login with GitHub
      </button>
    </div>
  );
}
export default Login;