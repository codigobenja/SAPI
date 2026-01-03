'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet, RotateCcw, MessageSquare, Clock, BarChart3, ShieldCheck, Download, Filter, ChevronDown } from 'lucide-react';
import { analyzeSentiment, analyzeSentimentBatch } from '../lib/api';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState<'Todos' | 'Positivo' | 'Negativo'>('Todos');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    };

    const processFile = async () => {
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
                        else negativeCount++;

                        newSessionItems.unshift({
                            id: completed + 1,
                            text: cleanLine,
                            sentiment: result.prevision,
                            probability: result.probabilidad,
                            timestamp: processingTimestamp,
                            mlVersion: result.modelVersion || 'v1.0.0'
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
        { name: 'Positivos', value: summary.positive, color: '#3b82f6' },
        { name: 'Negativos', value: summary.negative, color: '#f43f5e' },
    ] : [];

    const filteredItems = filter === 'Todos'
        ? sessionItems
        : sessionItems.filter(item => item.sentiment === filter);

    return (
        <div className="w-full h-full flex flex-col gap-8 items-center">
            <AnimatePresence mode="wait">
                {!summary ? (
                    <motion.div
                        key="upload-zone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-12 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center flex-1 w-full max-w-[60%]"
                    >
                        <div className="text-center w-full">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Análisis Masivo de Datos 📦</h2>
                            <p className="text-slate-500 mb-8 font-medium">Sube archivos .xlsx o .csv para procesar por lotes.</p>

                            <div className={`relative group border-4 border-dashed rounded-[2rem] p-12 transition-all duration-500 ${file ? 'border-blue-300 bg-blue-50/50' : 'border-blue-50 bg-blue-50/20 hover:border-blue-200 hover:bg-blue-50/40'}`}>
                                <input
                                    type="file"
                                    accept=".csv,.txt,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploading}
                                />
                                <div className="flex flex-col items-center gap-6">
                                    {file ? (
                                        <div className="bg-white p-5 rounded-3xl shadow-lg ring-4 ring-blue-100">
                                            {file.name.endsWith('xls') || file.name.endsWith('xlsx') ?
                                                <FileSpreadsheet className="w-12 h-12 text-blue-600" /> :
                                                <FileText className="w-12 h-12 text-blue-500" />
                                            }
                                        </div>
                                    ) : (
                                        <div className="bg-white p-6 rounded-[2rem] shadow-md border border-blue-50 transition-transform group-hover:scale-110">
                                            <Upload className="w-12 h-12 text-blue-200" />
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-slate-900 font-bold block text-lg mb-1 truncate max-w-[280px] mx-auto">
                                            {file ? file.name : "Soltar archivo aquí"}
                                        </span>
                                        <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">
                                            EXCEL / CSV
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {file && !uploading && (
                                <button
                                    onClick={processFile}
                                    className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transform active:scale-95"
                                >
                                    <ShieldCheck size={20} /> INICIAR PROCESAMIENTO
                                </button>
                            )}

                            {uploading && (
                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase text-blue-500 tracking-widest">IA en ejecución</p>
                                            <p className="text-xs font-bold text-slate-700">Analizando lote...</p>
                                        </div>
                                        <span className="text-3xl font-black text-blue-600">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden border border-blue-200">
                                        <motion.div
                                            className="bg-blue-600 h-full rounded-full"
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
                        <div className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col gap-10 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                                        <CheckCircle size={14} /> Tarea completada
                                    </div>
                                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-[1.1]">Resumen del Análisis Masivo</h2>
                                    <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">Se han procesado exitosamente todos los registros del archivo <b className="text-blue-600">{summary.fileName}</b>.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={downloadExcel}
                                        className="bg-white text-slate-600 hover:text-blue-600 hover:border-blue-400 px-6 py-4 rounded-xl transition-all font-bold text-sm border border-slate-200 active:scale-95 whitespace-nowrap flex items-center gap-2"
                                    >
                                        <Download size={18} /> DESCARGAR EXCEL
                                    </button>
                                    <button
                                        onClick={() => { setFile(null); resetState(); }}
                                        className="flex items-center gap-2 bg-slate-900 text-white hover:bg-black px-6 py-4 rounded-xl transition-all font-bold text-sm shadow-xl shadow-slate-200 active:scale-95 whitespace-nowrap"
                                    >
                                        <RotateCcw size={18} /> REALIZAR NUEVO ANÁLISIS
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-10 items-center justify-between border-t border-blue-50 pt-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
                                    <div className="bg-blue-50/40 p-10 rounded-[2.5rem] border border-blue-100/50 flex flex-col justify-center">
                                        <MessageSquare className="text-blue-500 mb-6" size={28} />
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{summary.total}</p>
                                        <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mt-2">Registros Procesados</p>
                                    </div>
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm border-b-8 border-b-blue-600 flex flex-col justify-center">
                                        <CheckCircle className="text-blue-600 mb-6" size={28} />
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-black text-blue-800 tracking-tighter">{summary.positive}</p>
                                            <span className="text-sm font-bold text-blue-400">({((summary.positive / summary.total) * 100).toFixed(0)}%)</span>
                                        </div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Opiniones Favorables</p>
                                    </div>
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm border-b-8 border-b-red-600 flex flex-col justify-center">
                                        <AlertCircle className="text-red-600 mb-6" size={28} />
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-black text-red-700 tracking-tighter">{summary.negative}</p>
                                            <span className="text-sm font-bold text-red-400">({((summary.negative / summary.total) * 100).toFixed(0)}%)</span>
                                        </div>
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Puntos de Mejora</p>
                                    </div>
                                </div>

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
                                        <span className="text-3xl font-black text-slate-800">{summary.total > 0 ? ((summary.positive / summary.total) * 100).toFixed(0) : 0}%</span>
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">POSITIVO</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table (Local Session) - Spacious Design */}
                        <div className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden w-full">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-blue-50 gap-6">
                                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                                    <BarChart3 className="text-blue-600" size={28} />
                                    Detalle del Lote Analizado
                                </h3>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {/* Custom Styled Filter Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                                            className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all min-w-[180px] justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Filter size={14} className="text-blue-500" />
                                                <span>{filter === 'Todos' ? 'Todos' : filter}</span>
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
                                                            {opt === 'Positivo' ? '😊 Solo Positivos' : opt === 'Negativo' ? '😡 Solo Negativos' : '🔍 Todos los resultados'}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500">
                                        <Clock size={16} className="text-blue-500" />
                                        {summary.duration.toFixed(2)}s
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300">#</th>
                                            <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300">Contenido del Texto</th>
                                            <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-400 text-center">Clasificación IA</th>
                                            <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300 text-center">Confianza</th>
                                            <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300 text-center">Fecha y Hora</th>
                                            <th className="pb-8 font-black text-[11px] uppercase tracking-[0.25em] text-slate-300 text-right">Versión ML</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50">
                                        {filteredItems.map((item, idx) => (
                                            <tr key={idx} className="group hover:bg-blue-50/40 transition-all duration-300">
                                                <td className="py-7 text-xs font-black text-blue-200">{item.id.toString().padStart(2, '0')}</td>
                                                <td className="py-7 text-sm font-medium text-slate-600 max-w-sm truncate pr-12">{item.text}</td>
                                                <td className="py-7 text-center">
                                                    <span className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black tracking-tight shadow-sm border ${item.sentiment === 'Positivo'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : 'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        {item.sentiment === 'Positivo' ? '😊 Positivo' : '😡 Negativo'}
                                                    </span>
                                                </td>
                                                <td className="py-7 text-center">
                                                    <span className="text-sm font-black text-slate-400">{(item.probability * 100).toFixed(1)}%</span>
                                                </td>
                                                <td className="py-7 text-center">
                                                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap block">
                                                        {new Date(item.timestamp).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-300">
                                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="py-7 text-right">
                                                    <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-lg text-slate-400">
                                                        {item.mlVersion}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
