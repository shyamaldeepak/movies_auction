import React, { useState, useRef } from 'react';
import { X, User, Upload, Image as ImageIcon, Check, LogOut, Trophy, Award, DollarSign, Film } from 'lucide-react';
import { authService } from '../services/auth/authService';
import { UserAccount } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
}

const EMOJI_AVATARS = ['👑', '🎭', '💥', '🏔️', '🎬', '🚀', '🦁', '🌟', '🎪', '🍿', '🔥', '⚡'];
const BRAND_COLORS = ['#d97706', '#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#ec4899'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser?.name || 'Deepak Shyamal');
  const [email, setEmail] = useState(currentUser?.email || 'deepakshyamal11@gmail.com');
  const [studioName, setStudioName] = useState(currentUser?.studioName || 'Apex Motion Pictures');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [avatarEmoji, setAvatarEmoji] = useState(currentUser?.avatarEmoji || '👑');
  const [brandColor, setBrandColor] = useState(currentUser?.brandColor || '#d97706');

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMsg('Image must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        setStatusMsg('Custom image loaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      setAvatarUrl(imageUrlInput.trim());
      setImageUrlInput('');
      setStatusMsg('Custom image URL applied!');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateProfile({
      name,
      email,
      studioName,
      avatarUrl,
      avatarEmoji,
      brandColor,
    });
    onUserChange(authService.getCurrentUser());
    setStatusMsg('Profile and Studio Identity saved!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleLogout = () => {
    authService.logout();
    onUserChange(null);
    onClose();
  };

  const stats = currentUser?.stats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#10141e] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141824]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Executive Studio Profile
              </h2>
              <p className="text-xs text-slate-400">
                Manage your credentials, custom avatar image, and studio identity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Executive Stats Card (if available) */}
          {stats && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#141824] to-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-2">
                Lifetime Career Record
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Auctions</span>
                  <span className="font-mono text-sm font-bold text-white">{stats.auctionsPlayed}</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Trophies</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">{stats.auctionsWon}</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Gross ($M)</span>
                  <span className="font-mono text-sm font-bold text-amber-400">${stats.totalBoxOfficeGrossM}M</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40">
                  <span className="text-[10px] text-slate-400 block">Avg Grade</span>
                  <span className="font-mono text-sm font-bold text-purple-400">{stats.averageGrade}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Custom Avatar Upload Section */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Studio Avatar & Logo (Custom Image Upload)
              </label>

              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/40 bg-black/60 flex items-center justify-center shrink-0 shadow-lg relative group"
                  style={{ backgroundColor: brandColor }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{avatarEmoji}</span>
                  )}
                </div>

                {/* Upload Buttons */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Image File
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Reset to Emoji
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Or paste image URL */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#0b0e14] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyImageUrl}
                      disabled={!imageUrlInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Emoji Avatar Selector */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Or Choose Iconic Emoji Emblem</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {EMOJI_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setAvatarEmoji(emoji);
                      setAvatarUrl('');
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-transform cursor-pointer ${
                      avatarEmoji === emoji && !avatarUrl
                        ? 'bg-amber-500/20 border-2 border-amber-400 scale-110'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: Name, Email, Studio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0b0e14] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0b0e14] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Studio Name</label>
              <input
                type="text"
                required
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0b0e14] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Brand Color */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Studio Brand Color</label>
              <div className="flex items-center gap-2">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      brandColor === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs text-emerald-300">
                {statusMsg}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out / Reset
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                Save Studio Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
