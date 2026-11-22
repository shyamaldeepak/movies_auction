import React, { useState } from 'react';
import { X, Cpu, Key, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { groqEvaluator } from '../services/ai/groqEvaluator';
import { GroqConfig } from '../types/groq';

interface GroqConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SUPPORTED_MODELS = [
  { id: 'qwen/qwen-2.5-32b-it', name: 'Qwen 2.5 32B (Recommended for Hollywood Slate ROI)' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (Requested High-Precision Model)' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B' },
];

export const GroqConfigModal: React.FC<GroqConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [currentConfig, setCurrentConfig] = useState<GroqConfig>(() => groqEvaluator.getConfig());
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [model, setModel] = useState(currentConfig.model || 'qwen/qwen-2.5-32b-it');
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: GroqConfig = {
      apiKey: apiKey.trim(),
      model,
      temperature: 0.2,
    };
    groqEvaluator.saveConfig(updated);
    setCurrentConfig(updated);
    setStatusMessage({ type: 'success', text: 'Groq configuration saved securely in local storage!' });
    setTimeout(() => {
      onSaved();
      onClose();
    }, 800);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Groq API key (starts with gsk_)' });
      return;
    }

    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`
        }
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Groq API Key verified successfully!' });
      } else {
        const error = await res.json();
        setStatusMessage({ type: 'error', text: error.error?.message || 'Invalid API Key' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Connection error: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    groqEvaluator.saveConfig({ apiKey: '', model: 'qwen/qwen-2.5-32b-it', temperature: 0.2 });
    setStatusMessage({ type: 'success', text: 'Groq key cleared. Default Hollywood ROI engine active.' });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#10141d] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141824]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Groq Cloud AI Engine Setup
              </h2>
              <p className="text-xs text-slate-400">
                Strict JSON Schema Slate & Box Office Forecasting
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200/90 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Powers the post-auction Hollywood Studio Scorecard, Box Office ROI forecast, and Academy Award predictions via <strong>Groq Cloud API</strong> with strict Zod JSON schema validation.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Groq API Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm font-mono"
              />
              <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Your key is stored strictly in your browser's LocalStorage and never shared.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Groq Model Selection
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white focus:outline-none focus:border-purple-500 text-sm"
            >
              {SUPPORTED_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#10141d]">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear Key
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing || !apiKey.trim()}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

