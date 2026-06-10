'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ── SVG Illustrations ── */
const MapSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Map background */}
    <rect width="400" height="300" fill="#e8f5e9" rx="20"/>
    {/* Roads */}
    <path d="M0 150 Q100 120 200 150 T400 150" stroke="#c8e6c9" strokeWidth="20" fill="none"/>
    <path d="M200 0 Q180 100 200 150 Q220 200 200 300" stroke="#c8e6c9" strokeWidth="16" fill="none"/>
    <path d="M0 80 L400 80" stroke="#dcedc8" strokeWidth="10" fill="none"/>
    <path d="M0 220 L400 220" stroke="#dcedc8" strokeWidth="10" fill="none"/>
    {/* Blocks */}
    <rect x="20"  y="100" width="80"  height="40" rx="6" fill="#a5d6a7" opacity="0.6"/>
    <rect x="120" y="170" width="60"  height="40" rx="6" fill="#a5d6a7" opacity="0.6"/>
    <rect x="280" y="100" width="100" height="45" rx="6" fill="#a5d6a7" opacity="0.6"/>
    <rect x="240" y="170" width="80"  height="35" rx="6" fill="#c5e1a5" opacity="0.6"/>
    <rect x="20"  y="230" width="70"  height="40" rx="6" fill="#a5d6a7" opacity="0.6"/>
    <rect x="310" y="200" width="70"  height="40" rx="6" fill="#c5e1a5" opacity="0.6"/>
    {/* Encounter markers */}
    <g transform="translate(200,150)">
      <circle r="28" fill="#fff" opacity="0.9" filter="url(#shadow)"/>
      <circle r="20" fill="#f97316"/>
      <circle r="10" fill="white" opacity="0.4"/>
      <circle r="4"  fill="white"/>
      <circle r="36" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.5">
        <animate attributeName="r" values="28;44;28" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
    </g>
    <g transform="translate(90,115)">
      <circle r="20" fill="#fff" opacity="0.9"/>
      <circle r="14" fill="#3b82f6"/>
      <circle r="7"  fill="white" opacity="0.4"/>
      <circle r="26" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4">
        <animate attributeName="r" values="18;30;18" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </g>
    <g transform="translate(310,130)">
      <circle r="16" fill="#fff" opacity="0.9"/>
      <circle r="11" fill="#8b5cf6"/>
      <circle r="5"  fill="white" opacity="0.4"/>
    </g>
    <g transform="translate(50,240)">
      <circle r="12" fill="#fff" opacity="0.9"/>
      <circle r="8"  fill="#94a3b8"/>
    </g>
    {/* Player dot */}
    <g transform="translate(200,150)">
      <circle r="8" fill="#2563eb" opacity="0.9"/>
      <circle r="4" fill="white"/>
    </g>
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.2"/>
      </filter>
    </defs>
  </svg>
);

const RadarSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="#bbf7d0" strokeWidth="1"/>
    <circle cx="100" cy="100" r="45" fill="none" stroke="#bbf7d0" strokeWidth="1"/>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#bbf7d0" strokeWidth="1"/>
    <line x1="100" y1="5" x2="100" y2="195" stroke="#bbf7d0" strokeWidth="0.8"/>
    <line x1="5" y1="100" x2="195" y2="100" stroke="#bbf7d0" strokeWidth="0.8"/>
    {/* Sweep */}
    <path d="M100 100 L100 5 A95 95 0 0 1 185 65 Z" fill="#10b98133">
      <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="3s" repeatCount="indefinite"/>
    </path>
    {/* Blips */}
    <circle cx="140" cy="60"  r="5" fill="#f97316"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0s"   repeatCount="indefinite"/></circle>
    <circle cx="60"  cy="130" r="4" fill="#3b82f6"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.7s" repeatCount="indefinite"/></circle>
    <circle cx="155" cy="120" r="3" fill="#8b5cf6"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.4s" repeatCount="indefinite"/></circle>
    <circle cx="100" cy="100" r="6" fill="#10b981"/>
  </svg>
);

