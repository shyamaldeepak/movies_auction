import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ClusterStatusModal } from './components/ClusterStatusModal';
import { GroqConfigModal } from './components/GroqConfigModal';
import { AuctionRoomPage } from './pages/AuctionRoomPage';
import { MovieDirectoryPage } from './pages/MovieDirectoryPage';
import { PostAuctionPage } from './pages/PostAuctionPage';
import { groqEvaluator } from './services/ai/groqEvaluator';

export const App: React.FC = () => {
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [isGroqModalOpen, setIsGroqModalOpen] = useState(false);
  const [isGroqConfigured, setIsGroqConfigured] = useState(() => {
    const config = groqEvaluator.getConfig();
    return Boolean(config.apiKey && config.apiKey.trim().length > 5);
  });

  const handleGroqSaved = () => {
    const config = groqEvaluator.getConfig();
    setIsGroqConfigured(Boolean(config.apiKey && config.apiKey.trim().length > 5));
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
        <Navbar
          onOpenClusterModal={() => setIsClusterModalOpen(true)}
          onOpenGroqModal={() => setIsGroqModalOpen(true)}
          isGroqConfigured={isGroqConfigured}
        />

        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<AuctionRoomPage />} />
            <Route path="/directory" element={<MovieDirectoryPage />} />
            <Route path="/slate" element={<PostAuctionPage />} />
          </Routes>
        </main>

        <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500 bg-[#07090d]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
            <span>CINEMA DRAFT • REACT 19 + VITE 6 + REACT ROUTER 7</span>
            <span>7-SERVER RTDB CLUSTER • CLOUDFLARE D1 • GROQ QWEN AI</span>
          </div>
        </footer>

        {/* Global Cluster Monitor Modal */}
        <ClusterStatusModal
          isOpen={isClusterModalOpen}
          onClose={() => setIsClusterModalOpen(false)}
        />

        {/* Groq Cloud API Config Modal */}
        <GroqConfigModal
          isOpen={isGroqModalOpen}
          onClose={() => setIsGroqModalOpen(false)}
          onSaved={handleGroqSaved}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;

