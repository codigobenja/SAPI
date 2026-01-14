'use client';

import { Github, Linkedin, Cpu, Code2, Terminal, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  github: string;
  linkedin: string;
}

const teamMembers = [
  { name: "Adrián Acevedo", github: "https://github.com/SiriusBK1", linkedin: "#" },
  { name: "Felipe Muñoz", github: "https://github.com/FelipeMunoz01", linkedin: "#" },
  { name: "Genrry Llamocca Huamani", github: "https://github.com/GenryTc", linkedin: "#" },
  { name: "Jenner Eduardo Ospina Benavides", github: "https://github.com/jennerospina13", linkedin: "#" },
  { name: "Benjamin Peña Romero", github: "https://github.com/codigobenja", linkedin: "#" },
  { name: "Tomás Vlaeminck", github: "https://github.com/Vlaeminck", linkedin: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-xl z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 justify-between">

          {/* Info Proyecto */}
          <div className="max-w-xs space-y-4">
            <div className="flex items-center gap-2 text-accent font-black italic text-xl">
              <Cpu size={22} />
              <span>SENTIMENT AI</span>
            </div>
            <p className="text-muted text-xs font-medium leading-relaxed">
              Analizador de sentimientos de arquitectura híbrida.
              Procesamiento de datos distribuido entre entornos Java y Python.
            </p>
            <div className="flex gap-2">
               <span className="text-[9px] bg-accent/10 text-accent px-2 py-1 rounded border border-accent/20 font-bold uppercase">Spring Boot</span>
               <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded border border-blue-500/20 font-bold uppercase">FastAPI</span>
            </div>
          </div>

          {/* Equipo: El grid se ajusta solo (1 col móvil, 2 tablet, 3 desktop) */}
          <div className="flex-1 max-w-3xl">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6">Development Team</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {teamMembers.map((m, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-xl border border-border bg-background/50 flex flex-col gap-2 transition-colors hover:border-accent/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{m.name}</h4>
                      <p className="text-[9px] font-black text-accent uppercase tracking-tighter">{m.role}</p>
                    </div>
                    <div className="flex gap-2 opacity-50">
                      <a href={m.github} className="hover:text-accent"><Github size={14}/></a>
                      <a href={m.linkedin} className="hover:text-accent"><Linkedin size={14}/></a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex justify-between items-center text-[9px] font-black text-muted/60 uppercase tracking-[0.2em]">
          <span>© 2026 PROYECTO ACADÉMICO</span>
          <span className="flex items-center gap-2 italic">
            <Globe size={12}/> v1.0.0-stable
          </span>
        </div>
      </div>
    </footer>
  );

}
