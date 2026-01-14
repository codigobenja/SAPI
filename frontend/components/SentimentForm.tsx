'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles, AlertCircle, MessageSquare, RotateCcw } from 'lucide-react';
import { analyzeSentiment, SentimentResponse } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface SentimentFormProps {
    text: string;
    setText: (text: string) => void;
    result: SentimentResponse | null;
    setResult: (result: SentimentResponse | null) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

export default function SentimentForm({
    text,
    setText,
    result,
    setResult,
    error,
    setError
}: SentimentFormProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await analyzeSentiment(text);
            setResult(res);
        } catch (err) {
            setError(t.form.error_conn);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full ${result ? 'max-w-6xl' : 'max-w-3xl'} mx-auto`}>
            {/* Header section */}
            <AnimatePresence>
                {!result && (
                    <motion.div
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="flex items-center gap-4 mb-8 overflow-hidden"
                    >
                        <div className="bg-accent/10 p-3 rounded-2xl text-accent flex-shrink-0">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                {t.form.title}
                            </h2>
                            <p className="text-muted text-sm font-medium">
                                {t.form.desc}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-2 lg:gap-8' : ''} items-stretch`}>

                {/* Form Section */}
                <motion.div
                    layout
                    className="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl shadow-accent/5 h-full flex flex-col justify-between"
                >
                    <div className="space-y-6">
                        {result && (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-1 h-5 bg-accent rounded-full" />
                                <span className="font-bold text-foreground text-sm tracking-tight uppercase">{t.form.new_query}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={t.form.placeholder}
                                    className={`w-full ${result ? 'h-52' : 'h-44'} p-6 bg-accent/5 focus:bg-card border-2 border-transparent rounded-[2rem] focus:border-accent outline-none resize-none text-lg text-foreground placeholder:text-muted/50 font-medium`}
                                    required
                                />
                                <div className="absolute bottom-6 right-6 text-[10px] text-muted font-bold uppercase tracking-widest bg-card/50 px-3 py-1 rounded-full backdrop-blur-sm border border-border">
                                    {text.length} {t.form.char_count}
                                </div>
                            </div>

                            <div className="flex justify-end items-center">
                                <button
                                    type="submit"
                                    disabled={loading || !text.trim()}
                                    className="px-10 py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 disabled:bg-muted/10 disabled:text-muted/40 transition-all shadow-lg shadow-accent/20 flex items-center gap-2 transform active:scale-95 whitespace-nowrap"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin text-white" /> {t.form.analyzing}
                                        </>
                                    ) : (
                                        <>
                                            {t.form.submit} <Send size={18} className="text-white/80" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-500/10 text-red-500 px-6 py-4 rounded-xl border border-red-500/20 text-xs font-bold flex items-center gap-3">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </motion.div>

                {/* Result Section */}
                <AnimatePresence mode="wait">
                    {result && (
                        <motion.div
                            key="sentiment-result"
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="mt-8 lg:mt-0 flex flex-col justify-center h-full"
                        >
                            <div className={`p-10 rounded-[2.5rem] border shadow-2xl h-full flex flex-col justify-center gap-8 ${result.prevision === 'Positivo'
                                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 shadow-green-500/10'
                                : result.prevision === 'Neutro'
                                    ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20 shadow-amber-500/10'
                                    : 'bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20 shadow-red-500/10'
                                }`}>
                                <div className="space-y-5 text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm shadow-sm">
                                        <div className={`w-2 h-2 rounded-full ${result.prevision === 'Positivo'
                                            ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                            : result.prevision === 'Neutro'
                                                ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                                : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                            }`} />
                                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${result.prevision === 'Positivo'
                                            ? 'text-green-500'
                                            : result.prevision === 'Neutro'
                                                ? 'text-amber-500'
                                                : 'text-red-500'
                                            }`}>
                                            {t.form.conclusion}
                                        </span>
                                    </div>

                                    <h3 className={`text-6xl font-black tracking-tighter ${result.prevision === 'Positivo'
                                        ? 'text-green-500'
                                        : result.prevision === 'Neutro'
                                            ? 'text-amber-500'
                                            : 'text-red-500'
                                        }`}>
                                        {result.prevision === 'Positivo'
                                            ? t.form.positive
                                            : result.prevision === 'Neutro'
                                                ? t.form.neutral
                                                : t.form.negative}
                                    </h3>

                                    <div className="flex flex-col gap-2 opacity-80">
                                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                                            <Sparkles size={18} className={result.prevision === 'Positivo'
                                                ? 'text-green-500'
                                                : result.prevision === 'Neutro'
                                                    ? 'text-amber-500'
                                                    : 'text-red-500'} />
                                            <span className="text-sm font-bold text-foreground opacity-70">{t.form.confidence}: {(result.probabilidad * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-accent/10 rounded-full h-1.5 mt-2 max-w-[200px] mx-auto lg:mx-0 overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${result.prevision === 'Positivo'
                                                    ? 'bg-green-500'
                                                    : result.prevision === 'Neutro'
                                                        ? 'bg-amber-500'
                                                        : 'bg-red-500'
                                                    }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.probabilidad * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center">
                                    <div className={`text-9xl p-10 rounded-full bg-card shadow-2xl relative ring-[12px] group transition-all duration-700 ${result.prevision === 'Positivo'
                                        ? 'ring-green-400/10 text-green-500'
                                        : result.prevision === 'Neutro'
                                            ? 'ring-amber-400/10 text-amber-500'
                                            : 'ring-red-400/10 text-red-500'
                                        }`}>
                                        <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${result.prevision === 'Positivo'
                                            ? 'bg-green-400'
                                            : result.prevision === 'Neutro'
                                                ? 'bg-amber-400'
                                                : 'bg-red-400'
                                            }`} />
                                        <span className="relative z-10 block group-hover:scale-110 transition-transform duration-500">
                                            {result.prevision === 'Positivo' ? '😊' : result.prevision === 'Neutro' ? '😐' : '😡'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* New styled clear button */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-center"
                >
                    <button
                        onClick={() => {
                            setResult(null);
                            setText('');
                        }}
                        className="px-8 py-3.5 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 flex items-center gap-2 transform active:scale-95 border border-red-500/20"
                    >
                        <RotateCcw size={18} /> {t.form.clear}
                    </button>
                </motion.div>
            )}
        </div>
    );
}
