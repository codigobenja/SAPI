'use client';

import { SentimentResponse } from '../lib/api';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, BarChart3, Fingerprint } from 'lucide-react';

export default function ResultsDisplay({ result }: { result: SentimentResponse | null }) {
    if (!result) {
        return (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <BarChart3 className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-center font-medium">Los resultados aparecerán aquí</p>
                <p className="text-sm text-center text-gray-400 mt-1">Espera a realizar un análisis</p>
            </div>
        );
    }

    const isPositive = result.prevision === 'Positivo';
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    const bgClass = isPositive ? 'bg-green-100' : 'bg-red-100';
    const borderClass = isPositive ? 'border-green-200' : 'border-red-200';
    const gradientClass = isPositive ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden"
        >
            <div className={`p-8 text-center bg-gradient-to-br ${gradientClass} text-white`}>
                <div className="inline-flex p-3 bg-white/20 backdrop-blur-md rounded-full mb-4 shadow-lg">
                    {isPositive ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-2">{result.prevision}</h2>
                <p className="text-white/80 font-medium">Predicción del Modelo</p>
            </div>

            <div className="p-8 space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-gray-500 font-medium text-sm">Nivel de Confianza</span>
                        <span className={`text-2xl font-bold ${colorClass}`}>
                            {(result.probabilidad * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.probabilidad * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Fingerprint size={16} />
                        <span>Versión del Modelo:</span>
                    </div>
                    <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {result.modelVersion || 'v1.0.0'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
