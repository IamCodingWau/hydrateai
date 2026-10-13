import React, { useState } from 'react';
import { Bot, RefreshCw, Cpu, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { UserSettings, AIInsightResponse } from '../types';

interface AIAssistantCardProps {
  settings: UserSettings;
  insight: AIInsightResponse | null;
  isLoading: boolean;
  onRefreshInsight: () => void;
  onSelectModel: (model: string) => void;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({
  settings,
  insight,
  isLoading,
  onRefreshInsight,
  onSelectModel,
}) => {
  const [modelSelectOpen, setModelSelectOpen] = useState(false);

  const availableModels = [
    { id: 'qwen2.5:3b', name: 'Qwen 2.5 3B', license: 'Apache-2.0', size: '1.9 GB', desc: 'Ultra-fast, perfect for laptops' },
    { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', license: 'Apache-2.0', size: '4.7 GB', desc: 'Balanced intelligence & style' },
    { id: 'mistral:7b', name: 'Mistral 7B Instruct', license: 'Apache-2.0', size: '4.1 GB', desc: 'Proven open-weight reasoning' },
    { id: 'llama3.2:3b', name: 'Llama 3.2 3B', license: 'Llama 3.2 Community', size: '2.0 GB', desc: 'Lightweight on-device AI' },
  ];

  return (
    <div className="bg-gradient-to-br from-cyan-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-cyan-800/50 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">HydrateAI Intelligence</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                Local Open-Weight
              </span>
            </div>
            <p className="text-xs text-cyan-200/80">
              Zero data leaves your machine. Powered by Ollama.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshInsight}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition disabled:opacity-50"
          title="Regenerate coaching insight"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Insight message block */}
      <div className="relative z-10 my-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm min-h-[90px] flex items-center">
        {isLoading ? (
          <div className="flex items-center gap-3 text-cyan-200 text-sm animate-pulse">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Consulting local model ({settings.aiModel})...</span>
          </div>
        ) : insight ? (
          <div className="space-y-2">
            <p className="text-sm text-cyan-50 font-medium leading-relaxed">
              "{insight.message}"
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-300/80">
              <span className="inline-flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {insight.source === 'local_ai' ? 'Model: ' + insight.modelUsed : 'Safe Local Heuristic Engine'}
              </span>
              <span>•</span>
              <span className="capitalize">{settings.aiPersonality} tone</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-cyan-200/80">
            Click refresh to generate today's hydration coaching reflection!
          </p>
        )}
      </div>

      {/* Model selector & Transparency notice */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-200/80">
        <div className="flex items-center gap-2">
          <span className="text-white/60">Active Model:</span>
          <div className="relative">
            <button
              onClick={() => setModelSelectOpen(!modelSelectOpen)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-mono text-cyan-300 border border-white/15 flex items-center gap-1.5"
            >
              <Cpu className="w-3 h-3" />
              {settings.aiModel}
            </button>

            {modelSelectOpen && (
              <div className="absolute bottom-8 left-0 w-64 bg-slate-900 border border-cyan-800 rounded-2xl p-2 shadow-2xl z-50 text-slate-200">
                <div className="text-[11px] font-bold px-2 py-1 text-cyan-400">
                  Select Local Inference Target
                </div>
                {availableModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setModelSelectOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition mb-1 ${
                      settings.aiModel === m.id
                        ? 'bg-cyan-600 text-white'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{m.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">{m.license}</span>
                    </div>
                    <div className="text-[10px] opacity-70 mt-0.5">{m.desc} ({m.size})</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-cyan-200/80">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Non-clinical assistant. Not medical advice.</span>
        </div>
      </div>
    </div>
  );
};
