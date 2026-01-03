'use client';

import { useEffect, useState } from 'react';
import { History, Clock, MessageSquare, CheckCircle, AlertCircle, Download, Filter, BarChart3, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

interface HistoryItem {
    id: number;
    text: string;
    sentiment: string;
    probability: number;
    modelVersion: string;
    createdAt: string;
}

export default function HistoryTable({ refreshTrigger, mode = 'compact' }: { refreshTrigger: number, mode?: 'compact' | 'full' }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'Todos' | 'Positivo' | 'Negativo'>('Todos');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/history`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.warn('Backend no detectado.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger]);

    const total = history.length;
    const positives = history.filter(h => h.sentiment === 'Positivo').length;
    const negatives = history.filter(h => h.sentiment === 'Negativo').length;

    const chartData = [
        { name: 'Positivos', value: positives, color: '#3b82f6' },
        { name: 'Negativos', value: negatives, color: '#f43f5e' },
    ];

    const filteredItems = filter === 'Todos'
        ? history
        : history.filter(item => item.sentiment === filter);

    const downloadExcel = () => {
        if (history.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(history.map((item, idx) => ({
            '#': idx + 1,
            'Comentario': item.text,
            'Sentimiento': item.sentiment,
            'Confianza (%)': (item.probability * 100).toFixed(1),
            'Fecha y Hora': new Date(item.createdAt).toLocaleString(),
            'Versión ML': item.modelVersion
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial_Total');
        XLSX.writeFile(workbook, `Historial_General_SentimentAPI.xlsx`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sincronizando con Cloud...</p>
        </div>
    );

    return (
        <div className="space-y-10 w-full animate-in fade-in duration-700">
            {mode === 'full' && history.length > 0 && (
                <div className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col lg:flex-row gap-10 items-center w-full">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
                        <div className="bg-blue-50/40 p-10 rounded-[2.5rem] border border-blue-100/50 flex flex-col justify-center">
                            <MessageSquare className="text-blue-500 mb-6" size={28} />
                            <p className="text-4xl font-black text-slate-900 tracking-tighter">{total}</p>
                            <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mt-2">Registros Cloud</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm border-b-8 border-b-blue-600 flex flex-col justify-center">
                            <CheckCircle className="text-blue-600 mb-6" size={28} />
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-blue-800 tracking-tighter">{positives}</p>
                                <span className="text-sm font-bold text-blue-400">{total > 0 ? ((positives / total) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Satisfacción Global</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm border-b-8 border-b-red-600 flex flex-col justify-center">
                            <AlertCircle className="text-red-600 mb-6" size={28} />
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-red-700 tracking-tighter">{negatives}</p>
                                <span className="text-sm font-bold text-red-400">{total > 0 ? ((negatives / total) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Críticas Detectadas</p>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div className="w-64 h-64 relative flex-shrink-0 bg-slate-50 rounded-full p-6 shadow-inner ring-1 ring-blue-50">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={6} dataKey="value">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-800">{total > 0 ? ((positives / total) * 100).toFixed(0) : 0}%</span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">POSITIVO</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={`bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden w-full ${mode === 'compact' ? 'max-h-[500px]' : ''}`}>
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-blue-50 gap-6">
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                        <History className="text-blue-600" size={28} />
                        {mode === 'full' ? 'Listado Histórico General' : 'Actividad Reciente'}
                    </h3>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={downloadExcel}
                            className="bg-white text-slate-600 hover:text-blue-600 hover:border-blue-400 px-6 py-2.5 rounded-xl transition-all font-bold text-xs flex items-center gap-2 border border-slate-200 active:scale-95"
                        >
                            <Download size={16} /> DESCARGAR EXCEL
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all min-w-[150px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-blue-500" />
                                    <span>{filter}</span>
                                </div>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-100 shadow-2xl rounded-2xl p-2 z-50 overflow-hidden"
                                    >
                                        {['Todos', 'Positivo', 'Negativo'].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => { setFilter(opt as any); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === opt ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                                            >
                                                {opt === 'Positivo' ? '😊 Positivos' : opt === 'Negativo' ? '😡 Negativos' : '🔍 Todos'}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-blue-50 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-100">
                            {total} Registros
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300">#</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300">Contenido del Comentario</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-400 text-center">Clasificación IA</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300 text-center">Precisión</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300 text-center">Fecha y Hora</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300 text-right">Versión ML</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Clock className="w-16 h-16" />
                                            <p className="font-black text-sm uppercase tracking-widest text-slate-500">Sin datos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                (mode === 'compact' ? filteredItems.slice(0, 8) : filteredItems).map((item, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={item.id}
                                        className="hover:bg-blue-50/40 transition-all duration-300"
                                    >
                                        <td className="py-7 text-xs font-black text-blue-200">{(idx + 1).toString().padStart(2, '0')}</td>
                                        <td className="py-7 text-sm font-medium text-slate-600 max-w-sm truncate pr-10" title={item.text}>
                                            {item.text}
                                        </td>
                                        <td className="py-7 text-center">
                                            <span className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black tracking-tight shadow-sm border ${item.sentiment === 'Positivo'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {item.sentiment === 'Positivo' ? '😊 Positivo' : '😡 Negativo'}
                                            </span>
                                        </td>
                                        <td className="py-7 text-center">
                                            <span className="text-sm font-black text-slate-400">
                                                {(item.probability * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-7 text-center">
                                            <div className="flex flex-col items-center opacity-70">
                                                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[8px] font-bold text-slate-300">
                                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-7 text-right">
                                            <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-lg text-slate-400">
                                                {item.modelVersion}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {mode === 'compact' && filteredItems.length > 8 && (
                    <div className="p-6 bg-slate-50/80 text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Navega a la sección de Métricas para el detalle extendido</span>
                    </div>
                )}
            </div>
        </div>
    );
}
