'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CLASSES = [
  { name:'Founder',    emoji:'🏰', color:'#f97316', grad:'linear-gradient(135deg,#f97316,#ef4444)', desc:'Build from nothing' },
  { name:'Engineer',   emoji:'⚡',  color:'#3b82f6', grad:'linear-gradient(135deg,#3b82f6,#4f46e5)', desc:'Create the future' },
  { name:'Designer',   emoji:'🎨', color:'#ec4899', grad:'linear-gradient(135deg,#ec4899,#8b5cf6)', desc:'Shape the world' },
  { name:'Creator',    emoji:'🌟', color:'#10b981', grad:'linear-gradient(135deg,#10b981,#06b6d4)', desc:'Tell stories' },
  { name:'Researcher', emoji:'🔬', color:'#8b5cf6', grad:'linear-gradient(135deg,#8b5cf6,#4f46e5)', desc:'Find what\'s hidden' },
  { name:'Investor',   emoji:'💰', color:'#f59e0b', grad:'linear-gradient(135deg,#f59e0b,#f97316)', desc:'Bet on tomorrow' },
];

const INTRO = [
  { main:'A founder meetup is 600m away.',    sub:'You just can\'t see it yet.' },
  { main:'An angel investor just arrived.',   sub:'In your city. Right now.' },
  { main:'The world is full of quests.',      sub:'Scavenger.Work reveals them.' },
];

