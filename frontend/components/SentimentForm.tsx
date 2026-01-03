'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles, AlertCircle, MessageSquare, RotateCcw } from 'lucide-react';
import { analyzeSentiment, SentimentResponse } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

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
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full transition-all duration-700 ${result ? 'max-w-6xl' : 'max-w-3xl'} mx-auto`}>
            {/* Header section */}
            <AnimatePresence>
                {!result && (
                    <motion.div
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="flex items-center gap-4 mb-8 overflow-hidden"
                    >
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 flex-shrink-0">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Análisis de Texto
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Analiza el sentimiento de comentarios en diversos sectores como restaurantes, hoteles y más.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-2 lg:gap-8' : 'grid-cols-1'} transition-all duration-700 items-stretch`}>

                {/* Form Section */}
                <motion.div
                    layout
                    className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 h-full flex flex-col justify-between"
                >
                    <div className="space-y-6">
                        {result && (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-1 h-5 bg-blue-600 rounded-full" />
                                <span className="font-bold text-slate-900 text-sm tracking-tight uppercase">Nueva Consulta</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Escribe el comentario que deseas analizar..."
                                    className={`w-full ${result ? 'h-52' : 'h-44'} p-6 bg-blue-50/30 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-blue-500 transition-all outline-none resize-none text-lg text-slate-800 placeholder:text-blue-300 font-medium`}
                                    required
                                />
                                <div className="absolute bottom-6 right-6 text-[10px] text-blue-300 font-bold uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {text.length} caracteres
                                </div>
                            </div>

                            <div className="flex justify-end items-center">
                                <button
                                    type="submit"
                                    disabled={loading || !text.trim()}
                                    className="px-10 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 transform active:scale-95 whitespace-nowrap"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Analizando...
                                        </>
                                    ) : (
                                        <>
                                            Realizar Análisis <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 text-xs font-bold flex items-center gap-3">
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
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-green-500/10'
                                    : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100 shadow-red-500/10'
                                }`}>
                                <div className="space-y-5 text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border bg-white/50 backdrop-blur-sm shadow-sm">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${result.prevision === 'Positivo' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${result.prevision === 'Positivo' ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            Conclusión del Sistema
                                        </span>
                                    </div>

                                    <h3 className={`text-6xl font-black tracking-tighter ${result.prevision === 'Positivo' ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {result.prevision === 'Positivo' ? 'Positivo' : 'Negativo'}
                                    </h3>

                                    <div className="flex flex-col gap-2 opacity-80">
                                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                                            <Sparkles size={18} className={result.prevision === 'Positivo' ? 'text-green-600' : 'text-red-600'} />
                                            <span className="text-sm font-bold text-slate-700">Confianza: {(result.probabilidad * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200/30 rounded-full h-1.5 mt-2 max-w-[200px] mx-auto lg:mx-0">
                                            <motion.div
                                                className={`h-full rounded-full ${result.prevision === 'Positivo' ? 'bg-green-500' : 'bg-red-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.probabilidad * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center">
                                    <div className={`text-9xl p-10 rounded-full bg-white shadow-2xl shadow-inner ring-[12px] transform hover:scale-110 transition-transform duration-500 ${result.prevision === 'Positivo' ? 'ring-green-100/50 text-green-500' : 'ring-red-100/50 text-red-500'
                                        }`}>
                                        {result.prevision === 'Positivo' ? '😊' : '😡'}
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
                        className="px-8 py-3.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/5 flex items-center gap-2 transform active:scale-95 border border-red-100"
                    >
                        <RotateCcw size={18} /> LIMPIAR Y REINICIAR ANÁLISIS
                    </button>
                </motion.div>
            )}
        </div>
    );
}
