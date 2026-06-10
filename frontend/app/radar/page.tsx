'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const R_COLOR:  Record<string,string> = { common:'#94a3b8', rare:'#3b82f6', epic:'#8b5cf6', legendary:'#f97316' };
const R_BG:     Record<string,string> = { common:'#f8fafc', rare:'#eff6ff', epic:'#f5f3ff', legendary:'#fff7ed' };
const R_BORDER: Record<string,string> = { common:'#e2e8f0', rare:'#bfdbfe', epic:'#ddd6fe', legendary:'#fed7aa' };
const R_ICON:   Record<string,string> = { common:'⚪', rare:'🔵', epic:'🟣', legendary:'🟡' };
const CLASS_COLORS: Record<string,string> = {
  Founder:'#f97316', Engineer:'#3b82f6', Designer:'#ec4899',
  Creator:'#10b981', Researcher:'#8b5cf6', Investor:'#f59e0b',
};

interface Quest { quest_title:string; opportunity_title:string; approach:string; xp:number; rarity:string; }
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const STEPS = [
  { icon:'🌐', text:'Scanning live web with Nimble...' },
  { icon:'📍', text:`Finding opportunities nearby...` },
  { icon:'🤖', text:'AI building your quest line...' },
  { icon:'⚔️', text:'Adventure ready.' },
];

