'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Encounter } from './FantasyMap';

const R_COLOR: Record<string,string> = { common:'#94a3b8', rare:'#3b82f6', epic:'#8b5cf6', legendary:'#f97316' };
const R_XP:    Record<string,number> = { common:10, rare:100, epic:300, legendary:1000 };
const R_LABEL: Record<string,string> = { common:'Common', rare:'Rare', epic:'Epic', legendary:'Legendary' };
const R_BG:    Record<string,string> = {
  common:'#f8fafc', rare:'#eff6ff', epic:'#f5f3ff', legendary:'#fff7ed',
};
const R_BORDER: Record<string,string> = {
  common:'#e2e8f0', rare:'#bfdbfe', epic:'#ddd6fe', legendary:'#fed7aa',
};

function getIcon(title:string) {
  const t=title.toLowerCase();
  if (t.includes('hackathon')) return '⚡';
  if (t.includes('invest')||t.includes('angel')) return '💎';
  if (t.includes('coffee')) return '☕';
  if (t.includes('meetup')) return '🤝';
  if (t.includes('founder')) return '🏰';
  return '🎯';
}

interface Props { encounter:Encounter|null; playerClass:string; onCollect:(e:Encounter)=>void; onClose:()=>void; apiUrl:string; }

export default function EncounterCard({ encounter, playerClass, onCollect, onClose, apiUrl }:Props) {
  const [approach, setApproach]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [collected, setCollected] = useState(false);

  if (!encounter) return null;

  const color  = R_COLOR[encounter.rarity]||'#94a3b8';
  const xp     = encounter.xp ?? R_XP[encounter.rarity] ?? 10;

  async function fetchApproach() {
    setLoading(true);
    try {
      const r = await fetch(`${apiUrl}/encounters/approach?title=${encodeURIComponent(encounter!.title)}&snippet=${encodeURIComponent(encounter!.snippet||'')}&player_class=${encodeURIComponent(playerClass)}`);
      const d = await r.json();
      setApproach(d.approach_script);
    } catch {
      setApproach(`As a ${playerClass}: walk in, state what you're building in one sentence, ask one sharp question.`);
    }
    setLoading(false);
  }

  function collect() {
    setCollected(true);
    setTimeout(() => { onCollect(encounter!); setCollected(false); setApproach(''); }, 700);
  }

  return (
    <motion.div
      initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
      transition={{ type:'spring', damping:32, stiffness:320 }}
      className="rounded-t-3xl overflow-hidden"
      style={{ background:R_BG[encounter.rarity]||'white', border:`2px solid ${R_BORDER[encounter.rarity]||'#e2e8f0'}`,
        borderBottom:'none', boxShadow:`0 -8px 40px ${color}22` }}>

      {/* Color strip */}
      <div className="h-1 w-full" style={{ background:`linear-gradient(90deg, transparent, ${color}, transparent)` }}/>

      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full" style={{ background:'rgba(0,0,0,0.1)' }}/>
      </div>

      <div className="px-5 pb-6 pt-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md"
              style={{ background:`${color}18`, border:`2px solid ${color}44` }}>
              {getIcon(encounter.title)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background:color }}/>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>
                  {R_LABEL[encounter.rarity]}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background:`${color}18`, color, border:`1px solid ${color}44` }}>
                  +{xp} XP
                </span>
              </div>
              <h2 className="text-base font-black leading-tight" style={{ color:'#1a1a2e' }}>{encounter.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-2xl mt-0.5 flex-shrink-0" style={{ color:'#cbd5e1' }}>×</button>
        </div>

        {encounter.snippet && (
          <p className="text-sm mb-4 leading-relaxed font-semibold" style={{ color:'#64748b' }}>{encounter.snippet}</p>
        )}

        <AnimatePresence>
          {(approach||loading) && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }}
              className="rounded-2xl p-4 mb-4 text-sm leading-relaxed font-semibold"
              style={{ background:'rgba(255,255,255,0.8)', border:`1.5px solid ${color}33`, color:'#475569' }}>
              {loading
                ? <span className="animate-pulse" style={{ color:'#94a3b8' }}>Crafting your approach...</span>
                : <><span className="font-black" style={{ color }}>Your move:</span> {approach}</>
              }
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2.5">
          {!approach && !loading && (
            <button onClick={fetchApproach}
              className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-80"
              style={{ background:'rgba(0,0,0,0.04)', border:'1.5px solid rgba(0,0,0,0.08)', color:'#475569' }}>
              💬 How to Approach
            </button>
          )}
          <motion.button onClick={collect} whileTap={{ scale:0.95 }}
            animate={collected ? { scale:[1,1.1,0.95,1] } : {}}
            className="rounded-2xl font-black text-sm py-3 shadow-lg transition-all"
            style={{
              flex: approach ? 1 : '0 0 auto', minWidth: approach ? undefined : 120,
              background: collected ? 'linear-gradient(135deg,#10b981,#059669)' : `linear-gradient(135deg,${color},${color}cc)`,
              color:'white', boxShadow:`0 4px 20px ${color}44`,
            }}>
            {collected ? '✓ Collected!' : 'Hunt It! →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
