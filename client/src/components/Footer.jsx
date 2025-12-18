import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaTerminal, FaCircle, FaHeart, FaInstagram } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="w-full bg-[#020202] border-t border-red-900/30 pt-12 pb-8 mt-auto z-10 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* MAIN CONTENT WRAPPER: Stacks on mobile, Side-by-side on laptop */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-12">
            
            {/* LEFT BOX: BRANDING & SIGNATURE */}
            <div className="w-full md:w-auto space-y-6">
                <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-2xl">
                    <FaTerminal className="text-red-600"/> GIT<span className="text-red-600">VOX</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                    The contextual communication layer for distributed engineering teams. 
                    Link discussions directly to <span className="text-gray-300 font-bold">SHA-1</span> hashes.
                </p>
                
                {/* THE TYAI SIGNATURE BLOCK */}
                <div className="inline-flex items-center gap-4 p-4 border border-gray-800 bg-[#080808] hover:border-red-900/50 transition-colors group w-full md:w-auto">
                    <div className="w-10 h-10 bg-black border border-gray-700 flex items-center justify-center text-white font-bold text-xs group-hover:text-red-500 group-hover:border-red-500 transition-all">
                        TY
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Architected By</div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                            TheTyAi <span className="text-red-600 text-[10px] bg-red-900/10 px-1 border border-red-900/30">FOR DEBUGGERS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT BOX: SOCIALS & STATUS */}
            <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-6">
                
                {/* System Status */}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-green-500 bg-green-900/10 px-3 py-1 border border-green-900/30 rounded-full">
                    <FaCircle size={6} className="animate-pulse"/> All Systems Operational
                </div>

                {/* Social Links */}
                <div className="flex gap-6 text-gray-400">
                    <a href="https://github.com/theTyai" className="flex items-center gap-2 hover:text-white transition-colors group">
                        <FaGithub size={18} className="group-hover:scale-110 transition-transform"/> 
                        <span className="text-xs uppercase font-bold tracking-wider">GitHub</span>
                    </a>
                    <a href="https://www.instagram.com/theTyai" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                        <FaInstagram size={18} className="group-hover:scale-110 transition-transform"/>
                        <span className="text-xs uppercase font-bold tracking-wider">Instagram</span>
                    </a>
                    <a href="https://www.linkedin.com/in/thetyai/" className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                        <FaLinkedin size={18} className="group-hover:scale-110 transition-transform"/>
                        <span className="text-xs uppercase font-bold tracking-wider">LinkedIn</span>
                    </a>
                </div>
            </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-gray-600">
            <div>© 2025 GitVox Systems Inc. All Rights Reserved.</div>
            <div className="flex items-center gap-1">
                Made with <FaHeart className="text-red-900 animate-pulse" /> in Code
            </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;