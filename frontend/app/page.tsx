'use client';

import { useState } from 'react';
import { MessageSquare, BarChart3, Layers, Github, Settings, LogOut, ChevronRight, Activity, Menu, X } from 'lucide-react';
import SentimentForm from '../components/SentimentForm';
import BatchUpload from '../components/BatchUpload';
import HistoryTable from '../components/HistoryTable';
import LanguageSelector from '../components/LanguageSelector';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'individual' | 'batch' | 'metrics'>('individual');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { id: 'individual', label: t.sidebar.individual, icon: <MessageSquare size={18} /> },
    { id: 'batch', label: t.sidebar.batch, icon: <Layers size={18} /> },
    { id: 'metrics', label: t.sidebar.metrics, icon: <BarChart3 size={18} /> },
  ];

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="px-8 mb-12 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-lg shadow-lg shadow-accent/20">
            <Activity className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tighter">
            SentimentAPI
          </h1>
        </div>
      </div>

      <nav className="space-y-2 px-4 flex-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-all duration-300 ${activeTab === item.id
              ? 'bg-sidebar-active text-white shadow-lg shadow-accent/10 font-bold scale-[1.02]'
              : 'text-muted hover:text-accent hover:bg-accent/5 font-medium'
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

      <div className="p-6 border-t border-border space-y-2 bg-sidebar/50">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-muted hover:text-accent text-sm hover:bg-card rounded-xl transition-all font-medium">
          <Settings size={18} /> {t.sidebar.settings}
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 text-muted hover:text-red-500 text-sm hover:bg-card rounded-xl transition-all font-medium">
          <LogOut size={18} /> {t.sidebar.logout}
        </button>
      </div>
    </>
  );

  return (
    <main className="flex h-screen w-full bg-background text-foreground font-sans tracking-tight overflow-hidden relative transition-colors duration-300">
      {/* Sidebar Azul Profesional (Desktop) */}
      <aside className="w-72 bg-sidebar border-r border-border hidden md:flex flex-col pt-10 shadow-sm transition-colors duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-sidebar z-50 flex flex-col pt-10 shadow-2xl md:hidden transition-colors duration-300"
            >
              <div className="absolute right-4 top-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted hover:bg-card rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="px-8 mb-12">
                <div className="flex items-center gap-3">
                  <div className="bg-accent p-2 rounded-lg shadow-lg shadow-accent/20">
                    <Activity className="text-white" size={20} />
                  </div>
                  <h1 className="text-xl font-bold text-foreground tracking-tighter">
                    SentimentAPI
                  </h1>
                </div>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-colors duration-300">
        <header className="h-20 bg-header border-b border-border px-4 md:px-10 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-muted hover:bg-card rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm md:text-lg font-bold text-foreground truncate">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="h-4 w-[1px] bg-border hidden lg:block" />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSelector />
            <ThemeSwitcher />

            <div className="hidden lg:flex items-center gap-2 bg-accent/5 px-4 py-2 rounded-full border border-accent/20">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-sm" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{t.header.model_label}: v1.0.2</span>
            </div>

            <a href="https://github.com" target="_blank" className="bg-card p-2 md:p-2.5 rounded-full text-muted hover:text-accent hover:opacity-80 transition-all border border-border shrink-0">
              <Github size={20} />
            </a>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-14 scroll-smooth bg-background">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {activeTab === 'individual' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SentimentForm
                  text={indivText}
                  setText={setIndivText}
                  result={indivResult}
                  setResult={setIndivResult}
                  error={indivError}
                  setError={setIndivError}
                />
              </motion.div>
            )}

            {activeTab === 'batch' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
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
              </motion.div>
            )}

            {activeTab === 'metrics' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full mb-10"
              >
                <HistoryTable refreshTrigger={refreshHistory} mode="full" />
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
