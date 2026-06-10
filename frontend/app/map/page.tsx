'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import XPBar from '@/components/XPBar';
import EncounterCard from '@/components/EncounterCard';
import type { Encounter } from '@/components/FantasyMap';

const FantasyMap = dynamic(() => import('@/components/FantasyMap'), { ssr: false });

const XP_TABLE: Record<string,number> = { common:10, rare:100, epic:300, legendary:1000 };
const CLASS_COLORS: Record<string,string> = {
  Founder:'#f97316', Engineer:'#3b82f6', Designer:'#ec4899',
  Creator:'#10b981', Researcher:'#8b5cf6', Investor:'#f59e0b',
};
const CLASS_EMOJI: Record<string,string> = {
  Founder:'🏰', Engineer:'⚡', Designer:'🎨', Creator:'🌟', Researcher:'🔬', Investor:'💰',
};

function calcLevel(xp:number) {
  if (xp>=15000) return 30;
  if (xp>=5000)  return 20;
  if (xp>=1000)  return 10;
  if (xp>=200)   return 5;
  return 1;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MapPage() {
  const [playerClass, setPlayerClass] = useState('Founder');
  const [xp, setXp]     = useState(0);
  const [level, setLevel] = useState(1);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [selected, setSelected] = useState<Encounter|null>(null);
  const [loading, setLoading] = useState(true);
  const [xpToast, setXpToast] = useState<{amount:number;rarity:string}|null>(null);
  const [levelUp, setLevelUp] = useState(false);

  useEffect(() => {
    const cls   = localStorage.getItem('playerClass') || 'Founder';
    const saved = parseInt(localStorage.getItem('xp') || '0');
    setPlayerClass(cls);
    setXp(saved);
    setLevel(calcLevel(saved));
  }, []);

  useEffect(() => {
    if (!playerClass) return;
    setLoading(true);
    const city = localStorage.getItem('city') || 'New York';
    const goal = localStorage.getItem('goal') || 'build a startup';
    fetch(`${API}/encounters/?player_class=${encodeURIComponent(playerClass)}&level=${level}&city=${encodeURIComponent(city)}&goal=${encodeURIComponent(goal)}`)
      .then(r=>r.json())
      .then(d=>setEncounters(d.encounters?.length ? d.encounters : FALLBACK))
      .catch(()=>setEncounters(FALLBACK))
      .finally(()=>setLoading(false));
  }, [level, playerClass]);

  const handleCollect = useCallback((enc:Encounter) => {
    const gained = XP_TABLE[enc.rarity] ?? 10;
    const newXp  = xp + gained;
    const newLvl = calcLevel(newXp);
    setXpToast({ amount:gained, rarity:enc.rarity });
    setTimeout(() => setXpToast(null), 1800);
    if (newLvl > level) { setLevelUp(true); setTimeout(()=>setLevelUp(false), 2800); }
    setXp(newXp); setLevel(newLvl); setSelected(null);
    localStorage.setItem('xp', String(newXp));
    localStorage.setItem('level', String(newLvl));
  }, [xp, level]);

  const color = CLASS_COLORS[playerClass] || '#f97316';
  const RARITY_C: Record<string,string> = { common:'#94a3b8', rare:'#3b82f6', epic:'#8b5cf6', legendary:'#f97316' };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background:'#f0fdf4' }}>

      {/* HUD */}
      <div className="relative z-20 px-4 pt-3 pb-3 animate-hud"
        style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)',
          borderBottom:'1.5px solid rgba(0,0,0,0.06)', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md flex-shrink-0"
            style={{ background:`${color}22`, border:`2px solid ${color}55` }}>
            {CLASS_EMOJI[playerClass]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black" style={{ color }}>{playerClass}</span>
              <span className="text-xs font-bold" style={{ color:'#94a3b8' }}>{encounters.length} nearby</span>
            </div>
            <XPBar xp={xp} level={level} playerClass={playerClass}/>
          </div>
          <Link href="/radar"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-md hover:scale-105 transition-transform"
            style={{ background:`linear-gradient(135deg,${color},${color}bb)`, boxShadow:`0 4px 16px ${color}44` }}>
            🎯
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)' }}>
            <div className="text-center">
              <motion.div className="text-4xl mb-3" animate={{ rotate:360 }} transition={{ duration:1.5, repeat:Infinity, ease:'linear' }}>
                🗺️
              </motion.div>
              <p className="text-sm font-black" style={{ color:'#64748b' }}>Scanning for opportunities...</p>
            </div>
          </div>
        )}

        <FantasyMap encounters={encounters} onEncounterClick={setSelected} playerLevel={level}/>

        {/* Soft vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(240,253,244,0.5) 100%)' }}/>

        {/* Level hint */}
        {level<5 && !selected && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="absolute bottom-24 left-4 right-4 z-10 py-2.5 px-4 rounded-2xl text-xs font-bold text-center"
            style={{ background:'rgba(255,255,255,0.9)', border:'1.5px solid rgba(0,0,0,0.08)',
              color:'#64748b', boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
            🔒 Collect encounters to unlock Rare opportunities
          </motion.div>
        )}

        {/* Bottom nav */}
        {!selected && (
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-5 pt-3 px-8"
            style={{ background:'linear-gradient(0deg, rgba(255,255,255,0.97) 60%, transparent 100%)' }}>
            <div className="flex items-center justify-around max-w-xs mx-auto">
              <Link href="/" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl card-pastel">
                  {CLASS_EMOJI[playerClass]}
                </div>
                <span className="text-xs font-bold" style={{ color:'#94a3b8' }}>Profile</span>
              </Link>

              <Link href="/radar">
                <motion.div whileTap={{ scale:0.9 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-2xl"
                  style={{ background:`linear-gradient(135deg,${color},${color}bb)`,
                    boxShadow:`0 6px 24px ${color}55` }}>
                  🎯
                </motion.div>
              </Link>

              <button className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl card-pastel">🎒</div>
                <span className="text-xs font-bold" style={{ color:'#94a3b8' }}>Quests</span>
              </button>
            </div>
          </div>
        )}

        {/* XP Toast */}
        <AnimatePresence>
          {xpToast && (
            <motion.div initial={{ opacity:0, y:-20, scale:0.85 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-28 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2.5 rounded-full font-black text-base"
              style={{ background:RARITY_C[xpToast.rarity]||'#f97316', color:'white',
                boxShadow:`0 6px 24px ${RARITY_C[xpToast.rarity]||'#f97316'}66` }}>
              +{xpToast.amount} XP ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up */}
        <AnimatePresence>
          {levelUp && (
            <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:1.1 }} transition={{ type:'spring', stiffness:200, damping:15 }}
              className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <div className="text-center px-10 py-8 rounded-3xl"
                style={{ background:'rgba(255,255,255,0.97)', border:`2.5px solid ${color}`,
                  boxShadow:`0 0 60px ${color}44` }}>
                <div className="text-5xl mb-3">⬆️</div>
                <p className="font-game text-2xl font-black" style={{ color }}>LEVEL UP!</p>
                <p className="text-sm font-bold mt-1" style={{ color:'#94a3b8' }}>New encounters unlocked</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Encounter card */}
      <AnimatePresence>
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 z-40">
            <EncounterCard encounter={selected} playerClass={playerClass}
              onCollect={handleCollect} onClose={()=>setSelected(null)} apiUrl={API}/>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FALLBACK: Encounter[] = [
  { id:'m1', title:'NYC AI Founders Meetup',    rarity:'rare',      lat:40.758,  lng:-73.9855, xp:100,  snippet:'Monthly gathering of AI startup founders' },
  { id:'m2', title:'YC Alumni Coffee Chat',      rarity:'epic',      lat:40.7489, lng:-73.968,  xp:300,  snippet:'1:1 with a YC-backed founder' },
  { id:'m3', title:'Angel Investor Open Hours',  rarity:'legendary', lat:40.7614, lng:-73.9776, xp:1000, snippet:'Pitch your idea in 10 minutes' },
  { id:'m4', title:'Read Paul Graham Essays',    rarity:'common',    lat:40.755,  lng:-73.98,   xp:10,   snippet:"Do Things That Don't Scale" },
  { id:'m5', title:'AI Startup Hackathon',       rarity:'epic',      lat:40.742,  lng:-73.99,   xp:300,  snippet:'48-hour build competition' },
  { id:'m6', title:'Indie Hackers NYC Meetup',   rarity:'rare',      lat:40.753,  lng:-73.975,  xp:100,  snippet:'Meet bootstrapped founders' },
  { id:'m7', title:'Startup Weekend NYC',        rarity:'rare',      lat:40.761,  lng:-73.982,  xp:100,  snippet:'54-hour launch event' },
  { id:'m8', title:'Tech Founder Coffee',        rarity:'common',    lat:40.749,  lng:-73.971,  xp:10,   snippet:'Casual chat with a local founder' },
];
