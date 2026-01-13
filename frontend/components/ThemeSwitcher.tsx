'use client';

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function ThemeSwitcher() {
    const { t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!mounted) return <div className="w-10 h-10" />;

    const themes = [
        { id: 'light', name: t.theme?.light || 'Claro', icon: <Sun size={16} /> },
        { id: 'dark', name: t.theme?.dark || 'Oscuro', icon: <Moon size={16} /> },
        { id: 'system', name: t.theme?.system || 'Sistema', icon: <Monitor size={16} /> },
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[2];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 bg-card hover:bg-accent/5 border border-border rounded-full text-foreground active:scale-95"
            >
                {currentTheme.icon}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-40 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 overflow-hidden"
                    >
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${theme === t.id
                                    ? 'bg-accent text-white font-bold'
                                    : 'text-muted hover:bg-accent/5 hover:text-accent font-medium'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {t.icon}
                                    <span>{t.name}</span>
                                </div>
                                {theme === t.id && <Check size={14} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