export default function RadarPage() {
  const [playerClass, setPlayerClass] = useState('Founder');
  const [goal,   setGoal]   = useState('');
  const [city,   setCity]   = useState('New York');
  const [phase,  setPhase]  = useState<'idle'|'scanning'|'done'>('idle');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [step,   setStep]   = useState(0);

  useEffect(() => {
    setPlayerClass(localStorage.getItem('playerClass')||'Founder');
    setCity(localStorage.getItem('city')||'New York');
    setGoal(localStorage.getItem('goal')||'');
  }, []);

  const color = CLASS_COLORS[playerClass]||'#f97316';

  async function scan() {
    if (!goal.trim()) return;
    setPhase('scanning'); setQuests([]); setStep(0);
    for (let i=1; i<STEPS.length; i++) {
      await new Promise(r=>setTimeout(r, 750));
      setStep(i);
    }
    try {
      const r = await fetch(`${API}/quest-radar/?player_class=${encodeURIComponent(playerClass)}&goal=${encodeURIComponent(goal)}&city=${encodeURIComponent(city)}`);
      const d = await r.json();
      setQuests(d.quest_line?.length ? d.quest_line : FALLBACK);
    } catch { setQuests(FALLBACK); }
    setPhase('done');
    localStorage.setItem('goal', goal);
  }

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(160deg, #fffef8 0%, #fff8e8 60%, #f0fdf4 100%)' }}>
      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none opacity-25"
        style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #f59e0b44 1px, transparent 0)', backgroundSize:'36px 36px' }}/>

      <div className="relative z-10 max-w-lg mx-auto px-5 pb-16 pt-5">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/map" className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg card-pastel hover:scale-105 transition-transform">←</Link>
          <h1 className="font-game text-xl font-black" style={{ color:'#1a1a2e' }}>AI OPPORTUNITY RADAR</h1>
          <span className="ml-auto text-xs font-black px-3 py-1 rounded-full"
            style={{ background:`${color}18`, color, border:`1.5px solid ${color}44` }}>{playerClass}</span>
        </div>

        {/* Input */}
        <div className="rounded-3xl p-5 mb-5 card-pastel">
          <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color:'#94a3b8' }}>
            What do you want to achieve?
          </label>
          <textarea value={goal} onChange={e=>setGoal(e.target.value)} rows={2} placeholder="e.g. launch my first startup, get 100 customers..."
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold resize-none outline-none mb-3"
            style={{ background:'rgba(0,0,0,0.03)', border:'2px solid rgba(0,0,0,0.07)', color:'#1a1a2e' }}
            onFocus={e=>e.target.style.borderColor=color}
            onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.07)'}
          />
          <div className="flex gap-2">
            <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City"
              className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-semibold outline-none"
              style={{ background:'rgba(0,0,0,0.03)', border:'2px solid rgba(0,0,0,0.07)', color:'#1a1a2e' }}
              onFocus={e=>e.target.style.borderColor=color}
              onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.07)'}
            />
            <motion.button onClick={scan} disabled={phase==='scanning'||!goal.trim()}
              whileTap={{ scale:0.95 }}
              className="px-6 py-2.5 rounded-2xl font-black text-sm shadow-lg disabled:opacity-40"
              style={{ background:`linear-gradient(135deg,${color},${color}bb)`, color:'white', boxShadow:`0 4px 16px ${color}44` }}>
              {phase==='scanning' ? '...' : '🔍 Scan'}
            </motion.button>
          </div>
        </div>

        {/* Scanning */}
        <AnimatePresence>
          {phase==='scanning' && (
            <motion.div key="scan" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="rounded-3xl p-7 text-center card-pastel">
              {/* Radar */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                {[0,1,2].map(i=>(
                  <div key={i} className="absolute rounded-full border" style={{ inset:`${i*14}%`, borderColor:`${color}40` }}/>
                ))}
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ background:`conic-gradient(${color}55 0deg, transparent 100deg)` }}
                  animate={{ rotate:360 }} transition={{ duration:1.5, repeat:Infinity, ease:'linear' }}/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full" style={{ background:color }}/>
                </div>
                {[{t:'18%',l:'65%'},{t:'55%',l:'78%'},{t:'72%',l:'32%'}].map((p,i)=>(
                  <motion.div key={i} className="absolute w-2.5 h-2.5 rounded-full"
                    style={{ top:p.t, left:p.l, background:color }}
                    animate={{ opacity:[0,1,0] }} transition={{ duration:1.5, delay:i*0.5, repeat:Infinity }}/>
                ))}
              </div>
              <div className="space-y-2 text-left max-w-xs mx-auto">
                {STEPS.slice(0, step+1).map((s,i)=>(
                  <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    className="flex items-center gap-2 text-sm font-semibold">
                    <span>{s.icon}</span>
                    <span style={{ color: i===step ? '#1a1a2e' : '#94a3b8' }}>{s.text}</span>
                    {i<step && <span className="ml-auto text-xs font-black" style={{ color:'#10b981' }}>✓</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {phase==='done' && (
            <motion.div key="done" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-game text-xl font-black" style={{ color:'#1a1a2e' }}>TODAY'S ADVENTURE</h2>
                  <p className="text-xs font-bold mt-0.5" style={{ color:'#94a3b8' }}>{city} · {playerClass}</p>
                </div>
                <span className="text-xs font-black px-3 py-1.5 rounded-full"
                  style={{ background:`${color}18`, color, border:`1.5px solid ${color}44` }}>
                  {quests.reduce((s,q)=>s+q.xp,0)} total XP
                </span>
              </div>

              <div className="space-y-3">
                {quests.map((q,i)=>(
                  <motion.div key={i}
                    initial={{ opacity:0, x:-20, y:8 }} animate={{ opacity:1, x:0, y:0 }}
                    transition={{ delay:i*0.12, type:'spring', stiffness:200 }}
                    className="rounded-2xl p-4 border"
                    style={{ background:R_BG[q.rarity], borderColor:R_BORDER[q.rarity] }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{R_ICON[q.rarity]}</span>
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color:R_COLOR[q.rarity] }}>
                          {q.rarity}
                        </span>
                      </div>
                      <span className="font-black text-sm" style={{ color:R_COLOR[q.rarity] }}>+{q.xp} XP</span>
                    </div>
                    <p className="font-black text-base mb-0.5" style={{ color:'#1a1a2e' }}>{q.quest_title}</p>
                    <p className="text-xs font-semibold mb-2.5" style={{ color:'#94a3b8' }}>{q.opportunity_title}</p>
                    {q.approach && (
                      <div className="rounded-xl px-3 py-2 text-xs font-semibold leading-relaxed"
                        style={{ background:'rgba(255,255,255,0.7)', color:'#475569', border:'1px solid rgba(0,0,0,0.06)' }}>
                        → {q.approach}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:quests.length*0.12+0.15 }}
                className="flex gap-3 mt-5">
                <Link href="/map" className="flex-1 text-center py-3.5 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform"
                  style={{ background:`linear-gradient(135deg,${color},${color}bb)`, color:'white', boxShadow:`0 4px 20px ${color}44` }}>
                  View on Map →
                </Link>
                <button onClick={()=>{setPhase('idle');setQuests([]);}}
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm card-pastel hover:scale-105 transition-transform"
                  style={{ color:'#64748b' }}>
                  Rescan
                </button>
              </motion.div>
              <p className="text-center text-xs mt-4 font-semibold" style={{ color:'#cbd5e1' }}>
                Live data via Nimble · Quest AI via Tower + OpenAI
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const FALLBACK: Quest[] = [
  { rarity:'common',    quest_title:'Read a Founder Story',       opportunity_title:'Paul Graham Essays',   approach:"Read 'Do Things That Don't Scale' and note 3 things you'll do this week.",  xp:10 },
  { rarity:'rare',      quest_title:'Attend a Startup Meetup',    opportunity_title:'NYC Founders Meetup',  approach:'Show up and talk to 3 people — ask what their biggest challenge is.',        xp:100 },
  { rarity:'epic',      quest_title:'Interview a Real Founder',   opportunity_title:'YC Alumni Network',    approach:"DM a founder: 'I'm building X. Can I ask 3 questions in 10 mins?'",        xp:300 },
  { rarity:'legendary', quest_title:'Land Your First Customer',   opportunity_title:'Your Target Market',   approach:'Post in one community describing the problem — ask who wants early access.', xp:1000 },
];
