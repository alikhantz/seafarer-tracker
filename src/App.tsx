import { useState, useEffect, useMemo } from 'react';

const AnchorLogoIcon = () => (
  <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="8" r="5" fill="none" stroke="white" strokeWidth="2.2"/>
    <path d="M20 13 L20 30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M10 17.5 L30 17.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M12 27 Q20 35 28 27" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M10.5 24.5 L13.5 27.5 L9.5 28.5 Z" fill="white"/>
    <path d="M29.5 24.5 L26.5 27.5 L30.5 28.5 Z" fill="white"/>
  </svg>
);

const ModernBinocularIcon = () => (
  <svg viewBox="0 0 32 20" className="w-6 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3 Q2 1 4 1 L9.5 1 Q12 1 12 3 L13 14 Q13 16.5 10.5 16.5 L3.5 16.5 Q1 16.5 1 14 Z" fill="#0f172a" stroke="white" strokeWidth="0.9"/>
    <path d="M30 3 Q30 1 28 1 L22.5 1 Q20 1 20 3 L19 14 Q19 16.5 21.5 16.5 L28.5 16.5 Q31 16.5 31 14 Z" fill="#0f172a" stroke="white" strokeWidth="0.9"/>
    <rect x="12" y="2" width="8" height="3" rx="1.2" fill="#1e293b" stroke="white" strokeWidth="0.6"/>
    <ellipse cx="7" cy="12" rx="4" ry="3.6" fill="#0ea5e9" stroke="#0284c7" strokeWidth="0.7"/>
    <ellipse cx="25" cy="12" rx="4" ry="3.6" fill="#0ea5e9" stroke="#0284c7" strokeWidth="0.7"/>
    <ellipse cx="7" cy="12" rx="2.8" ry="2.2" fill="#38bdf8" opacity="0.5"/>
    <ellipse cx="25" cy="12" rx="2.8" ry="2.2" fill="#38bdf8" opacity="0.5"/>
    <path d="M5.2 10.2 C5.2 9 6.2 8.2 7.4 8.2 C7.4 8.2 6.6 8.8 6.2 9.6 C5.8 10.2 5.6 10.8 5.2 10.2 Z" fill="white" opacity="0.95"/>
    <path d="M23.2 10.2 C23.2 9 24.2 8.2 25.4 8.2 C25.4 8.2 24.6 8.8 24.2 9.6 C23.8 10.2 23.6 10.8 23.2 10.2 Z" fill="white" opacity="0.95"/>
  </svg>
);