export default function OnboardingPage() {
  const [phase, setPhase] = useState<'intro'|'select'|'setup'>('intro');
  const [line, setLine] = useState(0);
  const [selected, setSelected] = useState<typeof CLASSES[0]|null>(null);
  const [goal, setGoal] = useState('');
  const [city, setCity] = useState('New York');
  const router = useRouter();

  useEffect(() => {
    if (phase !== 'intro') return;
    if (line < INTRO.length - 1) {
      const t = setTimeout(() => setLine(l => l + 1), 2200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('select'), 1800);
    return () => clearTimeout(t);
  }, [line, phase]);

  function start() {
    if (!selected) return;
    localStorage.setItem('playerClass', selected.name);
    localStorage.setItem('playerColor', selected.color);
    localStorage.setItem('xp', '0');
    localStorage.setItem('level', '1');
    localStorage.setItem('city', city);
    localStorage.setItem('goal', goal || `become a great ${selected.name.toLowerCase()}`);
    router.push('/map');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden"
      style={{ background:'linear-gradient(160deg, #fffef8 0%, #fff8e8 60%, #f0fdf4 100%)' }}>

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #f59e0b55 1px, transparent 0)', backgroundSize:'36px 36px' }}/>

      {/* Floating blobs */}
      {[
        {top:'8%',  left:'6%',  w:70,  c:'#fde68a'},
        {top:'15%', right:'5%', w:50,  c:'#ddd6fe'},
        {top:'70%', left:'4%',  w:60,  c:'#bfdbfe'},
        {top:'75%', right:'7%', w:80,  c:'#fed7aa'},
      ].map((b,i)=>(
        <div key={i} className="absolute rounded-full opacity-50 animate-float pointer-events-none"
          style={{ ...(b as any), width:b.w, height:b.w, background:b.c, filter:'blur(3px)', animationDelay:`${i*0.4}s` }}/>
      ))}

      {/* Nav */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6">
        <span className="font-game text-base font-black" style={{ color:'#1a1a2e' }}>
          SCAVENGER<span style={{ color:'#f97316' }}>.WORK</span>
        </span>
        <Link href="/landing" className="text-xs font-bold" style={{ color:'#94a3b8' }}>About ↗</Link>
      </div>

      <AnimatePresence mode="wait">

        {/* INTRO */}
        {phase === 'intro' && (
          <motion.div key="intro" exit={{ opacity:0, y:-20 }} className="text-center max-w-lg relative z-10">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200 }}
              className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center text-5xl shadow-xl"
              style={{ background:'linear-gradient(135deg,#f97316,#f59e0b)', boxShadow:'0 8px 32px #f9731655' }}>
              🗺️
            </motion.div>
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              className="font-game text-3xl font-black mb-2" style={{ color:'#1a1a2e' }}>
              SCAVENGER<span style={{ color:'#f97316' }}>.WORK</span>
            </motion.h1>
            <p className="text-xs font-black uppercase tracking-widest mb-10" style={{ color:'#94a3b8' }}>
              Real-Life RPG for Ambitious People
            </p>
            <div className="h-20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={line}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
                  transition={{ duration:0.4 }} className="text-center">
                  <p className="text-2xl font-black mb-2" style={{ color:'#1a1a2e' }}>{INTRO[line].main}</p>
                  <p className="text-base font-semibold" style={{ color:'#94a3b8' }}>{INTRO[line].sub}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {INTRO.map((_,i) => (
                <motion.div key={i} className="h-2 rounded-full"
                  animate={{ width: i===line ? 28 : 8 }}
                  style={{ background: i===line ? '#f97316' : '#e2e8f0' }}/>
              ))}
            </div>
          </motion.div>
        )}

        {/* CLASS SELECT */}
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            className="w-full max-w-lg relative z-10">
            <div className="text-center mb-8">
              <h2 className="font-game text-2xl font-black mb-1" style={{ color:'#1a1a2e' }}>CHOOSE YOUR CLASS</h2>
              <p className="text-sm font-semibold" style={{ color:'#94a3b8' }}>Your class shapes which opportunities appear</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CLASSES.map((cls, i) => (
                <motion.button key={cls.name}
                  initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:i*0.06, type:'spring', stiffness:220 }}
                  whileTap={{ scale:0.95 }}
                  onClick={() => { setSelected(cls); setPhase('setup'); }}
                  className="relative overflow-hidden rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  style={{ background:cls.grad, minHeight:120 }}>
                  {/* Shine */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl"
                    style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 100%)' }}/>
                  <div className="text-4xl mb-2 relative z-10">{cls.emoji}</div>
                  <div className="font-black text-lg text-white relative z-10">{cls.name}</div>
                  <div className="text-xs font-semibold mt-0.5 relative z-10" style={{ color:'rgba(255,255,255,0.75)' }}>
                    {cls.desc}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* SETUP */}
        {phase === 'setup' && selected && (
          <motion.div key="setup" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ type:'spring', stiffness:220, damping:24 }}
            className="w-full max-w-sm relative z-10">

            {/* Class hero card */}
            <div className="rounded-3xl p-8 text-center mb-6 relative overflow-hidden shadow-2xl"
              style={{ background:selected.grad, boxShadow:`0 12px 40px ${selected.color}55` }}>
              <div className="absolute top-0 left-0 right-0 h-1/2"
                style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%)' }}/>
              <motion.div className="text-6xl mb-3 relative z-10 inline-block animate-float">
                {selected.emoji}
              </motion.div>
              <h2 className="font-game text-3xl font-black text-white relative z-10">{selected.name}</h2>
              <p className="text-sm font-semibold mt-1 relative z-10" style={{ color:'rgba(255,255,255,0.75)' }}>
                {selected.desc}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest block mb-1.5" style={{ color:'#94a3b8' }}>
                  Your Goal
                </label>
                <input value={goal} onChange={e=>setGoal(e.target.value)}
                  placeholder={`e.g. launch my first startup...`}
                  className="w-full rounded-2xl px-4 py-3.5 font-semibold text-sm outline-none"
                  style={{ background:'rgba(255,255,255,0.9)', border:`2px solid ${selected.color}33`, color:'#1a1a2e' }}
                  onFocus={e=>e.target.style.borderColor=selected.color}
                  onBlur={e=>e.target.style.borderColor=`${selected.color}33`}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest block mb-1.5" style={{ color:'#94a3b8' }}>City</label>
                <input value={city} onChange={e=>setCity(e.target.value)}
                  className="w-full rounded-2xl px-4 py-3.5 font-semibold text-sm outline-none"
                  style={{ background:'rgba(255,255,255,0.9)', border:`2px solid ${selected.color}33`, color:'#1a1a2e' }}
                  onFocus={e=>e.target.style.borderColor=selected.color}
                  onBlur={e=>e.target.style.borderColor=`${selected.color}33`}
                />
              </div>
            </div>

            <motion.button onClick={start} whileTap={{ scale:0.96 }}
              className="w-full py-4 rounded-2xl font-black text-lg shadow-2xl"
              style={{ background:selected.grad, color:'white', boxShadow:`0 8px 32px ${selected.color}55` }}>
              Start Hunting →
            </motion.button>
            <button onClick={()=>setPhase('select')} className="w-full text-center text-sm font-bold mt-4"
              style={{ color:'#94a3b8' }}>← Change Class</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
