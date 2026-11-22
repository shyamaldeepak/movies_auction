import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ClusterStatusModal } from './components/ClusterStatusModal';
import { GroqConfigModal } from './components/GroqConfigModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { GameRulesModal } from './components/GameRulesModal';
import { AuthModal } from './components/AuthModal';
import { AuctionRoomPage } from './pages/AuctionRoomPage';
import { MovieDirectoryPage } from './pages/MovieDirectoryPage';
import { PostAuctionPage } from './pages/PostAuctionPage';
import { groqEvaluator } from './services/ai/groqEvaluator';
import { authService } from './services/auth/authService';
import { StudioPlayer } from './types/auction';
import { UserAccount } from './types/auth';
import { multiplayerService } from './services/biddingEngine/multiplayerService';

const buildStudioFromUser = (user: UserAccount | null): StudioPlayer => {
  if (user) {
    return {
      id: user.id,
      name: user.studioName || `${user.name} Pictures`,
      logo: user.avatarEmoji || '👑',
      customAvatarUrl: user.avatarUrl || undefined,
      color: user.brandColor || '#d97706',
      isHuman: true,
      budget: 150,
      initialBudget: 150,
      acquiredMovies: [],
      isReady: true,
    };
  }

  return {
    id: 'studio-user',
    name: 'Apex Motion Pictures',
    logo: '👑',
    color: '#d97706',
    isHuman: true,
    budget: 150,
    initialBudget: 150,
    acquiredMovies: [],
    isReady: true,
  };
};

const AppContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [isGroqModalOpen, setIsGroqModalOpen] = useState(false);
  const [isMultiplayerModalOpen, setIsMultiplayerModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialRoomCode, setInitialRoomCode] = useState('');

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [currentUserStudio, setCurrentUserStudio] = useState<StudioPlayer>(() => buildStudioFromUser(currentUser));

  const [isGroqConfigured, setIsGroqConfigured] = useState(() => {
    const config = groqEvaluator.getConfig();
    return Boolean(config.apiKey && config.apiKey.trim().length > 5);
  });

  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
      const studio = buildStudioFromUser(user);
      setCurrentUserStudio(studio);
      multiplayerService.setLocalStudio(studio);
    });
    return unsub;
  }, []);

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
    authService.updateProfile({
      studioName: updated.name,
      avatarEmoji: updated.logo,
      avatarUrl: updated.customAvatarUrl || '',
      brandColor: updated.color,
    });
  };

  const handleUserChange = (user: UserAccount | null) => {
    setCurrentUser(user);
    const studio = buildStudioFromUser(user);
    setCurrentUserStudio(studio);
    multiplayerService.setLocalStudio(studio);
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
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isGroqConfigured={isGroqConfigured}
      />

      <main className="flex-1 pb-16">
        <Routes>
          <Route
            path="/"
            element={
              <AuctionRoomPage
                onOpenMultiplayerModal={() => setIsMultiplayerModalOpen(true)}
                onOpenRulesModal={() => setIsRulesModalOpen(true)}
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
          <span>IMDb TOP 250 LEGENDS • WEBRTC P2P MULTIPLAYER • CLOUDFLARE D1 • GROQ QWEN AI</span>
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

      {/* Official Game Rules Modal */}
      <GameRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Executive Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
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
