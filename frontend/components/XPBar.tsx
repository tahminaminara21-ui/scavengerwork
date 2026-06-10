'use client';
import { motion } from 'framer-motion';

const THRESHOLDS: [number,number][] = [[1,0],[5,200],[10,1000],[20,5000],[30,15000]];
const CLASS_COLORS: Record<string,string> = {
  Founder:'#f97316', Engineer:'#3b82f6', Designer:'#ec4899',
  Creator:'#10b981', Researcher:'#8b5cf6', Investor:'#f59e0b',
};

function pct(xp:number, level:number) {
  const i = THRESHOLDS.findIndex(([l])=>l===level);
  const cur = THRESHOLDS[i]?.[1]??0;
  const nxt = THRESHOLDS[i+1]?.[1]??cur+10000;
  return Math.min(100, ((xp-cur)/(nxt-cur))*100);
}

export default function XPBar({ xp, level, playerClass }:{ xp:number; level:number; playerClass:string }) {
  const color = CLASS_COLORS[playerClass] || '#f97316';
  const p = pct(xp, level);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-black min-w-[22px]" style={{ color }}>{level}</span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background:'rgba(0,0,0,0.06)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background:`linear-gradient(90deg, ${color}99, ${color}, ${color}99)`,
            backgroundSize:'200% 100%', animation:'shimmer 2s linear infinite' }}
          initial={{ width:0 }} animate={{ width:`${p}%` }} transition={{ duration:0.7, ease:'easeOut' }}/>
      </div>
      <span className="text-xs font-bold min-w-[44px] text-right" style={{ color:'#94a3b8' }}>{xp} XP</span>
    </div>
  );
}