const QuestCardSVG = () => (
  <svg viewBox="0 0 320 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="20" fill="white" filter="url(#cs)"/>
    <rect width="320" height="200" rx="20" fill="none" stroke="#fed7aa" strokeWidth="2"/>
    {/* Header */}
    <rect x="0" y="0" width="320" height="52" rx="20" fill="#fff7ed"/>
    <rect x="0" y="32" width="320" height="20" fill="#fff7ed"/>
    <circle cx="36" cy="26" r="16" fill="#f97316"/>
    <text x="36" y="31" textAnchor="middle" fontSize="14" fill="white">⚡</text>
    <rect x="62" y="16" width="100" height="8"  rx="4" fill="#f97316" opacity="0.8"/>
    <rect x="62" y="28" width="70"  height="6"  rx="3" fill="#fed7aa"/>
    <rect x="240" y="14" width="64" height="24" rx="12" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1.5"/>
    <text x="272" y="30" textAnchor="middle" fontSize="11" fill="#f97316" fontWeight="bold">+300 XP</text>
    {/* Body */}
    <rect x="20" y="68"  width="220" height="10" rx="5" fill="#e2e8f0"/>
    <rect x="20" y="84"  width="180" height="10" rx="5" fill="#e2e8f0"/>
    <rect x="20" y="108" width="280" height="8"  rx="4" fill="#f1f5f9"/>
    <rect x="20" y="120" width="240" height="8"  rx="4" fill="#f1f5f9"/>
    {/* Buttons */}
    <rect x="20"  y="148" width="120" height="36" rx="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
    <rect x="156" y="148" width="144" height="36" rx="10" fill="#f97316"/>
    <text x="80"  y="171" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">💬 Approach</text>
    <text x="228" y="171" textAnchor="middle" fontSize="12" fill="white"   fontWeight="bold">Hunt It! →</text>
    <defs>
      <filter id="cs"><feDropShadow dx="0" dy="6" stdDeviation="12" floodOpacity="0.1"/></filter>
    </defs>
  </svg>
);

/* ── Rarity encounter blobs ── */
const ENCOUNTERS = [
  { rarity: 'legendary', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: '💎', title: 'Angel Investor Open Hours', desc: 'Pitch your idea in 10 min', xp: 1000, delay: 0 },
  { rarity: 'epic',      color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: '⚡', title: 'AI Hackathon NYC',           desc: '48-hour build competition',  xp: 300,  delay: 0.1 },
  { rarity: 'rare',      color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: '🤝', title: 'Founders Meetup',            desc: 'Monthly NYC gathering',      xp: 100,  delay: 0.2 },
  { rarity: 'common',    color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', icon: '☕', title: 'Founder Coffee Chat',        desc: 'Casual 1:1 conversation',    xp: 10,   delay: 0.3 },
];

const CLASSES = [
  { name:'Founder',    emoji:'🏰', color:'#f97316', grad:'from-orange-400 to-red-500' },
  { name:'Engineer',   emoji:'⚡',  color:'#3b82f6', grad:'from-blue-400 to-indigo-500' },
  { name:'Designer',   emoji:'🎨', color:'#ec4899', grad:'from-pink-400 to-purple-500' },
  { name:'Creator',    emoji:'🌟', color:'#10b981', grad:'from-emerald-400 to-teal-500' },
  { name:'Researcher', emoji:'🔬', color:'#8b5cf6', grad:'from-violet-400 to-purple-600' },
  { name:'Investor',   emoji:'💰', color:'#f59e0b', grad:'from-amber-400 to-orange-500' },
];

/* ── Scroll reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('visible'); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const [typeText, setTypeText] = useState('');
  const fullText = 'There is a founder quest 600m away.';

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTypeText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, []);

  const s1 = useReveal(), s2 = useReveal(), s3 = useReveal(), s4 = useReveal(), s5 = useReveal();

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between glass border-b"
        style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <span className="font-game text-lg font-black" style={{ color: '#1a1a2e' }}>
          SCAVENGER<span style={{ color: '#f97316' }}>.WORK</span>
        </span>
        <div className="flex items-center gap-3">
          <a href="#how" className="text-sm font-bold hidden md:block" style={{ color: '#64748b' }}>How It Works</a>
          <a href="#classes" className="text-sm font-bold hidden md:block" style={{ color: '#64748b' }}>Classes</a>
          <Link href="/map"
            className="px-5 py-2 rounded-full text-sm font-black shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#f97316,#f59e0b)', color: 'white', boxShadow:'0 4px 16px #f9731655' }}>
            Play Now →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-6"
        style={{ background: 'linear-gradient(160deg, #fffef8 0%, #fff8e8 50%, #f0fdf4 100%)' }}>

        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #f59e0b33 1px, transparent 0)', backgroundSize:'40px 40px' }}/>

        {/* Floating SVG orbs */}
        {[
          { top:'12%', left:'8%',  size:80,  color:'#fde68a', delay:0 },
          { top:'20%', right:'6%', size:60,  color:'#ddd6fe', delay:0.5 },
          { top:'65%', left:'5%',  size:50,  color:'#bfdbfe', delay:1 },
          { top:'70%', right:'8%', size:90,  color:'#fed7aa', delay:0.3 },
          { top:'40%', left:'2%',  size:35,  color:'#bbf7d0', delay:0.8 },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full opacity-60 animate-float-slow pointer-events-none"
            style={{ ...(o as any), width:o.size, height:o.size, background:o.color, animationDelay:`${o.delay}s`,
              filter:'blur(2px)' }}/>
        ))}

        <motion.div style={{ y: heroY }} className="relative z-10 text-center max-w-3xl mx-auto">

          {/* Badge */}
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8"
            style={{ background:'#fff7ed', border:'1.5px solid #fed7aa', color:'#f97316' }}>
            🎮 Real-Life RPG · DeveloperWeek NYC 2026
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, type:'spring', stiffness:100 }}
            className="font-game text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"
            style={{ color:'#1a1a2e' }}>
            HUNT THE<br/>
            <span className="relative inline-block">
              <span style={{ WebkitTextStroke:'2px #f97316', color:'transparent' }}>OPPORTUNITY.</span>
              <motion.span className="absolute inset-0" style={{ color:'#f97316' }}
                animate={{ opacity:[0.7,1,0.7] }} transition={{ duration:2, repeat:Infinity }}>
                OPPORTUNITY.
              </motion.span>
            </span>
          </motion.h1>

          {/* Typewriter */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
            className="text-xl md:text-2xl font-bold mb-10 h-10 flex items-center justify-center"
            style={{ color:'#475569' }}>
            <span>{typeText}</span>
            <span className="inline-block w-0.5 h-6 ml-1 bg-current" style={{ animation:'cursor-blink 1s step-end infinite' }}/>
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/map"
              className="px-10 py-4 rounded-2xl font-black text-lg shadow-2xl transition-all hover:scale-105 hover:-translate-y-1"
              style={{ background:'linear-gradient(135deg,#f97316,#f59e0b)', color:'white', boxShadow:'0 8px 32px #f9731655' }}>
              🗺️ Open the Map
            </Link>
            <Link href="/radar"
              className="px-10 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 hover:-translate-y-1 card-pastel"
              style={{ color:'#1a1a2e' }}>
              🎯 AI Radar
            </Link>
          </motion.div>

          {/* Hero map preview */}
          <motion.div initial={{ opacity:0, y:40, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay:1.1, type:'spring', stiffness:80 }}
            className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl"
            style={{ border:'2px solid rgba(0,0,0,0.06)', boxShadow:'0 24px 80px rgba(0,0,0,0.12)' }}>
            <div className="aspect-[4/3]"><MapSVG/></div>
            {/* Overlay HUD */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="px-3 py-1.5 rounded-xl text-xs font-black glass"
                style={{ color:'#f97316', border:'1px solid #fed7aa' }}>
                🏰 FOUNDER · LVL 7
              </div>
              <div className="px-3 py-1.5 rounded-xl text-xs font-bold glass"
                style={{ color:'#64748b' }}>
                4 nearby
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color:'#94a3b8' }}>SCROLL TO EXPLORE</span>
          <motion.div className="w-0.5 h-8 rounded-full" style={{ background:'#cbd5e1' }}
            animate={{ scaleY:[0,1,0], originY:0 }} transition={{ duration:1.5, repeat:Infinity }}/>
        </motion.div>
      </section>

      {/* ── ENCOUNTER TYPES ── */}
      <section id="encounters" className="py-28 px-6 relative overflow-hidden"
        style={{ background:'linear-gradient(180deg, #f0fdf4 0%, #fffef8 100%)' }}>

        <div ref={s1} className="reveal max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 inline-block"
              style={{ background:'#f0fdf4', color:'#10b981', border:'1px solid #bbf7d0' }}>
              Game Mechanics
            </span>
            <h2 className="font-game text-4xl md:text-5xl font-black mt-3" style={{ color:'#1a1a2e' }}>
              HUNT BY RARITY
            </h2>
            <p className="text-lg mt-4 max-w-xl mx-auto font-semibold" style={{ color:'#64748b' }}>
              Every opportunity in the world has a rarity tier. Higher rarity = bigger XP reward.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ENCOUNTERS.map((enc, i) => (
              <motion.div key={enc.rarity}
                initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:enc.delay, type:'spring', stiffness:120 }}
                whileHover={{ y:-6, scale:1.02 }}
                className="rounded-2xl p-5 relative overflow-hidden cursor-pointer"
                style={{ background:enc.bg, border:`2px solid ${enc.border}`,
                  boxShadow: enc.rarity==='legendary' ? `0 8px 32px ${enc.color}33` : '0 4px 16px rgba(0,0,0,0.06)' }}>
                {enc.rarity === 'legendary' && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{ background:`linear-gradient(90deg, transparent, ${enc.color}, transparent)`,
                      animation:'shimmer 2s linear infinite', backgroundSize:'200% 100%' }}/>
                )}
                <div className="text-3xl mb-3">{enc.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color:enc.color }}>
                    {enc.rarity}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background:enc.color+'22', color:enc.color }}>
                    +{enc.xp} XP
                  </span>
                </div>
                <p className="font-black text-base mb-1" style={{ color:'#1a1a2e' }}>{enc.title}</p>
                <p className="text-xs font-semibold" style={{ color:'#94a3b8' }}>{enc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-28 px-6" style={{ background:'#fffef8' }}>
        <div ref={s2} className="reveal max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block"
              style={{ background:'#fff7ed', color:'#f97316', border:'1px solid #fed7aa' }}>
              Game Flow
            </span>
            <h2 className="font-game text-4xl md:text-5xl font-black mt-3" style={{ color:'#1a1a2e' }}>
              HOW YOU PLAY
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step:'01', icon:'🎯', title:'Scan the World', desc:'Open the AI Radar. State your goal. Nimble scans the live web for real opportunities near you — events, founders, hackathons.', color:'#3b82f6' },
              { step:'02', icon:'🗺️', title:'Hunt on the Map', desc:'Encounters appear on your fantasy map. Common, Rare, Epic, Legendary. Higher level = more opportunities revealed. Fog of war lifts as you progress.', color:'#8b5cf6' },
              { step:'03', icon:'⬆️', title:'Level Up', desc:'Hunt encounters to earn XP. Get AI-generated approach scripts. Level up to unlock rarer and more powerful opportunities.', color:'#f97316' },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.15, type:'spring', stiffness:100 }}
                className="relative p-7 rounded-3xl card-pastel text-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="font-game text-4xl font-black mb-3 opacity-10" style={{ color:step.color }}>
                  {step.step}
                </div>
                <h3 className="font-black text-xl mb-3" style={{ color:'#1a1a2e' }}>{step.title}</h3>
                <p className="text-sm font-semibold leading-relaxed" style={{ color:'#64748b' }}>{step.desc}</p>
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full" style={{ background:step.color }}/>
              </motion.div>
            ))}
          </div>

          {/* Radar preview */}
          <motion.div initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }} transition={{ delay:0.4 }}
            className="mt-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="font-game text-3xl font-black mb-4" style={{ color:'#1a1a2e' }}>AI OPPORTUNITY RADAR</h3>
              <p className="text-base font-semibold leading-relaxed mb-6" style={{ color:'#64748b' }}>
                Tell it your goal. The radar scans the live web with Nimble, finds real events and opportunities near you, then Tower's AI pipeline generates a personalised quest line.
              </p>
              <div className="space-y-3">
                {[
                  { icon:'🌐', text:'Live web scan via Nimble' },
                  { icon:'🤖', text:'AI quest generation via Tower + OpenAI' },
                  { icon:'📍', text:'Location-aware opportunities' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold">
                    <span className="text-lg">{item.icon}</span>
                    <span style={{ color:'#475569' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/radar" className="inline-block mt-8 px-8 py-3 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform"
                style={{ background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'white', boxShadow:'0 8px 24px #8b5cf655' }}>
                🎯 Try the Radar
              </Link>
            </div>
            <div className="w-48 h-48 mx-auto animate-float-slow"><RadarSVG/></div>
          </motion.div>
        </div>
      </section>

      {/* ── CLASS SELECT ── */}
      <section id="classes" className="py-28 px-6"
        style={{ background:'linear-gradient(180deg, #fffef8 0%, #fff8e8 100%)' }}>
        <div ref={s3} className="reveal max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block"
              style={{ background:'#fefce8', color:'#f59e0b', border:'1px solid #fde68a' }}>
              Character System
            </span>
            <h2 className="font-game text-4xl md:text-5xl font-black mt-3" style={{ color:'#1a1a2e' }}>
              CHOOSE YOUR CLASS
            </h2>
            <p className="text-lg mt-4 font-semibold max-w-xl mx-auto" style={{ color:'#64748b' }}>
              Your class shapes which opportunities the map reveals.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CLASSES.map((cls, i) => (
              <motion.div key={cls.name}
                initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:true }} transition={{ delay:i*0.07, type:'spring', stiffness:180 }}
                whileHover={{ y:-4, scale:1.03 }}
                className="rounded-2xl p-6 text-center cursor-pointer transition-all card-pastel"
                style={{ border:`2px solid ${cls.color}33` }}>
                <motion.div className="text-4xl mb-3 inline-block"
                  animate={{ y:[0,-4,0] }} transition={{ duration:2+i*0.3, repeat:Infinity }}>
                  {cls.emoji}
                </motion.div>
                <p className="font-black text-lg" style={{ color:'#1a1a2e' }}>{cls.name}</p>
                <div className="w-8 h-1 rounded-full mx-auto mt-2" style={{ background:cls.color }}/>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/"
              className="inline-block px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform"
              style={{ background:'linear-gradient(135deg,#f97316,#f59e0b)', color:'white', boxShadow:'0 8px 32px #f9731655' }}>
              Choose Your Class & Play →
            </Link>
          </div>
        </div>
      </section>

      {/* ── ENCOUNTER CARD DEMO ── */}
      <section className="py-28 px-6" style={{ background:'#f8fafc' }}>
        <div ref={s4} className="reveal max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4"
              style={{ background:'#fff7ed', color:'#f97316', border:'1px solid #fed7aa' }}>
              Encounter System
            </span>
            <h2 className="font-game text-3xl md:text-4xl font-black mb-5" style={{ color:'#1a1a2e' }}>
              EVERY CLICK<br/>IS AN ADVENTURE
            </h2>
            <p className="text-base font-semibold leading-relaxed mb-6" style={{ color:'#64748b' }}>
              Tap any encounter on the map. Get AI-powered approach scripts tailored to your class. Collect XP and level up to reveal rarer opportunities.
            </p>
            <div className="space-y-4">
              {[
                { icon:'💬', text:'AI approach scripts — how to actually show up' },
                { icon:'⬆️', text:'XP system — level gates unlock rare encounters' },
                { icon:'🔒', text:'Fog of war — the world reveals itself as you grow' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background:'#fff7ed', border:'1px solid #fed7aa' }}>{f.icon}</div>
                  <span className="text-sm font-bold" style={{ color:'#475569' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }} transition={{ type:'spring', stiffness:80 }}
            className="animate-float-slow">
            <QuestCardSVG/>
          </motion.div>
        </div>
      </section>

      {/* ── SPONSOR LOGOS ── */}
      <section className="py-20 px-6" style={{ background:'#fffef8' }}>
        <div ref={s5} className="reveal max-w-3xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-widest mb-8" style={{ color:'#94a3b8' }}>
            Powered By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name:'Nimble', desc:'Live Web Intelligence', emoji:'🌐', color:'#3b82f6' },
              { name:'Tower',  desc:'AI Data Pipeline',     emoji:'🏰', color:'#8b5cf6' },
              { name:'OpenAI', desc:'Quest Generation',     emoji:'🤖', color:'#10b981' },
              { name:'name.com', desc:'scavenger.work',     emoji:'🔤', color:'#f97316' },
            ].map((p, i) => (
              <motion.div key={p.name}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl card-pastel">
                <span className="text-xl">{p.emoji}</span>
                <div className="text-left">
                  <p className="font-black text-sm" style={{ color:'#1a1a2e' }}>{p.name}</p>
                  <p className="text-xs font-semibold" style={{ color:'#94a3b8' }}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 text-center relative overflow-hidden"
        style={{ background:'linear-gradient(135deg, #fff7ed 0%, #fff8e8 50%, #f0fdf4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #f59e0b44 1px, transparent 0)', backgroundSize:'32px 32px' }}/>
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="relative max-w-2xl mx-auto">
          <h2 className="font-game text-4xl md:text-6xl font-black mb-6" style={{ color:'#1a1a2e' }}>
            START HUNTING.
          </h2>
          <p className="text-xl font-bold mb-10" style={{ color:'#64748b' }}>
            Work is a scavenger hunt. The world is full of opportunities you can't see yet.
          </p>
          <Link href="/"
            className="inline-block px-14 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all"
            style={{ background:'linear-gradient(135deg,#f97316,#f59e0b)', color:'white',
              boxShadow:'0 12px 40px #f9731666' }}>
            ⚔️ Begin Your Adventure
          </Link>
          <p className="text-xs font-bold mt-6" style={{ color:'#94a3b8' }}>
            scavenger.work · DeveloperWeek New York 2026
          </p>
        </motion.div>
      </section>
    </div>
  );
}
