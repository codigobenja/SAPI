'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet, RotateCcw, MessageSquare, Clock, BarChart3, Download, Filter, ChevronDown, Loader2, PlayCircle, Layers } from 'lucide-react';
import { analyzeSentimentBatch } from '../lib/api';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface SessionItem {
    id: number;
    text: string;
    sentiment: string;
    probability: number;
    timestamp: string;
    mlVersion: string;
}

interface BatchSummary {
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    duration: number;
    fileName: string;
}

interface BatchUploadProps {
    onProcessingComplete: () => void;
    file: File | null;
    setFile: (file: File | null) => void;
    summary: BatchSummary | null;
    setSummary: (summary: BatchSummary | null) => void;
    sessionItems: SessionItem[];
    setSessionItems: (items: SessionItem[]) => void;
    progress: number;
    setProgress: (progress: number) => void;
}

export default function BatchUpload({
    onProcessingComplete,
    file,
    setFile,
    summary,
    setSummary,
    sessionItems,
    setSessionItems,
    progress,
    setProgress
}: BatchUploadProps) {
    const { t } = useLanguage();
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState<'Todos' | 'Positivo' | 'Neutro' | 'Negativo'>('Todos');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            resetState();
        }
    };

    const resetState = () => {
        setProgress(0);
        setSummary(null);
        setSessionItems([]);
        setFilter('Todos');
        setCurrentPage(1);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const startTime = Date.now();

        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = e.target?.result;
            let lines: string[] = [];

            try {
                if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
                    lines = json.flat().filter(cell => cell && typeof cell.toString() === 'string' && cell.toString().trim().length > 0).map(c => c.toString());
                } else {
                    const text = data as string;
                    lines = text.split('\n').filter(line => line.trim() !== '');
                }
            } catch (err) {
                console.error("Error reading file", err);
                setUploading(false);
                return;
            }

            const total = lines.length;
            let completed = 0;
            let positiveCount = 0;
            let neutralCount = 0;
            let negativeCount = 0;
            const newSessionItems: SessionItem[] = [];
            const processingTimestamp = new Date().toISOString();

            // Micro-Batching: Bloques de 5 para equilibrio perfecto entre velocidad y UX fluida
            const CHUNK_SIZE = 5;
            for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
                const chunk = lines.slice(i, i + CHUNK_SIZE).map(l => l.replace(/^"|"$/g, '').trim()).filter(l => l);

                if (chunk.length === 0) continue;

                try {
                    const results = await analyzeSentimentBatch(chunk);

                    results.forEach((result, index) => {
                        const cleanLine = chunk[index];
                        if (result.prevision === 'Positivo') positiveCount++;
                        else if (result.prevision === 'Neutro') neutralCount++;
                        else negativeCount++;

                        newSessionItems.unshift({
                            id: completed + 1,
                            text: cleanLine,
                            sentiment: result.prevision,
                            probability: result.probabilidad,
                            timestamp: processingTimestamp,
                            mlVersion: result.modelVersion || 'v3.0.1'
                        });
                        completed++;
                    });

                    // Update UI after each chunk
                    const currentProgress = Math.min(Math.round((completed / total) * 100), 99);
                    setProgress(currentProgress);
                    setSessionItems([...newSessionItems]);
                } catch (err) {
                    console.error("Error analyzing batch", err);
                }
            }

            // Final update to 100%
            setProgress(100);
            setTimeout(() => {
                const duration = (Date.now() - startTime) / 1000;
                setSummary({
                    total,
                    positive: positiveCount,
                    neutral: neutralCount,
                    negative: negativeCount,
                    duration,
                    fileName: file.name
                });
                setUploading(false);
            }, 300);
            onProcessingComplete();
        };

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsText(file);
        }
    };

    const downloadExcel = () => {
        if (sessionItems.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(sessionItems.map(item => ({
            '#': item.id,
            'Comentario': item.text,
            'Sentimiento': item.sentiment,
            'Probabilidad (%)': (item.probability * 100).toFixed(1),
            'Fecha y Hora': new Date(item.timestamp).toLocaleString(),
            'Versión ML': item.mlVersion
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados Masivos');
        XLSX.writeFile(workbook, `Análisis_Masivo_${summary?.fileName || 'Session'}.xlsx`);
    };

    const chartData = summary ? [
        { name: t.history.filter.pos, value: summary.positive, color: '#22c55e' }, // emerald-500
        { name: t.history.filter.neu, value: summary.neutral, color: '#f59e0b' }, // amber-500
        { name: t.history.filter.neg, value: summary.negative, color: '#ef4444' }, // red-500
    ] : [];

    const filteredItems = filter === 'Todos'
        ? sessionItems
        : sessionItems.filter(item => item.sentiment === filter);

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="w-full h-full flex flex-col gap-8 items-center">
            <AnimatePresence mode="wait">
                {!summary ? (
                    <motion.div
                        key="upload-zone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card p-12 rounded-[2.5rem] border border-border shadow-xl shadow-accent/5 flex flex-col items-center justify-center flex-1 w-full max-w-5xl mx-auto"
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                setFile(e.dataTransfer.files[0]);
                                resetState();
                            }
                        }}
                    >
                        <div className="flex items-center justify-center gap-4 mb-12">
                            <div className="bg-accent/10 p-4 rounded-2xl text-accent">
                                <Layers size={32} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                                    {t.batch.title}
                                </h2>
                                <p className="text-muted text-sm md:text-base font-medium">
                                    {t.batch.desc}
                                </p>
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-center">
                            {!sessionItems.length ? (
                                <div className="w-full space-y-8">
                                    <div className="relative group w-full">
                                        <div className={`border-4 border-dashed rounded-[2.5rem] p-10 transition-all duration-500 flex flex-col items-center gap-4 ${isDragging ? 'border-accent bg-accent/5 scale-[0.98]' : 'border-border hover:border-accent/40 bg-accent/5'
                                            }`}>
                                            <input
                                                type="file"
                                                accept=".csv,.txt,.xlsx,.xls"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={uploading}
                                            />
                                            <div className="p-6 bg-card rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                <Upload className={uploading ? 'animate-bounce text-accent' : 'text-accent'} size={36} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-black text-foreground mb-1">
                                                    {file ? file.name : t.batch.drop_zone}
                                                </p>
                                                <p className="text-xs font-bold text-muted uppercase tracking-[0.3em]">
                                                    {t.batch.format_hint}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className="w-full py-6 bg-accent text-white font-black rounded-[2rem] hover:opacity-90 disabled:bg-muted/10 disabled:text-muted/40 transition-all shadow-2xl shadow-accent/20 text-lg tracking-widest uppercase flex items-center justify-center gap-4"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" /> : <PlayCircle />}
                                        {uploading ? t.batch.processing.toUpperCase() : t.batch.start}
                                    </button>
                                </div>
                            ) : null}

                            {uploading && (
                                <div className="mt-8 space-y-4 w-full">
                                    <div className="flex justify-between items-end">
                                        <div className="text-left">
                                            <p className="text-base font-black uppercase text-red-500 tracking-[0.3em] animate-pulse">{t.batch.processing}</p>
                                            <p className="text-xs font-bold text-muted">{t.batch.analyzing_batch}</p>
                                        </div>
                                        <span className="text-3xl font-black text-accent">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-accent/10 rounded-full h-3 overflow-hidden border border-accent/20">
                                        <motion.div
                                            className="bg-accent h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-10 pb-10 w-full"
                    >
                        {/* Summary Header */}
                        <div className="max-w-5xl mx-auto w-full">
                            <div className="bg-card p-4 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-border shadow-xl shadow-accent/5 flex flex-col gap-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest border border-accent/20">
                                            <CheckCircle size={14} /> {t.batch.completed}
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-[1.1]">{t.batch.results_title}</h2>
                                        <p className="text-muted font-medium leading-relaxed max-w-2xl">{t.batch.results_desc} <b className="text-accent">{summary.fileName}</b>.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={downloadExcel}
                                            className="bg-card text-muted hover:text-accent hover:border-accent px-6 py-4 rounded-xl transition-all font-bold text-sm border border-border active:scale-95 whitespace-nowrap flex items-center gap-2"
                                        >
                                            <Download size={18} /> {t.batch.download}
                                        </button>
                                        <button
                                            onClick={() => { setFile(null); resetState(); }}
                                            className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 px-6 py-4 rounded-xl transition-all font-bold text-sm shadow-xl shadow-accent/5 active:scale-95 whitespace-nowrap"
                                        >
                                            <RotateCcw size={18} /> {t.batch.restart}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-10 items-center justify-between border-t border-border pt-10">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 w-full">
                                        <div className="bg-accent/5 p-6 rounded-[2rem] border border-accent/10 flex flex-col justify-center">
                                            <MessageSquare className="text-accent mb-4" size={24} />
                                            <p className="text-3xl font-black text-foreground tracking-tighter">{summary.total}</p>
                                            <p className="text-[9px] font-extrabold text-accent uppercase tracking-widest mt-2">{t.batch.records_processed}</p>
                                        </div>
                                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm border-b-4 border-b-emerald-500 flex flex-col justify-center">
                                            <CheckCircle className="text-green-500 mb-4" size={24} />
                                            <div className="flex items-baseline gap-1.5">
                                                <p className="text-3xl font-black text-foreground tracking-tighter">{summary.positive}</p>
                                                <span className="text-xs font-bold text-accent">({((summary.positive / summary.total) * 100).toFixed(0)}%)</span>
                                            </div>
                                            <p className="text-[9px] font-extrabold text-muted uppercase tracking-widest mt-2">{t.batch.favorable}</p>
                                        </div>
                                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm border-b-4 border-b-amber-500 flex flex-col justify-center">
                                            <RotateCcw className="text-amber-500 mb-4" size={24} />
                                            <div className="flex items-baseline gap-1.5">
                                                <p className="text-3xl font-black text-amber-500 tracking-tighter">{summary.neutral}</p>
                                                <span className="text-xs font-bold text-amber-400">({((summary.neutral / summary.total) * 100).toFixed(0)}%)</span>
                                            </div>
                                            <p className="text-[9px] font-extrabold text-muted uppercase tracking-widest mt-2">{t.batch.neutral}</p>
                                        </div>
                                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm border-b-4 border-b-red-500 flex flex-col justify-center">
                                            <AlertCircle className="text-red-500 mb-4" size={24} />
                                            <div className="flex items-baseline gap-1.5">
                                                <p className="text-3xl font-black text-red-500 tracking-tighter">{summary.negative}</p>
                                                <span className="text-xs font-bold text-red-400">({((summary.negative / summary.total) * 100).toFixed(0)}%)</span>
                                            </div>
                                            <p className="text-[9px] font-extrabold text-muted uppercase tracking-widest mt-2">{t.batch.improvement}</p>
                                        </div>
                                    </div>

                                    <div className="w-64 h-64 relative flex-shrink-0 bg-card rounded-full p-6 shadow-inner ring-1 ring-border">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={6} dataKey="value">
                                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-3xl font-black text-foreground">{summary.total > 0 ? ((summary.positive / summary.total) * 100).toFixed(0) : 0}%</span>
                                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">{t.form.positive.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table (Local Session) - Spacious Design */}
                        <div className="bg-card p-4 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-border shadow-xl shadow-accent/5 overflow-hidden w-full">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-border gap-6">
                                <h3 className="text-2xl font-bold text-foreground flex items-center gap-4">
                                    <BarChart3 className="text-accent" size={28} />
                                    {t.batch.detail_title}
                                </h3>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {/* Custom Styled Filter Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                                            className="flex items-center gap-2 bg-background px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-muted hover:bg-accent/5 transition-all min-w-[180px] justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Filter size={14} className="text-accent" />
                                                <span>{filter === 'Todos' ? t.batch.filter_all : filter}</span>
                                            </div>
                                            <ChevronDown size={16} className={`text-muted transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isFilterOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 overflow-hidden"
                                                >
                                                    {[
                                                        { id: 'Todos', label: t.batch.filter_all, icon: '🔍' },
                                                        { id: 'Positivo', label: t.batch.filter_pos, icon: '😊' },
                                                        { id: 'Neutro', label: t.batch.filter_neu, icon: '😐' },
                                                        { id: 'Negativo', label: t.batch.filter_neg, icon: '😡' }
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

                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-accent border border-accent/20">
                                        <Clock size={16} className="text-accent" />
                                        {summary.duration.toFixed(2)}s
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-[2rem] border border-border bg-background/50 backdrop-blur-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-accent/5">
                                            <th className="px-6 py-6 font-black text-[11px] uppercase tracking-[0.25em] text-foreground/70 border-b border-border">{t.batch.table.hash}</th>
                                            <th className="px-6 py-6 font-black text-[11px] uppercase tracking-[0.25em] text-foreground/70 border-b border-border">{t.batch.table.text}</th>
                                            <th className="px-6 py-6 font-black text-[11px] uppercase tracking-[0.25em] text-foreground/70 border-b border-border text-center">{t.batch.table.ia_class}</th>
                                            <th className="px-6 py-6 font-black text-[11px] uppercase tracking-[0.25em] text-foreground/70 border-b border-border text-center">{t.batch.table.confidence}</th>
                                            <th className="px-6 py-6 font-black text-[11px] uppercase tracking-[0.25em] text-foreground/70 border-b border-border text-center">{t.batch.table.datetime}</th>
                                            <th className="px-6 py-6 font-black text-[11px] uppercase tracking-[0.25em] text-foreground/70 border-b border-border text-right">{t.batch.table.version}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginatedItems.map((item, idx) => (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.01 }}
                                                key={item.id}
                                                className="hover:bg-accent/5 group"
                                            >
                                                <td className="px-6 py-5 text-xs font-black text-accent/40">{item.id.toString().padStart(2, '0')}</td>
                                                <td className="px-6 py-5 text-sm font-medium text-foreground opacity-90 max-w-sm truncate group-hover:opacity-100">{item.text}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-tight shadow-sm border ${item.sentiment === 'Positivo'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : item.sentiment === 'Neutro'
                                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                        {item.sentiment === 'Positivo' ? `😊 ${t.form.positive}` : item.sentiment === 'Neutro' ? `😐 ${t.form.neutral}` : `😡 ${t.form.negative}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-xs font-black text-foreground/40">{(item.probability * 100).toFixed(1)}%</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-[10px] font-bold text-foreground opacity-70 whitespace-nowrap block">
                                                        {new Date(item.timestamp).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-muted">
                                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className="text-[9px] font-black px-3 py-1 bg-accent/5 rounded-lg text-muted">
                                                        {item.mlVersion}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-muted uppercase tracking-widest">{t.batch.table.rows_per_page || 'Filas por página'}:</span>
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-accent"
                                        >
                                            {[10, 25, 50, 100].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-border rounded-xl hover:bg-accent/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <ChevronDown size={18} className="rotate-90" />
                                        </button>
                                        <div className="flex items-center gap-1 px-4">
                                            <span className="text-sm font-black text-accent">{currentPage}</span>
                                            <span className="text-sm font-bold text-muted">/</span>
                                            <span className="text-sm font-bold text-muted">{totalPages}</span>
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border border-border rounded-xl hover:bg-accent/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <ChevronDown size={18} className="-rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
