import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaGithub, FaTerminal, FaCode, FaBug, FaLock, FaArrowRight, FaBolt, FaServer, FaCheckCircle, FaHdd } from 'react-icons/fa';
import Typewriter from '../components/Typewriter';
import Footer from '../components/Footer';

// Scroll Reveal Helper
const RevealOnScroll = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return <div ref={ref} className={`reveal-hidden ${isVisible ? 'reveal-visible' : ''}`}>{children}</div>;
};

function Landing() {
  const { user, login } = useContext(AuthContext);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (bootStep < 3) {
      const timer = setTimeout(() => setBootStep(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-mono flex flex-col relative overflow-x-hidden selection:bg-red-600 selection:text-white">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none opacity-30"></div>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-xl cursor-default">
            <FaTerminal className="text-red-600" />
            <span>GIT<span className="text-red-600">VOX</span></span>
          </div>
          <button 
            onClick={login}
            className="text-[10px] font-bold bg-white text-black border border-white px-5 py-2 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all uppercase tracking-widest"
          >
            Start_Session
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 z-10 max-w-7xl mx-auto w-full">
        {/* Grid: Stacks on mobile (cols-1), Side-by-side on Laptop (lg:cols-2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-red-600/50 bg-red-900/10 text-[10px] font-bold text-red-500 uppercase tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.2)]">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <Typewriter text="System v2.0 Online" speed={50} />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter text-glow">
              DEPLOY <br/>
              CONTEXT <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">INSTANTLY.</span>
            </h1>

            <div className="text-lg text-gray-300 max-w-lg border-l-4 border-red-600 pl-6 py-2 leading-relaxed">
               The terminal for modern engineering. Link discussions directly to <span className="text-white font-bold bg-red-900/30 px-1">SHA-1</span> hashes.
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <button 
                 onClick={login}
                 className="flex items-center justify-center gap-3 bg-red-700 hover:bg-red-600 text-white px-8 py-4 font-bold text-sm uppercase transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105"
               >
                 <FaGithub size={20} /> Authenticate
                 <FaArrowRight />
               </button>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="w-full bg-[#080808] border border-gray-700 rounded-sm shadow-2xl overflow-hidden min-h-[320px] hover:border-red-600 transition-colors duration-500">
             <div className="bg-[#111] border-b border-gray-800 p-2 px-4 flex justify-between items-center">
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">bash — root@gitvox</div>
             </div>
             
             <div className="p-6 font-mono text-sm space-y-3">
                <div className="text-gray-400">
                   <span className="text-red-500 mr-2">➜</span>
                   <span className="text-white">./initialize_protocol.sh</span>
                </div>
                {bootStep >= 1 && <div className="text-green-500">[ OK ] Loading kernel modules...</div>}
                {bootStep >= 2 && <div className="text-green-500">[ OK ] Mounting secure file system...</div>}
                {bootStep >= 3 && (
                   <div className="mt-4 border-t border-gray-800 pt-2">
                      <span className="text-red-500 mr-2">root@gitvox:~#</span>
                      <Typewriter text="awaiting_user_login..." speed={50} delay={1000} showCursor={true} />
                   </div>
                )}
             </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Execution Protocol) --- */}
      <section className="py-24 border-t border-gray-900 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6">
            <RevealOnScroll>
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="text-red-600 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaHdd /> Workflow
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Execution Protocol</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-800 z-0"></div>

                    <ProtocolStep 
                        step="01" 
                        title="Authenticate" 
                        desc="Login securely via GitHub OAuth. We automatically sync your public and private repositories."
                        icon={<FaGithub />}
                    />
                    <ProtocolStep 
                        step="02" 
                        title="Mount Target" 
                        desc="Select a repository from the dashboard. This creates a secure, real-time socket connection."
                        icon={<FaServer />}
                    />
                    <ProtocolStep 
                        step="03" 
                        title="Execute" 
                        desc="Click any Commit Hash to open a dedicated chat stream and bug tracker for that specific context."
                        icon={<FaTerminal />}
                    />
                </div>
            </RevealOnScroll>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 border-t border-gray-900 bg-[#080808] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
           <RevealOnScroll>
               <div className="text-red-600 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                 <FaBolt /> Capabilities
               </div>
               <h2 className="text-4xl font-black text-white mb-16 uppercase tracking-tight">Engineered for Speed.</h2>
           </RevealOnScroll>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <RevealOnScroll><FeatureCard icon={<FaCode />} title="Commit Stream" desc="Raw access to repository history. Visualize commits as a linear event stream for instant clarity." /></RevealOnScroll>
              <RevealOnScroll><FeatureCard icon={<FaBug />} title="Bug Linking" desc="Bind issue reports directly to specific commit hashes. Eliminate ambiguity in regression testing." /></RevealOnScroll>
              <RevealOnScroll><FeatureCard icon={<FaLock />} title="RBAC Security" desc="Strict permission gating. Only repository collaborators with write access can join the channel." /></RevealOnScroll>
           </div>
        </div>
      </section>

      {/* --- DEVELOPED BY SECTION --- */}
      <section className="py-24 border-t border-gray-900 bg-black">
         <div className="max-w-7xl mx-auto px-6">
            <RevealOnScroll>
                <div className="bg-[#0a0a0a] border border-gray-800 p-8 md:p-12 relative overflow-hidden group hover:border-red-900 transition-colors">
                    {/* Glowing effect on hover */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl group-hover:bg-red-900/20 transition-all"></div>

                    {/* Grid: Stacks on mobile, Side-by-side on laptop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-4 uppercase">Dev_Environment</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                "We got tired of taking screenshots of code and pasting them into Slack. 
                                GitVox was born from the need to have the conversation <span className="text-white font-bold underline decoration-red-600 underline-offset-4">where the code lives</span>."
                            </p>
                            <div className="flex gap-3">
                                <Badge label="React" />
                                <Badge label="Node.js" />
                                <Badge label="Socket.IO" />
                                <Badge label="MongoDB" />
                            </div>
                        </div>
                        
                        {/* Profile Card */}
                        <div className="bg-black border border-gray-800 p-6 shadow-2xl min-w-[280px] transform group-hover:scale-105 transition-transform duration-500">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Developer ID</span>
                                <span className="text-red-500 font-bold text-xs">#001</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-900 flex items-center justify-center text-white font-bold border border-gray-700">OP</div>
                                <div>
                                    <div className="text-white font-bold">TheTyAi</div>
                                    <div className="text-xs text-gray-500">System Architect</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                                <span>Status:</span>
                                <span className="text-green-500 font-bold">Coding...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </RevealOnScroll>
         </div>
      </section>

      <Footer />
    </div>
  );
}

// --- UI COMPONENTS ---

function ProtocolStep({ step, title, desc, icon }) {
    return (
        <div className="relative z-10 bg-black p-6 border border-gray-800 text-center hover:border-red-600 transition-colors group">
            <div className="w-12 h-12 mx-auto bg-gray-900 border border-gray-700 flex items-center justify-center text-white text-xl mb-4 group-hover:bg-red-900/20 group-hover:text-red-500 group-hover:border-red-500 transition-all">
                {icon}
            </div>
            <div className="text-red-600 font-bold text-xs uppercase tracking-widest mb-2">Step {step}</div>
            <h3 className="text-white font-bold text-lg uppercase mb-2">{title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
        </div>
    )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="h-full p-8 border border-gray-800 bg-[#080808] hover:bg-[#0c0c0c] hover:border-red-600 transition-all duration-300 group">
      <div className="text-gray-600 mb-6 group-hover:text-red-600 transition-colors text-4xl">
         {icon}
      </div>
      <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-lg">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function Badge({ label }) {
    return (
        <span className="px-3 py-1 border border-gray-700 text-xs font-bold text-gray-400 bg-gray-900/50 uppercase">
            {label}
        </span>
    )
}

export default Landing;