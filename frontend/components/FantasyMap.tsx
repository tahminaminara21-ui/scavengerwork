'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Encounter {
  id: string|number; title:string; rarity:string;
  lat:number; lng:number; snippet?:string; xp?:number; url?:string;
}
interface Props { encounters:Encounter[]; onEncounterClick:(e:Encounter)=>void; playerLevel:number; }

const R_COLOR: Record<string,string> = { common:'#94a3b8', rare:'#3b82f6', epic:'#8b5cf6', legendary:'#f97316' };
const R_SIZE:  Record<string,number> = { common:44, rare:54, epic:62, legendary:72 };

function getIcon(title:string) {
  const t=title.toLowerCase();
  if (t.includes('hackathon')) return '⚡';
  if (t.includes('invest')||t.includes('angel')) return '💎';
  if (t.includes('coffee')) return '☕';
  if (t.includes('meetup')||t.includes('networking')) return '🤝';
  if (t.includes('founder')) return '🏰';
  if (t.includes('workshop')||t.includes('class')) return '📚';
  return '🎯';
}

function markerHtml(rarity:string, title:string): string {
  const color = R_COLOR[rarity]||'#94a3b8';
  const sz    = R_SIZE[rarity]||44;
  const half  = sz/2;
  const icon  = getIcon(title);

  const rings = rarity==='legendary' ? `
    <circle cx="${half}" cy="${half}" r="${half*0.85}" fill="none" stroke="${color}" stroke-width="2" opacity="0">
      <animate attributeName="r" values="${half*0.55};${half*1.5}" dur="1.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${half}" cy="${half}" r="${half*0.85}" fill="none" stroke="${color}" stroke-width="2" opacity="0">
      <animate attributeName="r" values="${half*0.55};${half*1.5}" dur="1.6s" begin="0.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0" dur="1.6s" begin="0.8s" repeatCount="indefinite"/>
    </circle>` : rarity==='epic' ? `
    <circle cx="${half}" cy="${half}" r="${half*0.8}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0">
      <animate attributeName="r" values="${half*0.5};${half*1.4}" dur="2.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0" dur="2.2s" repeatCount="indefinite"/>
    </circle>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" overflow="visible">
    <defs>
      <radialGradient id="g${rarity}${sz}" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="white"/>
        <stop offset="60%" stop-color="${color}dd"/>
        <stop offset="100%" stop-color="${color}"/>
      </radialGradient>
      <filter id="s${rarity}">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${color}" flood-opacity="0.35"/>
      </filter>
    </defs>
    ${rings}
    <circle cx="${half}" cy="${half}" r="${half-2}" fill="white" opacity="0.6"/>
    <circle cx="${half}" cy="${half}" r="${half-5}" fill="url(#g${rarity}${sz})" filter="url(#s${rarity})"/>
    <ellipse cx="${half-sz*0.08}" cy="${half-sz*0.12}" rx="${sz*0.14}" ry="${sz*0.09}" fill="rgba(255,255,255,0.5)"/>
    <text x="${half}" y="${half+1}" text-anchor="middle" dominant-baseline="central" font-size="${sz*0.36}">
      ${icon}
    </text>
  </svg>`;
}

function MapContent({ encounters, onEncounterClick }: Omit<Props,'playerLevel'>) {
  const map = useMap();
  const markers = useRef<L.Marker[]>([]);
  const player  = useRef<L.Marker|null>(null);

  useEffect(() => {
    const NYC:[number,number] = [40.758,-73.9855];
    const playerIcon = L.divIcon({
      html:`<div style="width:18px;height:18px;border-radius:50%;
        background:radial-gradient(circle at 35% 35%,#93c5fd,#3b82f6);
        border:3px solid white;
        box-shadow:0 0 0 5px rgba(59,130,246,0.2),0 2px 8px rgba(0,0,0,0.2)">
      </div>`,
      className:'', iconSize:[18,18], iconAnchor:[9,9],
    });
    player.current = L.marker(NYC, { icon:playerIcon, zIndexOffset:1000 }).addTo(map);
    return () => { player.current?.remove(); };
  }, [map]);

  useEffect(() => {
    markers.current.forEach(m=>m.remove());
    markers.current = [];
    encounters.forEach(enc => {
      const sz = R_SIZE[enc.rarity]||44;
      const icon = L.divIcon({ html:markerHtml(enc.rarity, enc.title), className:'', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2] });
      const m = L.marker([enc.lat, enc.lng], { icon });
      m.on('click', ()=>onEncounterClick(enc));
      m.addTo(map);
      markers.current.push(m);
    });
    return () => { markers.current.forEach(m=>m.remove()); };
  }, [encounters, map, onEncounterClick]);

  return null;
}

export default function FantasyMap({ encounters, onEncounterClick, playerLevel }: Props) {
  const NYC:[number,number] = [40.758,-73.9855];
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl:'', iconUrl:'', shadowUrl:'' });
  }, []);

  return (
    <MapContainer center={NYC} zoom={15} style={{ height:'100%', width:'100%' }} zoomControl={false} attributionControl={false}>
      {/* CartoDB Voyager — clean, bright, pastel-friendly */}
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"/>
      <MapContent encounters={encounters} onEncounterClick={onEncounterClick}/>
    </MapContainer>
  );
}
