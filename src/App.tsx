import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ClusterStatusModal } from './components/ClusterStatusModal';
import { GroqConfigModal } from './components/GroqConfigModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { AuctionRoomPage } from './pages/AuctionRoomPage';
import { MovieDirectoryPage } from './pages/MovieDirectoryPage';
import { PostAuctionPage } from './pages/PostAuctionPage';
import { groqEvaluator } from './services/ai/groqEvaluator';
import { StudioPlayer } from './types/auction';
import { multiplayerService } from './services/biddingEngine/multiplayerService';

const DEFAULT_USER_STUDIO: StudioPlayer = {
  id: `studio-${Math.random().toString(36).substring(2, 7)}`,
  name: 'Apex Motion Pictures',
  logo: '👑',
  color: '#d97706',
  isHuman: true,
  budget: 150,
  initialBudget: 150,
  acquiredMovies: [],
  isReady: true,
};

const AppContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [isGroqModalOpen, setIsGroqModalOpen] = useState(false);
  const [isMultiplayerModalOpen, setIsMultiplayerModalOpen] = useState(false);
  const [initialRoomCode, setInitialRoomCode] = useState('');

  const [currentUserStudio, setCurrentUserStudio] = useState<StudioPlayer>(() => {
    try {
      const saved = localStorage.getItem('cinema_user_studio_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_STUDIO;
    } catch {
      return DEFAULT_USER_STUDIO;
    }
  });

  const [isGroqConfigured, setIsGroqConfigured] = useState(() => {
    const config = groqEvaluator.getConfig();
    return Boolean(config.apiKey && config.apiKey.trim().length > 5);
  });

  useEffect(() => {
    multiplayerService.setLocalStudio(currentUserStudio);
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setInitialRoomCode(roomParam);
      setIsMultiplayerModalOpen(true);
    }
  }, [searchParams]);

  const handleUpdateStudio = (updated: StudioPlayer) => {
    setCurrentUserStudio(updated);
    multiplayerService.setLocalStudio(updated);
    try {
      localStorage.setItem('cinema_user_studio_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleGroqSaved = () => {
    const config = groqEvaluator.getConfig();
    setIsGroqConfigured(Boolean(config.apiKey && config.apiKey.trim().length > 5));
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenClusterModal={() => setIsClusterModalOpen(true)}
        onOpenGroqModal={() => setIsGroqModalOpen(true)}
        onOpenMultiplayerModal={() => setIsMultiplayerModalOpen(true)}
        isGroqConfigured={isGroqConfigured}
      />

      <main className="flex-1 pb-16">
        <Routes>
          <Route
            path="/"
            element={
              <AuctionRoomPage
                onOpenMultiplayerModal={() => setIsMultiplayerModalOpen(true)}
                currentUserStudio={currentUserStudio}
              />
            }
          />
          <Route path="/directory" element={<MovieDirectoryPage />} />
          <Route path="/slate" element={<PostAuctionPage />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500 bg-[#07090d]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <span>CINEMA DRAFT • REACT 19 + VITE 6 + REACT ROUTER 7</span>
          <span>WEBRTC P2P ONLINE MULTIPLAYER • 7-SERVER RTDB CLUSTER • CLOUDFLARE D1 • GROQ QWEN AI</span>
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

      {/* Online Multiplayer Modal */}
      <MultiplayerModal
        isOpen={isMultiplayerModalOpen}
        onClose={() => setIsMultiplayerModalOpen(false)}
        currentStudio={currentUserStudio}
        onUpdateStudio={handleUpdateStudio}
        initialRoomCode={initialRoomCode}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