const fontLinks = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Instrument+Sans:wght@400;500;600&display=swap');
`;

type Breakdown = {
  deckWork: number; engineWork: number; watch: number; bridgeLookout: number; engineWatch: number;
  standby: number; mooring: number; bunkering: number;
  provisionDeck: number; provisionEngine: number; provisionGalley: number;
  garbage: number; cargo: number; drills: number; other: number;
  galleyWork: number; cooking: number; messService: number;
};
type Entry = {
  breakdown: Breakdown; totalWork: number;
  location: 'At Sea' | 'At Port'; duty: 'Regular Work' | 'Watch Duty' | 'Standby / Extra' | 'Rest Day';
  watchSlot: string; notes: string; date: string;
  portName: string; arrivalTime: string; departureTime: string;
};
type Rank = 'Master / Captain' | 'Chief Mate / Chief Officer' | 'Second Mate / Second Officer' | 'Third Mate / Third Officer' | 'Deck Cadet' | 'Bosun / Boatswain' | 'Able Seaman (AB)' | 'Ordinary Seaman (OS)' | 'Chief Engineer' | 'Second Engineer' | 'Third Engineer' | 'Fourth Engineer' | 'Electrical Officer (ETO)' | 'Fitter' | 'Oiler / Motorman' | 'Wiper' | 'Engine Cadet' | 'Chief Steward' | 'Chief Cook' | 'Second Cook' | 'Messman' | 'Steward / Utility';
type Department = 'Deck' | 'Engine' | 'Galley';
type VesselInfo = { name: string; type: string; imo: string; flag: string; masterName: string; };
type SeafarerInfo = { name: string; employeeNo: string; department: Department; };
type TimeSettings = { gmtOffset: number; shipTimeEnabled: boolean; label: string; };

const VESSEL_TYPES = ['','Container Ship','Bulk Carrier','Oil Tanker','Chemical Tanker','LNG Carrier','LPG Carrier','General Cargo','Ro-Ro / Vehicle Carrier','Passenger / Cruise','Offshore Supply Vessel','Tug Boat','Fishing Vessel','Other'];
const FLAG_REGISTRIES = ['','Panama','Liberia','Marshall Islands','Hong Kong','Singapore','Malta','Bahamas','Greece','Japan','China','Philippines','USA','UK','Norway','Denmark','Germany','Italy','South Korea','Cyprus','Isle of Man','Other'];
const RANKS: { label: string, dept: 'Deck'|'Engine'|'Galley', icon: string }[] = [
  { label: 'Master / Captain', dept: 'Deck', icon: '👨‍✈️' },{ label: 'Chief Mate / Chief Officer', dept: 'Deck', icon: '🧭' },{ label: 'Second Mate / Second Officer', dept: 'Deck', icon: '🗺️' },{ label: 'Third Mate / Third Officer', dept: 'Deck', icon: '📡' },{ label: 'Deck Cadet', dept: 'Deck', icon: '🎓' },{ label: 'Bosun / Boatswain', dept: 'Deck', icon: '🪢' },{ label: 'Able Seaman (AB)', dept: 'Deck', icon: '🛞' },{ label: 'Ordinary Seaman (OS)', dept: 'Deck', icon: '⚓' },
  { label: 'Chief Engineer', dept: 'Engine', icon: '⚙️' },{ label: 'Second Engineer', dept: 'Engine', icon: '🔧' },{ label: 'Third Engineer', dept: 'Engine', icon: '🔩' },{ label: 'Fourth Engineer', dept: 'Engine', icon: '🛠️' },{ label: 'Electrical Officer (ETO)', dept: 'Engine', icon: '💡' },{ label: 'Fitter', dept: 'Engine', icon: '🔨' },{ label: 'Oiler / Motorman', dept: 'Engine', icon: '⛽' },{ label: 'Wiper', dept: 'Engine', icon: '🧹' },{ label: 'Engine Cadet', dept: 'Engine', icon: '🎓' },
  { label: 'Chief Steward', dept: 'Galley', icon: '👨‍🍳' },{ label: 'Chief Cook', dept: 'Galley', icon: '🍳' },{ label: 'Second Cook', dept: 'Galley', icon: '🥘' },{ label: 'Messman', dept: 'Galley', icon: '🍽️' },{ label: 'Steward / Utility', dept: 'Galley', icon: '🧼' },
];
const BREAKDOWN_FIELDS: { key: keyof Breakdown; label: string; short: string; icon: string; tab: 'deck'|'engine'|'galley'|'drills'|'others'; }[] = [
  // Deck Department
  { key: 'deckWork', label: 'Deck Work', short: 'Deck Work', icon: '🛠️', tab: 'deck' },
  { key: 'watch', label: 'Watch Duty', short: 'Watch', icon: '👀', tab: 'deck' },
  { key: 'bridgeLookout', label: 'Bridge Lookout', short: 'Bridge Lookout', icon: '🔭', tab: 'deck' },
  { key: 'mooring', label: 'Mooring / Unmooring', short: 'Mooring', icon: '⚓', tab: 'deck' },
  { key: 'cargo', label: 'Cargo Operations', short: 'Cargo', icon: '📦', tab: 'deck' },
  { key: 'provisionDeck', label: 'Deck Store', short: 'Deck Store', icon: '📦', tab: 'deck' },
  { key: 'garbage', label: 'Garbage Disposal', short: 'Garbage', icon: '♻️', tab: 'deck' },
  // Engine Department
  { key: 'engineWork', label: 'Engine Work', short: 'Engine Work', icon: '🔧', tab: 'engine' },
  { key: 'engineWatch', label: 'Engine Watch', short: 'Engine Watch', icon: '⚙️', tab: 'engine' },
  { key: 'bunkering', label: 'Bunkering', short: 'Bunkering', icon: '⛽', tab: 'engine' },
  { key: 'provisionEngine', label: 'Engine Store', short: 'Engine Store', icon: '⚙️', tab: 'engine' },
  // Galley Department
  { key: 'galleyWork', label: 'Galley Work', short: 'Galley Work', icon: '🍳', tab: 'galley' },
  { key: 'cooking', label: 'Cooking / Food Prep', short: 'Cooking', icon: '🥘', tab: 'galley' },
  { key: 'messService', label: 'Mess Service / Cleaning', short: 'Mess Service', icon: '🍽️', tab: 'galley' },
  { key: 'provisionGalley', label: 'Galley Store/Provision', short: 'Galley Store', icon: '🧑‍🍳', tab: 'galley' },
  // Drills
  { key: 'drills', label: 'Drills / Training', short: 'Drills', icon: '🛟', tab: 'drills' },
  { key: 'standby', label: 'Standby / Extra', short: 'Standby', icon: '⏳', tab: 'drills' },
  // Others
  { key: 'other', label: 'Other Duties', short: 'Other', icon: '🔧', tab: 'others' },
];

const TASK_TABS: { id: 'deck'|'engine'|'galley'|'drills'|'others'; label: string; short: string; icon: string; }[] = [
  { id: 'deck', label: 'Deck Dept', short: 'Deck', icon: '⚓' },
  { id: 'engine', label: 'Engine Dept', short: 'Engine', icon: '⚙️' },
  { id: 'galley', label: 'Galley Dept', short: 'Galley', icon: '🍳' },
  { id: 'drills', label: 'Drills', short: 'Drills', icon: '🛟' },
  { id: 'others', label: 'Others', short: 'Others', icon: '📦' },
];
const WATCH_SLOTS = ['12-4 (00-04 & 12-16)','4-8 (04-08 & 16-20)','8-12 (08-12 & 20-00)','12-6 (00-06 & 12-18)','6-12 (06-12 & 18-00)','Daywork'];
const GMT_OFFSETS = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,4.5,5,5.5,5.75,6,6.5,7,8,8.75,9,9.5,10,10.5,11,12,12.75,13,14];
const PH_HOLIDAYS_2026 = [
  {date:'2026-01-01',name:"New Year's Day"},
  {date:'2026-04-02',name:"Maundy Thursday"},
  {date:'2026-04-03',name:"Good Friday"},
  {date:'2026-04-09',name:'Araw ng Kagitingan'},
  {date:'2026-05-01',name:'Labor Day'},
  {date:'2026-06-12',name:'Independence Day'},
  {date:'2026-08-31',name:'National Heroes Day'},
  {date:'2026-11-30',name:'Bonifacio Day'},
  {date:'2026-12-25',name:'Christmas Day'},
  {date:'2026-12-30',name:'Rizal Day'},
];
// Fixed holidays that recur every year on same MM-DD
const FIXED_HOLIDAYS_MMDD: Record<string,string> = {
  '01-01': "New Year's Day",
  '05-01': "Labor Day",
  '06-12': "Independence Day",
  '08-31': "National Heroes Day",
  '11-30': "Bonifacio Day",
  '12-25': "Christmas Day",
  '12-30': "Rizal Day",
};

function toISO(d: Date){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function getShipTimeNow(gmtOffset: number, enabled: boolean){ if(!enabled) return new Date(); const now=new Date(); const utc=now.getTime()+now.getTimezoneOffset()*60000; return new Date(utc+gmtOffset*3600000); }
function formatGMT(offset: number){ 
  const sign=offset>=0?'+':'-';
  const abs=Math.abs(offset);
  const h=Math.floor(abs);
  const m=Math.round((abs-h)*60);
  return m===0 ? `GMT${sign}${h}` : `GMT${sign}${h}:${String(m).padStart(2,'0')}`;
}
function format24H(date: Date){return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`;}
function format24H_HM(date: Date){return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;}
function parseISO(s: string){
  if(!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(NaN);
  const [y,m,dd]=s.split('-').map(Number);
  if(Number.isNaN(y)||Number.isNaN(m)||Number.isNaN(dd)) return new Date(NaN);
  if(m<1||m>12||dd<1||dd>31) return new Date(NaN);
  return new Date(y,m-1,dd);
}
function getMonday(d: Date){const date=new Date(d);const day=date.getDay();const diff=date.getDate()-day+(day===0?-6:1);date.setDate(diff);date.setHours(0,0,0,0);return date;}
function addDays(d: Date,n: number){const nd=new Date(d);nd.setDate(nd.getDate()+n);return nd;}
function sumBreakdown(b: Breakdown){return Object.values(b).reduce((a,v)=>a+(Number(v)||0),0);}
function emptyBreakdown(): Breakdown{return {deckWork:0,engineWork:0,watch:0,bridgeLookout:0,engineWatch:0,standby:0,mooring:0,bunkering:0,provisionDeck:0,provisionEngine:0,provisionGalley:0,garbage:0,cargo:0,drills:0,other:0,galleyWork:0,cooking:0,messService:0};}
function isValidISO(s:string){ const d=parseISO(s); return !isNaN(d.getTime()); }

function Time24Input({value, onChange, isDark}:{value:string, onChange:(v:string)=>void, isDark:boolean}){
  // Normalize value to HH:MM or empty
  const parts = (value||'').split(':');
  let hh = parts[0]||'';
  let mm = parts[1]||'';
  // Pad check: if user stored "8:5", show as "08" and "05" but keep logic
  const normalize = (v:string)=>{
    if(!v) return '';
    const n = parseInt(v,10);
    if(Number.isNaN(n)) return '';
    return String(n).padStart(2,'0');
  };
  const displayHH = normalize(hh) || hh;
  const displayMM = normalize(mm) || mm;

  const setH=(newH:string)=>{
    if(newH===""){ onChange(""); return; }
    const cleanH = normalize(newH);
    const cleanM = normalize(mm) || '00';
    onChange(`${cleanH}:${cleanM}`);
  };
  const setM=(newM:string)=>{
    if(newM===""){
      if(hh) onChange(`${normalize(hh)||hh}:00`);
      else onChange("");
      return;
    }
    const cleanH = normalize(hh) || '00';
    const cleanM = normalize(newM);
    onChange(`${cleanH}:${cleanM}`);
  };
  return (
    <div className="flex items-center gap-2">
      <select value={displayHH} onChange={e=>setH(e.target.value)} title="Hour (00-23)" aria-label="Hour" className={`flex-1 min-w-0 border rounded-full px-1 py-2.5 text-[12px] font-bold text-center outline-none focus:ring-2 focus:ring-orange-500/30 ${isDark?'bg-[#0f172a] border-white/20 text-white':'bg-white border-slate-200 text-slate-900'}`}>
        <option value="">--</option>
        {Array.from({length:24}).map((_,i)=><option key={i} value={String(i).padStart(2,'0')} className={isDark ? "text-white bg-[#0f172a]" : "text-black bg-white"}>{String(i).padStart(2,'0')}</option>)}
      </select>
      <span className={`font-bold shrink-0 ${isDark?'text-white':'text-slate-900'}`}>:</span>
      <select value={displayMM} onChange={e=>setM(e.target.value)} title="Minute (00-59)" aria-label="Minute" className={`flex-1 min-w-0 border rounded-full px-1 py-2.5 text-[12px] font-bold text-center outline-none focus:ring-2 focus:ring-orange-500/30 ${isDark?'bg-[#0f172a] border-white/20 text-white':'bg-white border-slate-200 text-slate-900'}`}>
        <option value="">--</option>
        {Array.from({length:60}).map((_,i)=><option key={i} value={String(i).padStart(2,'0')} className={isDark ? "text-white bg-[#0f172a]" : "text-black bg-white"}>{String(i).padStart(2,'0')}</option>)}
      </select>
    </div>
  );
}

type DayOTInfo={type:string;regularHours:number;otHours:number;doubleHours:number;payHours:number;multiplier:number;isHoliday:boolean;isWeekend:boolean;};
function computeWeekOT(entries: Record<string, Entry>, weekStart: Date, isHolidayFn: (iso: string)=>boolean){
  const perDay: Record<string, DayOTInfo>={}; 
  for(let i=0;i<7;i++){
    const d=addDays(weekStart,i);
    const iso=toISO(d);
    const e=entries[iso];
    const isHoliday=isHolidayFn(iso);
    const isWeekend=d.getDay()===0||d.getDay()===6;
    const work=e?.totalWork||0;
    let regularHours=0,otHours=0,doubleHours=0,payHours=0,type='Regular',multiplier=1;
    const isDouble=isHoliday && e?.location==='At Port';
    if(!e||work===0){
      type='No Work';
    }else if(isDouble){
      doubleHours=work*2; payHours=doubleHours; type='Double OT (Holiday+Port)'; multiplier=2;
    }else if(isHoliday){
      otHours=work; payHours=work; type='OT-Holiday'; multiplier=1;
    }else if(isWeekend){
      otHours=work; payHours=work; type='OT-Weekend (Sat/Sun Auto OT)'; multiplier=1;
    }else{
      const dailyReg=Math.min(work,8); const dailyOT=Math.max(0,work-8);
      regularHours=dailyReg; otHours=dailyOT; payHours=work;
      type=dailyOT>0?`Regular ${dailyReg}h + OT ${dailyOT}h`:'Regular - Working Time (8h/day Mon-Fri)';
    }
    perDay[iso]={type,regularHours,otHours,doubleHours,payHours,multiplier,isHoliday,isWeekend};
  }
  let totalOT=0,totalDouble=0,totalPay=0,weekdayOT=0,weekendOT=0,holidayOT=0,cumulativeRegular=0;
  Object.values(perDay).forEach(p=>{
    totalOT+=p.otHours; totalDouble+=p.doubleHours; totalPay+=p.payHours; cumulativeRegular+=p.regularHours;
    if(p.isWeekend) weekendOT+=p.otHours;
    else if(p.isHoliday) holidayOT+= p.doubleHours>0 ? p.doubleHours/2 : p.otHours;
    else weekdayOT+=p.otHours;
  });
  return {perDay,totals:{totalOT,totalDouble,totalPay,cumulativeRegular,weekdayOT,weekendOT,holidayOT}};
}
export default function App(){
  const [theme,setTheme]=useState<'dark'|'light'>(()=>{try{const s=localStorage.getItem('seatime-theme'); if(s==='dark'||s==='light') return s as any;}catch{} return 'dark';});
  const [timeSettings,setTimeSettings]=useState<TimeSettings>(()=>{try{const s=localStorage.getItem('seatime-time-settings'); if(s){const p=JSON.parse(s); return {gmtOffset: typeof p.gmtOffset==='number'?p.gmtOffset:8, shipTimeEnabled: !!p.shipTimeEnabled, label: p.label||'Ship Time'};}}catch{} return {gmtOffset:8, shipTimeEnabled:false, label:'Ship Time'};});
  const [viewDate,setViewDate]=useState(()=>getShipTimeNow(8, false));
  const [showTimeModal,setShowTimeModal]=useState(false);
  const [seafarerInfo,setSeafarerInfo]=useState<SeafarerInfo>(()=>{try{const s=localStorage.getItem('seatime-seafarer');if(s){const parsed=JSON.parse(s); return {name:parsed.name||'',employeeNo:parsed.employeeNo||'',department:parsed.department||'Deck'};}}catch{}return {name:'',employeeNo:'',department:'Deck'};});
  const [vesselInfo,setVesselInfo]=useState<VesselInfo>(()=>{try{const s=localStorage.getItem('seatime-vessel');if(s){const parsed=JSON.parse(s); return {name:parsed.name||'',type:parsed.type||'',imo:parsed.imo||'',flag:parsed.flag||'',masterName:parsed.masterName||''};}}catch{}return {name:'',type:'',imo:'',flag:'',masterName:''};});
  const [showVesselModal,setShowVesselModal]=useState(false);
  const [showShareModal,setShowShareModal]=useState(false);
  const [showSidebar,setShowSidebar] = useState(false);
  const [deferredPrompt,setDeferredPrompt]=useState<any>(null);
  const [isInstalled,setIsInstalled]=useState(false);
  const [isIOSDevice,setIsIOSDevice]=useState(false);
  const [summaryView,setSummaryView]=useState<'weekly'|'monthly'>('weekly');
  const [userRank,setUserRank]=useState<Rank | ''>(()=>{try{const s=localStorage.getItem('seatime-rank');if(s)return s as Rank;}catch{}return '';});
  const [entries,setEntries]=useState<Record<string, Entry>>(()=>{try{const s=localStorage.getItem('seatime-entries');if(s){const parsed=JSON.parse(s); if(parsed && typeof parsed==='object') return parsed;}}catch{}return {};});
  const [editing,setEditing]=useState<Entry|null>(null);
  const [activeTaskTab,setActiveTaskTab]=useState<'deck'|'engine'|'galley'|'drills'|'others'>('deck');
  // Auto-select tab based on user's department when opening editor
  useEffect(()=>{
    if(editing){
      if(seafarerInfo.department==='Engine') setActiveTaskTab('engine');
      else if(seafarerInfo.department==='Galley') setActiveTaskTab('galley');
      else setActiveTaskTab('deck');
    }
  },[editing, seafarerInfo.department]);
  const [now24H,setNow24H]=useState(()=>getShipTimeNow(timeSettings.gmtOffset, timeSettings.shipTimeEnabled));
  useEffect(()=>{const id=setInterval(()=>setNow24H(getShipTimeNow(timeSettings.gmtOffset, timeSettings.shipTimeEnabled)),1000);return ()=>clearInterval(id);},[timeSettings]);
  useEffect(()=>{try{localStorage.setItem('seatime-theme',theme);}catch{}},[theme]);
  useEffect(()=>{try{localStorage.setItem('seatime-time-settings',JSON.stringify(timeSettings));}catch{}},[timeSettings]);
  useEffect(()=>{try{localStorage.setItem('seatime-rank',userRank);}catch{}},[userRank]);
  useEffect(()=>{try{localStorage.setItem('seatime-vessel',JSON.stringify(vesselInfo));}catch{}},[vesselInfo]);
  useEffect(()=>{try{localStorage.setItem('seatime-seafarer',JSON.stringify(seafarerInfo));}catch{}},[seafarerInfo]);
  useEffect(()=>{try{localStorage.setItem('seatime-entries',JSON.stringify(entries));}catch{}},[entries]);

  // --- PWA Install Logic + SW Registration ---
  useEffect(()=>{
    // Register service worker for PWA installability on Vercel
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
    // Check if already installed
    const checkInstalled = () => {
      // @ts-ignore
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      if(isStandalone) setIsInstalled(true);
    };
    checkInstalled();
    // iOS detection
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOSDevice(iOS);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  },[]);

  // Holidays: exact dates for 2026 plus fixed MM-DD for any year
  const holidaysSet=useMemo(()=>new Set(PH_HOLIDAYS_2026.map(h=>h.date)),[]);
  const holidayMap=useMemo(()=>new Map(PH_HOLIDAYS_2026.map(h=>[h.date,h.name] as [string,string])),[]);
  const isHolidayDate = (iso: string) => {
    if (holidaysSet.has(iso)) return true;
    const mmdd = iso.slice(5);
    return mmdd in FIXED_HOLIDAYS_MMDD;
  };
  const getHolidayName = (iso: string) => {
    if(holidayMap.has(iso)) return holidayMap.get(iso);
    const mmdd = iso.slice(5);
    return FIXED_HOLIDAYS_MMDD[mmdd];
  };
  const weekStart=useMemo(()=>getMonday(viewDate),[viewDate]);
  const monthStart=useMemo(()=>new Date(viewDate.getFullYear(),viewDate.getMonth(),1),[viewDate]);
  const weekOT=useMemo(()=>computeWeekOT(entries,weekStart,isHolidayDate),[entries,weekStart,holidaysSet]);
  const calendarDays=useMemo(()=>{const days: Date[]=[];const start=getMonday(monthStart);for(let i=0;i<42;i++)days.push(addDays(start,i));return days;},[monthStart]);

  // Filter entries for current month - memoized
  const monthEntries = useMemo(()=>{
    return Object.values(entries).filter(e=>{
      const d=parseISO(e.date);
      if(isNaN(d.getTime())) return false;
      return d.getFullYear()===viewDate.getFullYear() && d.getMonth()===viewDate.getMonth();
    }).sort((a,b)=>a.date.localeCompare(b.date));
  },[entries, viewDate]);

  const weekBreakdownTotals=useMemo(()=>{
    const totals=emptyBreakdown(); let totalWork=0; let totalRest=0;
    for(let i=0;i<7;i++){
      const d=addDays(weekStart,i);
      const iso=toISO(d);
      const e=entries[iso];
      if(e){
        (Object.keys(totals) as (keyof Breakdown)[]).forEach(k=>{totals[k]+=e.breakdown[k]||0;});
        totalWork+=e.totalWork;
        totalRest+= Math.max(0, 24 - e.totalWork);
      }else{
        totalRest+=24; // count missing days as full rest
      }
    }
    return {totals,totalWork,totalRest};
  },[entries,weekStart]);

  const compliance=useMemo(()=>{
    let compliantDays=0,totalDaysWithEntry=0,totalWorkWeek=0, totalRestWeek=0;
    for(let i=0;i<7;i++){
      const d=addDays(weekStart,i);
      const iso=toISO(d);
      const e=entries[iso];
      if(e){
        if(!isValidISO(iso)) continue;
        totalDaysWithEntry++;
        const rest=Math.max(0,24-e.totalWork);
        totalWorkWeek+=e.totalWork;
        totalRestWeek+=rest;
        if(rest>=10) compliantDays++;
      }else{
        // No entry = full rest day, compliant
        totalRestWeek+=24;
      }
    }
    const weekRest = totalRestWeek;
    return {compliantDays,totalDaysWithEntry,weekRest,dayCompliancePct: totalDaysWithEntry?Math.round((compliantDays/totalDaysWithEntry)*100):100, totalWorkWeek};
  },[entries,weekStart]);

  const monthTotals=useMemo(()=>{
    const daysInMonth=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0).getDate();
    let totalWork=0,monthPay=0,monthOT=0,monthDouble=0,monthRegular=0,monthWeekendOT=0,monthWeekdayOT=0,monthHolidayOT=0,monthRest=0;
    for(let day=1; day<=daysInMonth; day++){
      const d=new Date(viewDate.getFullYear(),viewDate.getMonth(),day);
      const iso=toISO(d);
      const e=entries[iso];
      if(!e){
        monthRest+=24;
        continue;
      }
      if(!isValidISO(iso)) continue;
      const isHoliday=isHolidayDate(iso);
      const isWeekend=d.getDay()===0||d.getDay()===6;
      const work=e.totalWork||0;
      totalWork+=work;
      monthRest+=Math.max(0,24-work);
      const isDouble=isHoliday && e.location==='At Port';
      if(isDouble){
        monthDouble+=work*2;
        monthPay+=work*2;
        monthHolidayOT+=work;
      }else if(isHoliday){
        monthOT+=work;
        monthPay+=work;
        monthHolidayOT+=work;
      }else if(isWeekend){
        monthOT+=work;
        monthPay+=work;
        monthWeekendOT+=work;
      }else{
        const reg=Math.min(work,8);
        const ot=Math.max(0,work-8);
        monthRegular+=reg;
        monthOT+=ot;
        monthPay+=work;
        if(ot>0) monthWeekdayOT+=ot;
      }
    }
    return {totalWork,monthPay,monthOT,monthDouble,monthRegular,monthWeekendOT,monthWeekdayOT,monthHolidayOT,monthRest,daysInMonth};
  },[entries,viewDate,holidaysSet]);

  const openDay=(iso: string)=>{
    const existing=entries[iso];
    const holidayName = getHolidayName(iso);
    let newEntry: Entry;
    if(existing){
      newEntry={...existing};
      if(holidayName && !newEntry.notes){
        newEntry={...newEntry, notes: holidayName};
      }
    }else{
      newEntry={breakdown:emptyBreakdown(),totalWork:0,location:'At Sea',duty:'Regular Work',watchSlot:'12-4 (00-04 & 12-16)',notes: holidayName || '',portName:'',arrivalTime:'',departureTime:'',date:iso};
    }
    setEditing(newEntry);
  };
  const getAutoPortNote = (portName: string, arrivalTime: string, departureTime: string, location: string) => {
    const pn = (portName||'').trim();
    if(!pn) return null;
    if(location==='At Sea') return `Enroute to ${pn}`;
    const hasArr = !!arrivalTime, hasDep = !!departureTime;
    if(hasArr && hasDep) return `Arrival & Departure - ${pn}`;
    if(hasArr && !hasDep) return `Arrival - ${pn}`;
    if(!hasArr && hasDep) return `Departure - ${pn}`;
    return `Berthed - ${pn}`;
  };
  const handleSave=()=>{
    if(!editing) return;
    const isRestDay = editing.duty==='Rest Day';
    const total=isRestDay?0:sumBreakdown(editing.breakdown);
    if(total>24){ alert('Total work cannot exceed 24h per day. Current: '+total.toFixed(1)+'h'); return; }
    if(!isValidISO(editing.date)){ alert('Invalid date'); return; }
    const autoNote = getAutoPortNote(editing.portName, editing.arrivalTime, editing.departureTime, editing.location);
    const holidayName = getHolidayName(editing.date) || '';
    let finalNotes = editing.notes?.trim() || '';
    if(isRestDay){
      finalNotes = finalNotes || 'Rest Day - No Work (24h Rest)';
    }else if(autoNote){
      if(!finalNotes || finalNotes===holidayName){ finalNotes = autoNote; }
      else if(!finalNotes.includes(autoNote)){ finalNotes = `${autoNote} • ${finalNotes}`; }
    }
    const toSave: Entry={...editing, notes: finalNotes, totalWork: total, breakdown: isRestDay ? emptyBreakdown() : editing.breakdown};
    if(!isRestDay && total===0&&!finalNotes&&!editing.arrivalTime&&!editing.departureTime&&!editing.portName){
      const copy={...entries};delete copy[editing.date];setEntries(copy);
    }else{setEntries(prev=>({...prev,[editing.date]:toSave}));}
    setEditing(null);
  };
  const handleDelete=()=>{if(!editing)return;const copy={...entries};delete copy[editing.date];setEntries(copy);setEditing(null);};
  const updateBreakdown=(key: keyof Breakdown, delta: number)=>{
    if(!editing) return;
    const cur=editing.breakdown[key]||0;
    const nextRaw=Math.max(0,Math.min(24,parseFloat((cur+delta).toFixed(1))));
    const otherTotal = sumBreakdown(editing.breakdown) - cur;
    const next = Math.min(nextRaw, Math.max(0, 24 - otherTotal));
    setEditing({...editing,breakdown:{...editing.breakdown,[key]:next}});
  };
  const setBreakdownValue=(key: keyof Breakdown, val: number)=>{
    if(!editing) return;
    const otherTotal = sumBreakdown(editing.breakdown) - (editing.breakdown[key]||0);
    const maxAllowed = Math.max(0, 24 - otherTotal);
    const next=Math.max(0,Math.min(maxAllowed,isNaN(val)?0:val));
    setEditing({...editing,breakdown:{...editing.breakdown,[key]:next}});
  };
  const liveTotal=editing ? (editing.duty==='Rest Day' ? 0 : sumBreakdown(editing.breakdown)) : 0;
  const liveRest=editing?.duty==='Rest Day' ? 24 : Math.max(0,24-liveTotal);
  const liveOTPreview=useMemo(()=>{
    if(!editing) return null;
    const iso=editing.date; const isHoliday=isHolidayDate(iso); const d=parseISO(iso); const isWeekend=d.getDay()===0||d.getDay()===6;
    const isDouble=isHoliday&&editing.location==='At Port';
    if(isDouble) return {type:'Double OT (Holiday+Port+Watch 8h→16h)',multiplier:2,pay:liveTotal*2};
    if(isWeekend) return {type:'OT-Weekend (Auto OT - straight)',multiplier:1,pay:liveTotal};
    if(isHoliday) return {type:'OT-Holiday (straight)',multiplier:1,pay:liveTotal};
    if(liveTotal>8) return {type:`Regular 8h + OT ${liveTotal-8}h (Beyond 8h/day)`,multiplier:1,pay:liveTotal};
    return {type:'Regular - Working Time (8h/day Mon-Fri)',multiplier:1,pay:liveTotal};
  },[editing?.date, editing?.location, liveTotal]);

  const isDark = theme==='dark';
  const weekPayHours = weekOT.totals.cumulativeRegular + weekOT.totals.totalOT + weekOT.totals.totalDouble;
  const monthPayHours = monthTotals.monthRegular + monthTotals.monthOT + monthTotals.monthDouble;

  return (
    <div className={isDark?"min-h-screen bg-[#070e1f] text-slate-100":"min-h-screen bg-[#f8fafc] text-slate-900"} style={{fontFamily:"'Instrument Sans', system-ui, sans-serif"} as any}>
      <style>{fontLinks}</style>
      <header className={isDark?"sticky top-0 z-30 bg-[#0f172a] border-b border-white/10":"sticky top-0 z-30 bg-[#0f172a] border-b border-white/10 text-white"}>
        <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-2 md:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
          <button onClick={()=>setShowSidebar(true)} className="h-8 w-8 flex items-center justify-center text-[14px] bg-white/10 border border-white/20 rounded-full text-white cursor-pointer">☰</button>
        <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-[#0f172a] border border-white/10 rounded-[12px] flex items-center justify-center"><AnchorLogoIcon /></div>
        <div>
          <div className="text-[20px] font-bold leading-none tracking-wide text-white">SEATIME</div>
          <div className="text-[12px] opacity-50 uppercase text-white leading-none hidden md:block">Detailed Breakdown Tracker • TRUE 24H • DMW 40h/week</div>
        </div>
      </div>

      {/* Clock - flex item to avoid mobile overlap */}
      <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-2 md:px-[10px] h-[22px] md:h-[20px] text-white shrink-0 whitespace-nowrap">
        <span className="text-[13px] font-mono font-bold">{format24H(now24H)}</span><sup className="text-[10px] opacity-60 ml-0.5 -top-0.5">24H</sup>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={()=>setTheme(isDark?'light':'dark')} className="text-[11px] bg-white/10 border border-white/20 rounded-full px-3 py-1.5 cursor-pointer text-white font-bold">
          {isDark?'🌙 Dark':'☀️ Light'}
        </button>
      </div>
    </div>
    </header>
            {showSidebar && (
        <>
          <div onClick={()=>setShowSidebar(false)} className="fixed inset-0 bg-black/50 z-40"></div>
          <div className={`fixed left-0 top-0 bottom-0 w-[300px] z-50 p-3 flex flex-col gap-2 ${isDark ? 'bg-[#0f172a] border-r border-white/10 text-white' : 'bg-white border-r border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-bold">SEATIME</div>
              <button onClick={()=>setShowSidebar(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✕</button>
            </div>
            <button onClick={()=>{
              try{
                const data={entries,vesselInfo,seafarerInfo,userRank,exportDate:new Date().toISOString()};
                const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
                const url=URL.createObjectURL(blob);
                const a=document.createElement('a'); a.href=url; 
                const safeRank = (userRank || 'Rank').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
                const safeName = (seafarerInfo.name || 'Seafarer').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                a.download=`${safeRank}_${safeName}_${toISO(new Date())}.json`;
                a.click(); URL.revokeObjectURL(url);
              }catch(e){ alert('Export failed'); console.error(e); }
              setShowSidebar(false);
            }} className={`w-full text-left px-3 py-2.5 rounded-[12px] font-bold text-[12px] cursor-pointer block ${isDark?'bg-white/10':'bg-slate-100'}`}>📤 Export</button>
            <label className={`w-full text-left px-3 py-2.5 rounded-[12px] font-bold text-[12px] cursor-pointer block ${isDark?'bg-white/10':'bg-slate-100'}`}>📥 Import<input type="file" accept=".json" className="hidden" onChange={e=>{
              const file=e.target.files?.[0]; if(!file) return;
              const reader=new FileReader();
              reader.onload=ev=>{
                try{
                  const data=JSON.parse(ev.target?.result as string);
                  if(!data || typeof data!=='object') throw new Error('Invalid');
                  if(data.entries && typeof data.entries==='object') setEntries(data.entries);
                  if(data.vesselInfo && typeof data.vesselInfo==='object') setVesselInfo(data.vesselInfo);
                  if(data.seafarerInfo && typeof data.seafarerInfo==='object') setSeafarerInfo(data.seafarerInfo);
                  if(data.userRank) setUserRank(data.userRank);
                  alert('Imported!');
                }catch{alert('Invalid file');}
              };
              reader.readAsText(file);
              setShowSidebar(false);
            }} /></label>
            <button onClick={()=>{setShowShareModal(true); setShowSidebar(false);}} className={`w-full text-left px-3 py-2.5 rounded-[12px] font-bold text-[12px] cursor-pointer block ${isDark?'bg-white/10':'bg-slate-100'}`}>🔗 Share App</button>
            {/* Install App Button */}
            {!isInstalled ? (
              <button
                onClick={async()=>{
                  if(deferredPrompt){
                    try{
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if(outcome==='accepted'){
                        setIsInstalled(true);
                      }
                      setDeferredPrompt(null);
                    }catch(err){ console.error(err); }
                  }else if(isIOSDevice){
                    setShowSidebar(false);
                    setTimeout(()=>setShowShareModal(true), 300);
                    alert('To install on iPhone/iPad:\n1. Tap the Share button (square with arrow) in Safari\n2. Scroll down and tap \"Add to Home Screen\"\n3. Tap Add');
                  }else{
                    alert('To install:\n• Chrome/Edge: Click the install icon in address bar or Menu → Install app\n• If already installed, you are all set!');
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-[12px] font-bold text-[12px] cursor-pointer flex items-center justify-between ${deferredPrompt ? 'bg-[#f97316] text-white border border-[#f97316] shadow-md' : isDark?'bg-white/10':'bg-slate-100'}`}
              >
                <span>⬇️ Install App</span>
                {deferredPrompt && <span className="text-[10px] bg-white text-[#f97316] px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>}
              </button>
            ) : (
              <div className={`w-full text-left px-3 py-2.5 rounded-[12px] font-bold text-[12px] flex items-center gap-2 ${isDark?'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300':'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                <span>✅ App Installed</span>
              </div>
            )}
            <button onClick={()=>{setShowTimeModal(true); setShowSidebar(false);}} className={`w-full text-left px-3 py-2.5 rounded-[12px] font-bold text-[12px] cursor-pointer block ${isDark?'bg-white/10':'bg-slate-100'}`}>🕒 Ship Time / GMT</button>
            <button onClick={()=>{if(window.confirm('Clear ALL data? Export first!')){ setEntries({}); setVesselInfo({name:'',type:'',imo:'',flag:'',masterName:''}); setSeafarerInfo({name:'',employeeNo:'',department:'Deck'}); setUserRank('' as any); try{localStorage.removeItem('seatime-entries'); localStorage.removeItem('seatime-vessel'); localStorage.removeItem('seatime-seafarer'); localStorage.removeItem('seatime-rank');}catch{} alert('All data cleared!'); setShowSidebar(false); }}} className="w-full text-left px-3 py-2.5 rounded-[12px] font-bold text-[12px] cursor-pointer block bg-red-500/20 border border-red-500/30 text-red-400">🗑️ Clear All</button>
          </div>
        </>
      )}

      <div className={isDark?"bg-[#0b1222] border-b border-white/5":"bg-white border-b border-slate-200"}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
          <div><div className="text-[11px] uppercase opacity-50">Seafarer</div><button onClick={()=>setShowVesselModal(true)} className={`mt-1 w-full text-left border rounded-[10px] px-3 py-2 cursor-pointer text-[13px] font-bold hover:opacity-80 ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{seafarerInfo.name||'Set Name'} • {userRank||'Select Rank'} • {RANKS.find(r=>r.label===userRank)?.dept||'Department'}</button></div>
          <div><div className="text-[11px] uppercase opacity-50">Vessel Name</div><div className={`mt-1 w-full text-left border rounded-[10px] px-3 py-2 text-[13px] font-bold hover:opacity-80 ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.name || 'Vessel Name'}</div></div>
          <div><div className="text-[11px] uppercase opacity-50">IMO</div><div className={`mt-1 border rounded-[10px] px-3 py-2 text-[13px] font-mono ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.imo || 'IMO Number'}</div></div>
          <div><div className="text-[11px] uppercase opacity-50">Flag</div><div className={`mt-1 border rounded-[10px] px-3 py-2 text-[13px] ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.flag || 'Flag Registry'}</div></div>
          <div><div className="text-[11px] uppercase opacity-50">Master</div><div className={`mt-1 border rounded-[10px] px-3 py-2 text-[13px] font-bold truncate ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.masterName || 'Master Name'}</div></div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase opacity-60">Summary</div>
              <div className="flex gap-1">
                <button onClick={()=>setSummaryView('weekly')} className={`text-[10px] px-2 py-1 rounded-full font-bold ${summaryView==='weekly'?'bg-[#f97316] text-white':'bg-black/10'}`}>Weekly</button>
                <button onClick={()=>setSummaryView('monthly')} className={`text-[10px] px-2 py-1 rounded-full font-bold ${summaryView==='monthly'?'bg-[#f97316] text-white':'bg-black/10'}`}>Monthly</button>
              </div>
            </div>
            {summaryView==='weekly'?(
              <>
                <div className="mt-3 space-y-2">
                  <div className={`flex justify-between items-center border rounded-[12px] px-3 py-3 ${isDark?'bg-white/[0.03] border-white/5':'bg-slate-50 border-slate-200'}`}>
                    <div><div className="text-[10px] opacity-60">Working Hours (Reg)</div><div className="text-[11px] opacity-40">Mon-Fri ≤40h/week</div></div>
                    <div className="text-[18px] font-bold text-emerald-400">{weekOT.totals.cumulativeRegular.toFixed(1)}</div>
                  </div>
                  <div className={`flex justify-between items-center border rounded-[12px] px-3 py-3 ${isDark?'bg-white/[0.03] border-white/5':'bg-slate-50 border-slate-200'}`}>
                    <div><div className="text-[10px] opacity-60">OT Hours</div><div className="text-[11px] opacity-40">Wkday {weekOT.totals.weekdayOT.toFixed(1)}h + Wkend {weekOT.totals.weekendOT.toFixed(1)}h</div></div>
                    <div className="text-[18px] font-bold text-blue-400">{weekOT.totals.totalOT.toFixed(1)}</div>
                  </div>
                  <div className={isDark?"flex justify-between items-center bg-red-950/30 border border-red-500/20 rounded-[14px] px-3 py-3":"flex justify-between items-center bg-red-50 border border-red-200 rounded-[14px] px-3 py-3"}>
                    <div><div className={isDark?"text-[10px] text-red-300":"text-[10px] text-red-700 font-bold"}>Double OT  (Holiday at Port)</div><div className="text-[11px] opacity-60">Total Work Hours x 2 = OT Hours</div></div>
                    <div className="text-[18px] font-bold text-red-400">{weekOT.totals.totalDouble.toFixed(1)}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className={`border rounded-[12px] p-3 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                    <div className="text-[9px] uppercase opacity-50">Total Work</div>
                    <div className="text-[18px] font-bold mt-1">{weekBreakdownTotals.totalWork.toFixed(1)}h</div>
                  </div>
                  <div className="bg-[#f97316] rounded-[12px] p-3 text-white">
                    <div className="text-[9px] uppercase opacity-80">Pay Hours</div>
                    <div className="text-[18px] font-bold mt-1">{weekPayHours.toFixed(1)}h</div>
                  </div>
                </div>
                <div className={`mt-3 border rounded-[12px] p-3 ${isDark?'bg-emerald-950/20 border-emerald-500/20':'bg-emerald-50 border-emerald-200'}`}>
                  <div className="text-[9px] uppercase text-emerald-600">Rest Hours</div>
                  <div className="text-[14px] font-bold text-emerald-500">{weekBreakdownTotals.totalRest.toFixed(1)}h <span className="text-[10px] opacity-60">/ 168h week</span></div>
                  <div className="text-[9px] opacity-50 mt-1">{compliance.compliantDays}/{compliance.totalDaysWithEntry} days ≥10h rest • {compliance.weekRest.toFixed(1)}h week rest</div>
                </div>
              </>
            ):(
              <>
                <div className="space-y-2">
                  <div className={`flex justify-between items-center border rounded-[12px] px-3 py-3 ${isDark?'bg-white/[0.03] border-white/5':'bg-slate-50 border-slate-200'}`}>
                    <div><div className="text-[10px] opacity-60">Working Hours (Reg)</div><div className="text-[11px] opacity-40">Mon-Fri ≤40h/week</div></div>
                    <div className="text-[18px] font-bold text-emerald-400">{monthTotals.monthRegular.toFixed(1)}</div>
                  </div>
                  <div className={`flex justify-between items-center border rounded-[12px] px-3 py-3 ${isDark?'bg-white/[0.03] border-white/5':'bg-slate-50 border-slate-200'}`}>
                    <div><div className="text-[10px] opacity-60">OT Hours</div><div className="text-[11px] opacity-40">Wkday {monthTotals.monthWeekdayOT.toFixed(1)}h + Wkend {monthTotals.monthWeekendOT.toFixed(1)}h</div></div>
                    <div className="text-[18px] font-bold text-blue-400">{monthTotals.monthOT.toFixed(1)}</div>
                  </div>
                  <div className={isDark?"flex justify-between items-center bg-red-950/30 border border-red-500/20 rounded-[14px] px-3 py-3":"flex justify-between items-center bg-red-50 border border-red-200 rounded-[14px] px-3 py-3"}>
                    <div><div className={isDark?"text-[10px] text-red-300":"text-[10px] text-red-700 font-bold"}>Double OT  (Holiday at Port)</div><div className="text-[11px] opacity-60">Total Work Hours x 2 = OT Hours</div></div>
                    <div className="text-[18px] font-bold text-red-400">{monthTotals.monthDouble.toFixed(1)}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className={`border rounded-[12px] p-3 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                    <div className="text-[9px] uppercase opacity-50">Total Work</div>
                    <div className="text-[18px] font-bold mt-1">{monthTotals.totalWork.toFixed(1)}h</div>
                  </div>
                  <div className="bg-[#f97316] rounded-[12px] p-3 text-white">
                    <div className="text-[9px] uppercase opacity-80">Pay Hours</div>
                    <div className="text-[18px] font-bold mt-1">{monthPayHours.toFixed(1)}h</div>
                  </div>
                </div>
                <div className={`mt-3 border rounded-[12px] p-3 ${isDark?'bg-emerald-950/20 border-emerald-500/20':'bg-emerald-50 border-emerald-200'}`}>
                  <div className="text-[9px] uppercase text-emerald-600">Rest Hours</div>
                  <div className="text-[14px] font-bold text-emerald-500">{monthTotals.monthRest.toFixed(1)}h <span className="text-[10px] opacity-60">/ {monthTotals.daysInMonth*24}h month</span></div>
                </div>
              </>
            )}
          </div>

          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="text-[10px] uppercase opacity-60 mb-2">MLC Compliance</div>
            <div className="text-[24px] font-bold">{compliance.dayCompliancePct}%</div>
            <div className="text-[10px] opacity-50 mt-1">{compliance.compliantDays}/{compliance.totalDaysWithEntry} days ≥10h • {compliance.weekRest.toFixed(1)}h week (need 77h)</div>
            <div className="mt-2 w-full bg-black/10 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{width:`${compliance.dayCompliancePct}%`}} /></div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-bold">{viewDate.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</h2>
                <button onClick={()=>setViewDate(getShipTimeNow(timeSettings.gmtOffset, timeSettings.shipTimeEnabled))} className={`text-[11px] px-3 py-1 rounded-full border font-bold ${isDark?'bg-white/10 border-white/20 text-white':'bg-slate-100 border-slate-200 text-slate-700'}`}>Today</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setViewDate(new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1))} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${isDark?'bg-white/10 hover:bg-white/20 hover:text-white hover:scale-110 active:scale-95':'bg-slate-100 hover:bg-slate-200 hover:scale-110 active:scale-95'}`}>‹</button>
                <button onClick={()=>setViewDate(new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1))} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${isDark?'bg-white/10 hover:bg-white/20 hover:text-white hover:scale-110 active:scale-95':'bg-slate-100 hover:bg-slate-200 hover:scale-110 active:scale-95'}`}>›</button>
              </div>
            </div>

            <div className={`grid grid-cols-7 gap-px rounded-t-[12px] overflow-hidden ${isDark?'bg-white/10':'bg-slate-200'}`}>
              {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d=><div key={d} className={`text-[10px] text-center py-2 font-semibold opacity-60 ${isDark?'bg-[#0f172a]':'bg-slate-50'}`}>{d}</div>)}
            </div>
            <div className={`grid grid-cols-7 gap-px rounded-b-[12px] overflow-hidden border-t-0 ${isDark?'bg-white/10':'bg-slate-200'}`}>
              {calendarDays.map((d,i)=>{
                const iso=toISO(d);
                const e=entries[iso];
                const isCurrentMonth=d.getMonth()===viewDate.getMonth();
                const shipToday = getShipTimeNow(timeSettings.gmtOffset, timeSettings.shipTimeEnabled);
                const isToday=toISO(shipToday)===iso;
                const isWeekend=d.getDay()===0||d.getDay()===6;
                const holidayName = getHolidayName(iso) as string | undefined;
                const isHoliday = !!holidayName;
                const eDay = entries[iso];
                const info=weekOT.perDay[iso];
                const isRestDay = eDay?.duty==='Rest Day';
                return (
                  <div key={i} onClick={()=>openDay(iso)} className={`min-h-[92px] p-2 cursor-pointer transition relative ${!isCurrentMonth? (isDark?'bg-[#0a1120] opacity-30':'bg-slate-50 opacity-40') : isHoliday ? (isDark?'bg-red-950/30 hover:bg-red-900/40':'bg-red-50 hover:bg-red-100') : isDark?'bg-[#0f172a] hover:bg-white/[0.04]':'bg-white hover:bg-slate-50'} ${isToday?'ring-1 ring-orange-500 ring-inset':''} ${e? (isDark?'bg-[#121c33]':'bg-blue-50'):''} ${isHoliday?'border border-red-500/30':''}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[14px] font-bold ${isHoliday?'text-red-500': isWeekend?'text-orange-400':''} ${isToday?'bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold': isHoliday && !isToday ? 'bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center' : ''}`}>{d.getDate()}</span>
                      {e&& (isRestDay ? <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500 text-white">REST 24h</span> : <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${info?.otHours>0?'bg-orange-500 text-white':'bg-black/10'}`}>{e.totalWork.toFixed(1)}h</span>)}
                    </div>
                    {isHoliday&&(
                      <div className="mt-1">
                        <div className="text-[7px] bg-red-500 text-white rounded-full px-1.5 py-0.5 truncate font-bold" title={holidayName}>{holidayName}</div>
                        <div className="text-[6px] text-red-400 mt-0.5 font-bold">HOLIDAY • Auto OT</div>
                      </div>
                    )}
                    {e&&(
                      <div className="mt-1 space-y-1">
                        <div className="flex gap-1 flex-wrap">
                          <span className={`text-[11px] rounded-full px-1.5 py-0.5 ${isDark?'bg-white/10':'bg-slate-200'}`}>{e.location==='At Sea'?'SEA':'PORT'}</span>
                          {e.duty==='Watch Duty'&&<span className="text-[10px] bg-blue-500/30 text-blue-400 rounded-full px-1.5 py-0.5">WATCH</span>}
                          {info?.otHours>0&&<span className="text-[7px] bg-orange-500/30 text-orange-400 rounded-full px-1.5 py-0.5">OT {info.otHours.toFixed(1)}h</span>}
                          {info?.doubleHours>0&&<span className="text-[7px] bg-red-500/30 text-red-400 rounded-full px-1.5 py-0.5">DBL</span>}
                        </div>
                      </div>
                    )}
                    {!e && !isHoliday && isCurrentMonth && (
                      <div className="mt-2 text-[12px] opacity-30 text-center">Click to log</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="flex items-center justify-start gap-3 mb-3">
              <div className="text-[12px] font-bold uppercase">Detailed Breakdown</div>
              <div className="text-[12px] opacity-50 ml-4 md:ml-[180px]">{monthEntries.length}  entries • True 24h • Overnight support</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[11px] uppercase opacity-60 border-b border-white/10">
                    <th className="text-center py-2 px-1.5 w-[88px]">DATE</th>
                    <th className="text-center py-2 px-1.5 w-[90px]">LOCATION</th>
                    <th className="text-center py-2 px-3 w-[100px] whitespace-nowrap">REGULAR WORK HOURS</th>
                    <th className="text-center py-2 px-2 w-[64px] whitespace-nowrap">OVERTIME HOURS</th>
                    <th className="text-center py-2 px-2 w-[64px] whitespace-nowrap">REST HOURS</th>
                    <th className="text-left py-2 pl-8 pr-3 min-w-[150px]">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {monthEntries.map((e)=>{
                    const holidayName = getHolidayName(e.date);
                    const isHoliday = !!holidayName && isHolidayDate(e.date);
                    const work = e.totalWork;
                    const dayObj = parseISO(e.date);
                    const isWeekend = dayObj.getDay()===0 || dayObj.getDay()===6;
                    const isRestDayEntry = e.duty==='Rest Day';
                    let reg=0, ot=0;
                    const isDouble = isHoliday && e.location==='At Port';
                    if(isRestDayEntry){
                      reg=0; ot=0;
                    } else if(isDouble){
                      reg=0; ot=work*2;
                    } else if(isHoliday || isWeekend){
                      reg=0; ot=work;
                    } else {
                      reg=Math.min(work,8); ot=Math.max(0,work-8);
                    }
                    const rest = isRestDayEntry ? 24 : Math.max(0,24-work);
                    return (
                      <tr key={e.date} className={`border-b hover:bg-white/[0.04] ${isDark?'border-white/5':'border-slate-100'} ${isHoliday?'bg-red-500/5':''}`}>
                        <td className={`py-2.5 px-1.5 w-[88px] font-mono font-bold text-center text-[12px] ${isHoliday?'text-red-500':''}`}>
                          <div>{e.date}</div>
                          <div className="text-[10px] opacity-50">{parseISO(e.date).toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}</div>
                          </td>
                        <td className="py-2.5 px-1.5 w-[68px] text-[13px] text-center">
                          {String(e.location).trim()==='At Port' ? '📍 At Port' : String(e.location).trim()==='At Sea' ? '🌊 At Sea' : e.location}
                          </td>
                        <td className="py-2.5 px-3 w-[100px] text-center"><span className={`font-bold ${isDark?'text-white':'text-slate-900'}`} title={`Total Work: ${work.toFixed(1)}h`}>{reg.toFixed(1)}</span></td>
                        <td className="py-2.5 px-2 w-[54px] text-center"><span className="font-bold text-orange-400">{ot.toFixed(1)}</span></td>
                        <td className="py-2.5 px-2 w-[56px] text-center"><span className="font-bold text-emerald-400">{rest.toFixed(1)}</span></td>
                        <td className="py-2.5 px-3 min-w-[240px] max-w-[360px] text-[13px] leading-snug text-left break-words">
                          {e.duty==='Rest Day'?'🌙 ':e.notes?.includes('Arrival')?'🚢 ':e.notes?.includes('Berthed')?'📍 ':e.notes?.includes('Departure')?'🛳️ ':e.notes?.includes('Enroute')?' ➡️ ':''}{e.notes}
                          {isHoliday && e.notes && <div className="text-[8px] text-red-400 mt-1">{holidayName}</div>}
                        </td>
                      </tr>
                    );
                  })}
                  {monthEntries.length===0&&<tr><td colSpan={6} className="py-8 text-center opacity-40">No entries yet.</td></tr>}
                </tbody>
                <tfoot>
                  <tr className={`border-t-2 font-medium text-[12px] ${isDark ? 'bg-orange-500/15 border-orange-500/30 text-white' : 'bg-orange-100 border-orange-300 text-slate-900'}`}>
                    <td className="py-3.5 px-1.5 text-center">TOTAL</td>
                    <td className="py-3.5 px-1.5"></td>
                    <td className="py-3.5 px-3 w-[100px] text-center"><span className={isDark?'text-white':'text-slate-900'}>{monthTotals.monthRegular.toFixed(1)}</span></td>
                    <td className="py-3.5 px-2 w-[64px] text-center"><span className="text-orange-400">{(monthTotals.monthOT + monthTotals.monthDouble).toFixed(1)}</span></td>
                    <td className="py-3.5 px-2 w-[64px] text-center"><span className="text-emerald-400">{monthTotals.monthRest.toFixed(1)}</span></td>
                    <td className="py-3.5 pl-3 pr-3 text-[12px] font-bold">🕒 {monthTotals.totalWork.toFixed(1)}hrs Work Total</td>
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>

        </div>
      </main>

      {showVesselModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>setShowVesselModal(false)} />
          <div className={`relative w-full md:max-w-[560px] rounded-t-[24px] md:rounded-[24px] shadow-2xl max-h-[90vh] overflow-auto border ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
            <div className={`sticky top-0 border-b px-6 py-5 flex items-center justify-between ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
              <div><div className="text-[18px] font-bold">🚢 Vessel Information</div><div className="text-[11px] opacity-50">Shown in header & reports • True 24H</div></div>
              <button onClick={()=>setShowVesselModal(false)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark?'bg-white/10':'bg-slate-100'}`}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`border rounded-[12px] p-4 ${isDark?'bg-orange-950/20 border-orange-500/20':'bg-orange-50 border-orange-200'}`}>
                <label className="text-[11px] uppercase font-semibold text-orange-600">👤 Seafarer Information</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div><label className="text-[10px] opacity-60">Full Name</label><input value={seafarerInfo.name} onChange={e=>setSeafarerInfo({...seafarerInfo,name:e.target.value})} placeholder="e.g., Juan Dela Cruz" className={`mt-1 w-full px-4 py-2.5 rounded-[12px] border text-[13px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
                  <div><label className="text-[10px] opacity-60">Employee No.</label><input value={seafarerInfo.employeeNo} onChange={e=>setSeafarerInfo({...seafarerInfo,employeeNo:e.target.value})} placeholder="123456" className={`mt-1 w-full px-4 py-2.5 rounded-[12px] border text-[13px] font-mono ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div><label className="text-[10px] opacity-60">Department</label><select value={seafarerInfo.department} onChange={e=>setSeafarerInfo({...seafarerInfo,department:e.target.value as Department})} className={`mt-1 w-full px-4 py-2.5 rounded-[12px] border text-[13px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}><option value="Deck">⚓ Deck Department</option><option value="Engine">⚙️ Engine Department</option><option value="Galley">🍳 Galley / Catering</option></select></div>
                  <div><label className="text-[10px] opacity-60">Rank (Master to Messman)</label><select value={userRank} onChange={e=>{const newRank=e.target.value as Rank; setUserRank(newRank); const rankDept=RANKS.find(r=>r.label===newRank)?.dept; if(rankDept){const mapped: Department = rankDept as Department; setSeafarerInfo(prev=>({...prev,department:mapped}));}}} className={`mt-1 w-full px-4 py-2.5 rounded-[12px] border text-[13px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}><optgroup label="Deck Department">{RANKS.filter(r=>r.dept==='Deck').map(r=><option key={r.label} value={r.label}>{r.icon} {r.label}</option>)}</optgroup><optgroup label="Engine Department">{RANKS.filter(r=>r.dept==='Engine').map(r=><option key={r.label} value={r.label}>{r.icon} {r.label}</option>)}</optgroup><optgroup label="Catering / Galley">{RANKS.filter(r=>r.dept==='Galley').map(r=><option key={r.label} value={r.label}>{r.icon} {r.label}</option>)}</optgroup></select></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] uppercase font-semibold opacity-70">Vessel Name</label><input value={vesselInfo.name} onChange={e=>setVesselInfo({...vesselInfo,name:e.target.value})} placeholder="MV SEATIME" className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[14px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
                <div><label className="text-[11px] uppercase font-semibold opacity-70">👨‍✈️ Master&apos;s Name</label><input value={vesselInfo.masterName} onChange={e=>setVesselInfo({...vesselInfo,masterName:e.target.value})} placeholder="Capt. John Smith" className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] uppercase font-semibold opacity-70">Vessel Type</label><select value={vesselInfo.type} onChange={e=>setVesselInfo({...vesselInfo,type:e.target.value})} className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}>{VESSEL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="text-[11px] uppercase font-semibold opacity-70">Flag Registry</label><select value={vesselInfo.flag} onChange={e=>setVesselInfo({...vesselInfo,flag:e.target.value})} className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}>{FLAG_REGISTRIES.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
              </div>
              <div><label className="text-[11px] uppercase font-semibold opacity-70">IMO Number</label><input value={vesselInfo.imo} onChange={e=>setVesselInfo({...vesselInfo,imo:e.target.value})} placeholder="IMO 999999" className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] font-mono ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
            </div>
            <div className={`sticky bottom-0 border-t px-6 py-4 flex justify-end gap-2 ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
              <button onClick={()=>setShowVesselModal(false)} className="px-5 py-2.5 rounded-full border text-[12px] font-semibold">Cancel</button>
              <button onClick={()=>setShowVesselModal(false)} className="px-6 py-2.5 rounded-full bg-[#f97316] text-white text-[12px] font-bold">Save</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={()=>{setEditing(null);}} />
          <div className={`relative w-full md:max-w-[760px] max-h-[92vh] md:max-h-[86vh] rounded-t-[22px] md:rounded-[22px] shadow-2xl border flex flex-col overflow-hidden ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
            <div className={`text-white px-7 py-5 flex items-start justify-between border-b bg-[#0f172a] border-white/10`}>
              <div>
                <div className="text-[11px] uppercase opacity-60">Log Day {isHolidayDate(editing.date)&&<span className="bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">Holiday</span>}</div>
                <div className="text-[18px] font-bold mt-1">{parseISO(editing.date).toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <select value={editing.location} onChange={e=>{const newLoc=e.target.value as any; const auto=getAutoPortNote(editing.portName, editing.arrivalTime, editing.departureTime, newLoc); setEditing({...editing, location:newLoc, notes: auto ? auto : editing.notes});}} className="bg-white/10 border border-white/20 rounded-full px-3 py-2 text-[12px] text-white w-full truncate"><option className="text-black" value="At Sea">At Sea</option><option className="text-black" value="At Port">At Port</option></select>
                  <select value={editing.duty} onChange={e=>{const nd=e.target.value as any; if(nd==='Rest Day'){setEditing({...editing,duty:nd,breakdown:emptyBreakdown(),notes:editing.notes||'Rest Day - No Work (24h Rest)'});}else{setEditing({...editing,duty:nd});}}} className="bg-white/10 border border-white/20 rounded-full px-3 py-2 text-[12px] text-white w-full truncate"><option className="text-black" value="Regular Work">Regular Work</option><option className="text-black" value="Watch Duty">Watch Duty</option><option className="text-black" value="Standby / Extra">Standby / Extra</option><option className="text-black" value="Rest Day">🌙 No Work - Rest Day</option></select>
                  <select value={editing.watchSlot} onChange={e=>setEditing({...editing,watchSlot:e.target.value})} className="bg-[#f97316] text-white rounded-full px-3 py-2 text-[12px] font-semibold w-full col-span-2 truncate">{WATCH_SLOTS.map(s=><option key={s} value={s} className="text-black">{s}</option>)}</select>
                </div>
              </div>
              <button onClick={()=>{setEditing(null);}} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">✕</button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="px-7 py-5">
                {editing.duty==='Rest Day' ? (
                  <div className={`border rounded-[16px] p-8 text-center ${isDark?'bg-emerald-950/20 border-emerald-500/20':'bg-emerald-50 border-emerald-200'}`}>
                    <div className="text-[32px]">🌙</div><div className="text-[16px] font-bold mt-2">Rest Day - No Work</div><div className="text-[12px] opacity-60 mt-1">24h Rest will be recorded</div>
                  </div>
                ) : (
                <>
                {/* 5 Tabs for Mobile - horizontally scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hide" style={{scrollbarWidth:'none'}}>
                  {TASK_TABS.map(tab=>{
                    const count = BREAKDOWN_FIELDS.filter(f=>f.tab===tab.id).reduce((acc,f)=>acc+(editing.breakdown[f.key]||0),0);
                    const isActive = activeTaskTab===tab.id;
                    return (
                      <button key={tab.id} onClick={()=>setActiveTaskTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 snap-start transition ${isActive?'bg-[#f97316] text-white shadow-md':'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200'}`}>
                        <span>{tab.icon}</span> {tab.label} {count>0 && <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${isActive?'bg-white text-[#f97316]':'bg-[#f97316] text-white'}`}>{count.toFixed(1)}h</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BREAKDOWN_FIELDS.filter(f=>f.tab===activeTaskTab).map(f=>{
                    const val=editing.breakdown[f.key]||0;
                    return (
                      <div key={f.key} className={`border rounded-[16px] p-3 flex flex-col justify-between ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold flex items-center gap-1.5 truncate">{f.key==='bridgeLookout' || f.key==='watch'?<ModernBinocularIcon />:<span>{f.icon}</span>}<span className="truncate">{f.label}</span></span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${val>0?'bg-[#f97316] text-white':'bg-black/10 opacity-60'}`}>{val.toFixed(1)}h</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 bg-black/5 dark:bg-white/5 rounded-full px-2 py-1.5">
                          <button onClick={()=>updateBreakdown(f.key,-0.5)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0 transition active:scale-95 ${isDark?'bg-white/10 hover:bg-white/20 text-white':'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm'}`}>−</button>
                          <input type="number" step="0.5" min={0} max={24} value={val} onChange={e=>setBreakdownValue(f.key,parseFloat(e.target.value))} className={`flex-1 bg-transparent text-center font-bold text-[18px] outline-none min-w-0 ${isDark?'text-white':'text-slate-900'}`} />
                          <button onClick={()=>updateBreakdown(f.key,0.5)} className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center text-[16px] font-bold shrink-0 shadow-md hover:bg-[#ea6d12] transition active:scale-95">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-[11px] text-center opacity-60">Showing {BREAKDOWN_FIELDS.filter(f=>f.tab===activeTaskTab).length} tasks in {TASK_TABS.find(t=>t.id===activeTaskTab)?.label} • Total {Object.values(editing.breakdown).reduce((a,v)=>a+(Number(v)||0),0).toFixed(1)}h</div>
                </>
                )}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`border rounded-[14px] p-4 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                    <div className="text-[11px] uppercase opacity-90">Port & Times (True 24H)</div>
                    <div className="mt-3"><label className="text-[10px] opacity-80">Port Name</label><input value={editing.portName} onChange={e=>{const pn=e.target.value; const auto=getAutoPortNote(pn, editing.arrivalTime, editing.departureTime, editing.location); setEditing({...editing, portName:pn, notes: auto ? (editing.notes? `${auto} • ${editing.notes}`.slice(0,200) : auto) : editing.notes});}} placeholder="Manila, PH" className={`mt-1 w-full border rounded-full px-4 py-2 text-[13px] ${isDark?'bg-white/5 border-white/10 text-white':'bg-white border-slate-200'}`} /></div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={`border rounded-[10px] p-3 ${isDark?'bg-white/[0.03] border-white/10':'bg-white border-slate-200'}`}><label className="text-[10px] uppercase font-semibold opacity-90 flex items-center gap-1 whitespace-nowrap">🚢 Arrival Time <span className="bg-blue-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-[8px]">24H</span></label><div className="mt-2"><Time24Input value={editing.arrivalTime} onChange={v=>{const auto=getAutoPortNote(editing.portName, v, editing.departureTime, editing.location); setEditing({...editing, arrivalTime:v, notes: auto ? auto : editing.notes});}} isDark={isDark} /></div><div className="mt-2 flex gap-1"><button onClick={()=>{const nv=format24H_HM(now24H); const auto=getAutoPortNote(editing.portName, nv, editing.departureTime, editing.location); setEditing({...editing,arrivalTime:nv, notes: auto ? auto : editing.notes});}} className={`text-[10px] px-2 py-1 rounded-full ${isDark?'bg-white text-black':'bg-slate-900 text-white'}`}>Now {format24H_HM(now24H)}H</button><button onClick={()=>{setEditing({...editing,arrivalTime:''});}} className={`text-[10px] border px-2 py-1 rounded-full ${isDark?'bg-white/10 border-white/20':'bg-slate-100 border-slate-200'}`}>Clear</button></div></div>
                      <div className={`border rounded-[10px] p-3 ${isDark?'bg-white/[0.03] border-white/10':'bg-white border-slate-200'}`}><label className="text-[10px] uppercase font-semibold opacity-90 flex items-center gap-1 whitespace-nowrap">🛳️ Departure Time <span className="bg-blue-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-[8px]">24H</span></label><div className="mt-2"><Time24Input value={editing.departureTime} onChange={v=>{const auto=getAutoPortNote(editing.portName, editing.arrivalTime, v, editing.location); setEditing({...editing, departureTime:v, notes: auto ? auto : editing.notes});}} isDark={isDark} /></div><div className="mt-2 flex gap-1"><button onClick={()=>{const nv=format24H_HM(now24H); const auto=getAutoPortNote(editing.portName, editing.arrivalTime, nv, editing.location); setEditing({...editing,departureTime:nv, notes: auto ? auto : editing.notes});}} className={`text-[10px] px-2 py-1 rounded-full ${isDark?'bg-white text-black':'bg-slate-900 text-white'}`}>Now {format24H_HM(now24H)}H</button><button onClick={()=>{setEditing({...editing,departureTime:'',});}} className={`text-[10px] border px-2 py-1 rounded-full ${isDark?'bg-white/10 border-white/20':'bg-slate-100 border-slate-200'}`}>Clear</button></div></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`border rounded-[14px] p-4 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[11px] uppercase opacity-90">Day Summary (True 24H)</div>
                      <div className="mt-2 flex items-baseline gap-2"><span className="text-[28px] font-bold">{liveTotal.toFixed(1)}h</span><span className="text-[12px] opacity-60">work / {liveRest.toFixed(1)}h rest</span></div>
                      {liveOTPreview&&<div className={`mt-2 text-[11px] px-3 py-2 rounded-full border ${liveOTPreview.multiplier===2?'bg-red-500/20 text-red-400 border-red-500/30':liveOTPreview.multiplier>1?'bg-orange-500/20 text-orange-400 border-orange-500/30':'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>{liveOTPreview.type} → {liveOTPreview.pay.toFixed(1)}h pay</div>}
                    </div>
                    <div className={`border rounded-[14px] p-4 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                      <label className="text-[10px] uppercase opacity-90">Notes</label><textarea value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})} placeholder="Cargo operation, mooring, etc." className={`mt-2 w-full border rounded-[12px] px-3 py-2 text-[12px] min-h-[60px] ${isDark?'bg-white/5 border-white/10 text-white':'bg-white border-slate-200'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`border-t px-7 py-4 flex items-center justify-between ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
              <button onClick={handleDelete} className="text-[11px] text-red-400 border border-red-500/30 rounded-full px-4 py-2">Delete Entry</button>
              <div className="flex gap-2">
                <button onClick={()=>{setEditing(null);}} className={`px-5 py-2.5 rounded-full border text-[12px] ${isDark?'border-white/20':'border-slate-200'}`}>Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-full bg-[#f97316] text-white text-[12px] font-bold">Save {liveTotal.toFixed(1)}h • {liveRest.toFixed(1)}h rest</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTimeModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>setShowTimeModal(false)} />
          <div className={`relative w-full md:max-w-[420px] rounded-t-[24px] md:rounded-[24px] shadow-2xl max-h-[90vh] overflow-auto border ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
            <div className={`sticky top-0 border-b px-6 py-5 flex items-center justify-between ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
              <div><div className="text-[18px] font-bold">🕒 Ship Time Settings</div><div className="text-[11px] opacity-50">GMT Offset • True 24H • DMW Rules</div></div>
              <button onClick={()=>setShowTimeModal(false)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark?'bg-white/10':'bg-slate-100'}`}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] uppercase font-semibold opacity-70">GMT Offset</label>
                <select value={timeSettings.gmtOffset} onChange={e=>setTimeSettings({...timeSettings,gmtOffset:parseFloat(e.target.value)})} className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}>
                  {GMT_OFFSETS.map(o=><option key={o} value={o}>{formatGMT(o)} (GMT{o>=0?`+${o}`:o})</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between border rounded-[12px] p-4">
                <div><div className="text-[13px] font-bold">Enable Ship Time</div><div className="text-[11px] opacity-60">Use GMT offset for all times</div></div>
                <button onClick={()=>setTimeSettings({...timeSettings,shipTimeEnabled:!timeSettings.shipTimeEnabled})} className={`w-12 h-6 rounded-full p-1 transition ${timeSettings.shipTimeEnabled?'bg-[#f97316]':'bg-black/20'}`}><div className={`w-4 h-4 bg-white rounded-full transition ${timeSettings.shipTimeEnabled?'translate-x-6':'translate-x-0'}`} /></button>
              </div>
              <div className={`border rounded-[12px] p-4 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11px] uppercase opacity-60 mb-2">Preview</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="text-[10px] uppercase opacity-50">Device Time</div><div className="text-[14px] font-mono font-bold mt-1">{format24H(new Date())}</div></div>
                  <div><div className="text-[10px] uppercase opacity-50">Ship Time ({formatGMT(timeSettings.gmtOffset)})</div><div className="text-[14px] font-mono font-bold mt-1 text-[#f97316]">{format24H(getShipTimeNow(timeSettings.gmtOffset, true))}</div></div>
                </div>
              </div>
            </div>
            <div className={`sticky bottom-0 border-t px-6 py-4 flex justify-end ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}><button onClick={()=>setShowTimeModal(false)} className="px-6 py-2.5 rounded-full bg-[#f97316] text-white text-[12px] font-bold">Save Settings</button></div>
          </div>
        </div>
      )}
                  {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={()=>setShowShareModal(false)}>
          <div className={`w-full max-w-[420px] rounded-[20px] shadow-2xl border my-4 md:my-8 max-h-[90vh] flex flex-col overflow-hidden ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`} onClick={e=>e.stopPropagation()}>
            <div className={`px-6 py-4 flex items-center justify-between border-b shrink-0 ${isDark?'border-white/10':'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0f172a] border border-white/10 rounded-[10px] flex items-center justify-center"><AnchorLogoIcon /></div>
                <div>
                  <div className={`text-[14px] font-bold ${isDark?'text-white':'text-slate-900'}`}>Share SeaTime</div>
                  <div className="text-[10px] opacity-60">True 24H • DMW Rules</div>
                </div>
              </div>
              <button onClick={()=>setShowShareModal(false)} title="Close" aria-label="Close" className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark?'bg-white/10 text-white':'bg-slate-100 text-slate-700'}`}>✕</button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-[16px] p-3 shadow-lg">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://seafarer-tracker.vercel.app/')}`} alt="QR" className="w-[180px] h-[180px] rounded-[8px]" />
                </div>
                <div className="mt-3 text-[11px] opacity-60 text-center">Scan to share SeaTime Tracker (QR requires internet)</div>
                <div className="mt-1 text-[10px] opacity-40 font-mono">https://seafarer-tracker.vercel.app/</div>
              </div>
              <div className={`flex items-center gap-2 border rounded-full px-3 py-2 ${isDark?'bg-white/5 border-white/10':'bg-slate-50 border-slate-200'}`}>
                <input value="https://seafarer-tracker.vercel.app/" readOnly className={`flex-1 bg-transparent text-[11px] font-mono outline-none ${isDark?'text-white/80':'text-slate-700'}`} />
                <button onClick={async()=>{try{await navigator.clipboard.writeText('https://seafarer-tracker.vercel.app/'); alert('Link copied!');}catch{prompt('Copy link:','https://seafarer-tracker.vercel.app/');}}} title="Copy link" className="text-[11px] bg-white text-black rounded-full px-3 py-1 font-bold">Copy</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>{const qrUrl=`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent('https://seafarer-tracker.vercel.app/')}`; const a=document.createElement('a'); a.href=qrUrl; a.download='seatime-qrcode.png'; a.target='_blank'; a.click();}} className="flex flex-col items-center gap-2 border rounded-[14px] p-4 hover:bg-white/5 transition group">
                  <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-[18px] group-hover:bg-emerald-500 group-hover:text-white transition">💾</div>
                  <div className={`text-[11px] font-bold ${isDark?'text-white':'text-slate-900'}`}>Save to Device</div>
                  <div className="text-[9px] opacity-50 text-center">Download QR as PNG</div>
                </button>
                <button onClick={async()=>{const shareData={title:'SeaTime - Seafarer Tracker',text:'Track work, rest & OT',url:'https://seafarer-tracker.vercel.app/'}; try{if(navigator.share){await navigator.share(shareData);} else if(navigator.clipboard){await navigator.clipboard.writeText(shareData.url); alert('Link copied!');} else {prompt('Copy link:',shareData.url);}}catch{}}} className="flex flex-col items-center gap-2 border rounded-[14px] p-4 hover:bg-white/5 transition group bg-[#f97316]/10 border-[#f97316]/20">
                  <div className="w-10 h-10 bg-[#f97316] rounded-full flex items-center justify-center text-[18px] text-white">↗️</div>
                  <div className={`text-[11px] font-bold ${isDark?'text-white':'text-slate-900'}`}>Share App</div>
                  <div className="text-[9px] opacity-50 text-center">WhatsApp / Messenger</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className={isDark?"bg-[#070e1f] border-t border-white/10 mt-8":"bg-white border-t border-slate-200 mt-8 shadow-sm"}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className={`text-[11px] text-center md:text-left ${isDark?'opacity-60':'opacity-80'}`}>
            <div className={`font-bold ${isDark?'text-white':'text-slate-900'}`}>© 2026 SeaTime — Seafarer Tracker</div>
            <div className={`mt-1 text-[10px] ${isDark?'text-white/60':'text-slate-600'}`}>Developed by Alikhantz • All Rights Reserved • DMW OT Rules • True 24H • PWA Offline-First</div>
          </div>
          <div className={`flex items-center gap-2 text-[10px] ${isDark?'opacity-50':'opacity-70'}`}>
            <span className={`border rounded-full px-3 py-1 ${isDark?'border-white/10 text-white':'border-slate-300 text-slate-700 bg-slate-50'}`}>v1.0 • 2026</span>
            <span className={`border rounded-full px-3 py-1 ${isDark?'border-white/10 text-white':'border-slate-300 text-slate-700 bg-slate-50'}`}>© All Rights Reserved</span>
            <a href="https://github.com/alikhantz/seafarer-tracker" target="_blank" rel="noopener noreferrer" className={`border rounded-full px-3 py-1 hover:bg-black/5 ${isDark?'border-white/10 text-white hover:bg-white/10':'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100'}`}>GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
