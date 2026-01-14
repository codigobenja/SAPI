'use client';

import { Github, Linkedin, Cpu, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface TeamMember {
  name: string;
  github: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  { name: "Adrián Daniel Acevedo Vergara", github: "https://github.com/SiriusBK1", linkedin: "https://www.linkedin.com/in/adrian-daniel-acevedo-vergara-717790234" },
  { name: "Felipe Muñoz", github: "https://github.com/FelipeMunoz01", linkedin: "https://www.linkedin.com/in/felipe-m-92123990" },
  { name: "Genrry Llamocca Huamani", github: "https://github.com/GenryTc", linkedin: "https://www.linkedin.com/in/genrry-llamocca-huamani-9743bb10b" },
  { name: "Jenner Eduardo Ospina Benavides", github: "https://github.com/jennerospina13", linkedin: "https://www.linkedin.com/in/jenner-ospina" },
  { name: "Benjamin Peña Romero", github: "https://github.com/codigobenja", linkedin: "https://www.linkedin.com/in/benjamin-pr" },
  { name: "Tomás Vlaeminck", github: "https://github.com/Vlaeminck", linkedin: "https://www.linkedin.com/in/tomasvlaeminck" },
  { name: "Cristina Perez", github: "#", linkedin: "https://www.linkedin.com/in/cristina-perez-mardones-471572173" },
];

export default function Footer() {
  const { t, language } = useLanguage();

  // Forzamos la carga de textos para evitar que miren al vacío si el objeto t no ha cargado
  const footerTexts = t.footer || {
    description: language === 'es' 
      ? "Analizador de sentimientos de arquitectura híbrida. Procesamiento de datos distribuido entre entornos Java y Python."
      : "Analisador de sentimentos de arquitetura híbrida. Processamento de dados distribuído entre ambientes Java e Python.",
    team: language === 'es' ? "Equipo de Desarrollo" : "Equipe de Desenvolvimento",
    project: language === 'es' ? "PROYECTO ACADÉMICO" : "PROJETO ACADÊMICO"
  };

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
              {footerTexts.description}
            </p>
            <div className="flex gap-2">
               <span className="text-[9px] bg-accent/10 text-accent px-2 py-1 rounded border border-accent/20 font-bold uppercase tracking-widest">Spring Boot</span>
               <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded border border-blue-500/20 font-bold uppercase tracking-widest">FastAPI</span>
            </div>
          </div>

          {/* Equipo */}
          <div className="flex-1 max-w-3xl">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6">
              {footerTexts.team}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {teamMembers.map((m: TeamMember, i: number) => (
                <motion.div
                  key={`member-${i}`}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-xl border border-border bg-background/50 flex flex-col gap-2 transition-colors hover:border-accent/30 group"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-foreground truncate mr-2">{m.name}</h4>
                    <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                      <a href={m.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                        <Github size={14}/>
                      </a>
                      <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                        <Linkedin size={14}/>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex justify-between items-center text-[9px] font-black text-muted/60 uppercase tracking-[0.2em]">
          <span>© 2026 {footerTexts.project}</span>
        </div>
      </div>
    </footer>
  );
}


