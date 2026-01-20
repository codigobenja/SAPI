'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Definimos el tiempo de espera para que el video se reproduzca
        // y luego desvanezca suavemente.
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Notificamos al padre después de que la animación de salida termine
            setTimeout(onFinish, 800);
        }, 4200);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Fondo con gradiente sutil para profundidad */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-black pointer-events-none" />

                    <div className="relative w-full h-full max-w-5xl flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <video
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full max-h-[60vh] object-contain"
                            >
                                <source src="/splash_video.mp4" type="video/mp4" />
                            </video>
                        </motion.div>

                        {/* Efecto de aura detrás del logo/video */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 blur-[100px] rounded-full" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="absolute bottom-20 flex flex-col items-center gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-[1px] w-8 bg-accent/30" />
                            <p className="text-accent/80 text-[11px] font-black uppercase tracking-[0.6em]">
                                SAPI ECOSYSTEM
                            </p>
                            <div className="h-[1px] w-8 bg-accent/30" />
                        </div>
                    </motion.div>

                    {/* Barra de carga minimalista en la parte inferior */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 4.2, ease: "linear" }}
                            className="h-full bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
