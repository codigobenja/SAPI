'use client';

import { useState } from 'react';
import { MessageSquare, BarChart3, Layers, Github, Settings, LogOut, ChevronRight, Activity } from 'lucide-react';
import SentimentForm from '../components/SentimentForm';
import BatchUpload from '../components/BatchUpload';
import HistoryTable from '../components/HistoryTable';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'individual' | 'batch' | 'metrics'>('individual');
  const [refreshHistory, setRefreshHistory] = useState(0);

  // Lifted state for BatchUpload persistence
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchSummary, setBatchSummary] = useState<any | null>(null);
  const [batchSessionItems, setBatchSessionItems] = useState<any[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);

  // Lifted state for SentimentForm persistence
  const [indivText, setIndivText] = useState('');
  const [indivResult, setIndivResult] = useState<any | null>(null);
  const [indivError, setIndivError] = useState<string | null>(null);

  const sidebarItems = [
    { id: 'individual', label: 'Análisis de Texto', icon: <MessageSquare size={18} /> },
    { id: 'batch', label: 'Análisis Masivo', icon: <Layers size={18} /> },
    { id: 'metrics', label: 'Métricas / Historial', icon: <BarChart3 size={18} /> },
  ];

  return (
    <main className="flex h-screen w-full bg-slate-50 text-slate-700 font-sans tracking-tight overflow-hidden">
      {/* Sidebar Azul Profesional */}
      <aside className="w-72 bg-white border-r border-blue-100 flex flex-col pt-10 shadow-sm">
        <div className="px-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <Activity className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tighter">
              SentimentAPI
            </h1>
          </div>
        </div>

        <nav className="space-y-2 px-4 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-all duration-300 ${activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 font-bold scale-[1.02]'
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 font-medium'
                }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={16} className="text-blue-200" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-blue-50 space-y-2 bg-blue-50/20">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-blue-600 text-sm hover:bg-white rounded-xl transition-all font-medium">
            <Settings size={18} /> Configuración
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 text-sm hover:bg-white rounded-xl transition-all font-medium">
            <LogOut size={18} /> Salir del Sistema
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-blue-100 px-10 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modelo DS: LOGISTIC_REGRESSION_V1</span>
            </div>
            <a href="https://github.com" target="_blank" className="bg-slate-50 p-2.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100">
              <Github size={20} />
            </a>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 lg:p-14 scroll-smooth">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            {activeTab === 'individual' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SentimentForm
                  text={indivText}
                  setText={setIndivText}
                  result={indivResult}
                  setResult={setIndivResult}
                  error={indivError}
                  setError={setIndivError}
                />
              </div>
            )}

            {activeTab === 'batch' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                <BatchUpload
                  onProcessingComplete={() => setRefreshHistory(p => p + 1)}
                  file={batchFile}
                  setFile={setBatchFile}
                  summary={batchSummary}
                  setSummary={setBatchSummary}
                  sessionItems={batchSessionItems}
                  setSessionItems={setBatchSessionItems}
                  progress={batchProgress}
                  setProgress={setBatchProgress}
                />
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mb-10">
                <HistoryTable refreshTrigger={refreshHistory} mode="full" />
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
