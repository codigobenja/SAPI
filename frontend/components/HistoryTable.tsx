'use client';

import { useEffect, useState } from 'react';
import { History, Clock, MessageSquare, CheckCircle, AlertCircle, Download, Filter, BarChart3, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';

interface HistoryItem {
    id: number;
    text: string;
    sentiment: string;
    probability: number;
    modelVersion: string;
    createdAt: string;
}

export default function HistoryTable({ refreshTrigger, mode = 'full' }: { refreshTrigger: number, mode?: 'full' | 'compact' }) {
    const { t } = useLanguage();
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
            [t.batch.table.text]: item.text,
            [t.batch.table.ia_class]: item.sentiment,
            [t.batch.table.confidence]: (item.probability * 100).toFixed(1),
            [t.batch.table.datetime]: new Date(item.createdAt).toLocaleString(),
            [t.batch.table.version]: item.modelVersion
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial_Total');
        XLSX.writeFile(workbook, `Historial_General_SentimentAPI.xlsx`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-muted font-bold text-xs uppercase tracking-widest">{t.common.syncing_cloud}</p>
        </div>
    );

    return (
        <div className="space-y-10 w-full animate-in fade-in duration-700">
            {mode === 'full' && history.length > 0 && (
                <div className="bg-card p-12 rounded-[3.5rem] border border-border shadow-xl shadow-accent/5 flex flex-col lg:flex-row gap-10 items-center w-full transition-colors duration-300">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-6 flex-1 w-full">
                            <div className="bg-accent/5 p-10 rounded-[2.5rem] border border-accent/10 flex flex-col justify-center min-w-[200px]">
                                <MessageSquare className="text-accent mb-6" size={28} />
                                <p className="text-4xl font-black text-foreground tracking-tighter">{history.length}</p>
                                <p className="text-[10px] font-extrabold text-accent uppercase tracking-widest mt-2">{t.history.total_records}</p>
                            </div>
                            <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm border-b-8 border-b-accent flex flex-col justify-center min-w-[200px]">
                                <CheckCircle className="text-green-500 mb-6" size={28} />
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-foreground tracking-tighter">{positives}</p>
                                    <span className="text-sm font-bold text-accent">({((positives / (total || 1)) * 100).toFixed(0)}%)</span>
                                </div>
                                <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mt-2">{t.batch.favorable}</p>
                            </div>
                            <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm border-b-8 border-b-red-500 flex flex-col justify-center min-w-[200px]">
                                <AlertCircle className="text-red-500 mb-6" size={28} />
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-red-500 tracking-tighter">{negatives}</p>
                                    <span className="text-sm font-bold text-red-400">({((negatives / (total || 1)) * 100).toFixed(0)}%)</span>
                                </div>
                                <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mt-2">{t.batch.improvement}</p>
                            </div>
                        </div>

                        <div className="w-64 h-64 relative flex-shrink-0 bg-card rounded-full p-6 shadow-inner ring-1 ring-border">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={75}
                                        outerRadius={95}
                                        paddingAngle={6}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-foreground">
                                    {total > 0 ? ((positives / total) * 100).toFixed(0) : 0}%
                                </span>
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">{t.form.positive}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`bg-card p-4 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-border shadow-xl shadow-accent/5 overflow-hidden w-full transition-colors duration-300 ${mode === 'compact' ? 'max-h-[500px]' : ''}`}>
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-border gap-6">
                    <h3 className="text-2xl font-bold text-foreground flex items-center gap-4">
                        <History className="text-accent" size={28} />
                        {mode === 'full' ? t.history.full_title : t.history.compact_title}
                    </h3>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={downloadExcel}
                            className="bg-card text-muted hover:text-accent hover:border-accent px-6 py-2.5 rounded-xl transition-all font-bold text-xs flex items-center gap-2 border border-border active:scale-95"
                        >
                            <Download size={16} /> {t.common.download_excel.toUpperCase()}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-w-[150px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-accent" />
                                    <span>{filter === 'Todos' ? t.history.filter.all : filter === 'Positivo' ? t.history.filter.pos : t.history.filter.neg}</span>
                                </div>
                                <ChevronDown size={16} className={`text-muted transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 overflow-hidden"
                                    >
                                        {[
                                            { id: 'Todos', label: t.history.filter.all, icon: '🔍' },
                                            { id: 'Positivo', label: t.history.filter.pos, icon: '😊' },
                                            { id: 'Negativo', label: t.history.filter.neg, icon: '😡' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setFilter(opt.id as any); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === opt.id ? 'bg-accent text-white' : 'text-muted hover:bg-accent/10 hover:text-accent'}`}
                                            >
                                                {opt.icon} {opt.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-accent/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-accent border border-accent/20">
                            {total} {t.history.records_count}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-muted opacity-30">{t.batch.table.hash}</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-muted opacity-30">{t.batch.table.text}</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-muted opacity-50 text-center">{t.batch.table.ia_class}</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-muted opacity-30 text-center">{t.batch.table.confidence}</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-muted opacity-30 text-center">{t.batch.table.datetime}</th>
                                <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-muted opacity-30 text-right">{t.batch.table.version}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20 text-muted">
                                            <Clock className="w-16 h-16" />
                                            <p className="font-black text-sm uppercase tracking-widest">{t.history.no_data}</p>
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
                                        className="hover:bg-accent/5 transition-all duration-300 group"
                                    >
                                        <td className="py-7 text-xs font-black text-accent/30">{((idx + 1) + (refreshTrigger * 0)).toString().padStart(2, '0')}</td>
                                        <td className="py-7 text-sm font-medium text-foreground opacity-80 max-w-sm truncate pr-10 group-hover:opacity-100" title={item.text}>
                                            {item.text}
                                        </td>
                                        <td className="py-7 text-center">
                                            <span className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black tracking-tight shadow-sm border ${item.sentiment === 'Positivo'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {item.sentiment === 'Positivo' ? `😊 ${t.form.positive}` : `😡 ${t.form.negative}`}
                                            </span>
                                        </td>
                                        <td className="py-7 text-center">
                                            <span className="text-sm font-black text-muted opacity-40">
                                                {(item.probability * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-7 text-center">
                                            <div className="flex flex-col items-center opacity-60">
                                                <span className="text-[10px] font-bold text-foreground whitespace-nowrap">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[8px] font-bold text-muted">
                                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-7 text-right">
                                            <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-muted">
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
                    <div className="p-6 bg-accent/5 text-center border-t border-border">
                        <span className="text-[10px] font-black text-muted opacity-50 uppercase tracking-[0.4em]">{t.history.footer_hint}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
