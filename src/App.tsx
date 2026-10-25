
import React, { useState, useMemo } from 'react';

const fontLinks = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Instrument+Sans:wght@400;500;600&display=swap');
`;

type Breakdown = {
  deckWork: number; watch: number; standby: number; mooring: number; bunkering: number;
  provisionDeck: number; provisionEngine: number; provisionGalley: number;
  garbage: number; cargo: number; drills: number; other: number;
};
type Entry = {
  breakdown: Breakdown; totalWork: number;
  location: 'At Sea' | 'At Port'; duty: 'Regular Work' | 'Watch Duty' | 'Standby / Extra';
  watchSlot: string; notes: string; date: string;
  portName: string; arrivalTime: string; departureTime: string;
};
type Rank = 'Master / Captain' | 'Chief Mate / Chief Officer' | 'Second Mate / Second Officer' | 'Third Mate / Third Officer' | 'Deck Cadet' | 'Bosun / Boatswain' | 'Able Seaman (AB)' | 'Ordinary Seaman (OS)' | 'Chief Engineer' | 'Second Engineer' | 'Third Engineer' | 'Fourth Engineer' | 'Electrical Officer (ETO)' | 'Fitter' | 'Oiler / Motorman' | 'Wiper' | 'Engine Cadet' | 'Chief Steward' | 'Chief Cook' | 'Second Cook' | 'Messman' | 'Steward / Utility';
type Department = 'Deck' | 'Engine' | 'Galley';
type VesselInfo = { name: string; type: string; imo: string; flag: string; masterName: string; };
type SeafarerInfo = { name: string; employeeNo: string; department: Department; };

const VESSEL_TYPES = ['Container Ship','Bulk Carrier','Oil Tanker','Chemical Tanker','LNG Carrier','LPG Carrier','General Cargo','Ro-Ro / Vehicle Carrier','Passenger / Cruise','Offshore Supply Vessel','Tug Boat','Fishing Vessel','Other'];
const FLAG_REGISTRIES = ['Panama','Liberia','Marshall Islands','Hong Kong','Singapore','Malta','Bahamas','Greece','Japan','China','Philippines','USA','UK','Norway','Denmark','Germany','Italy','South Korea','Cyprus','Isle of Man','Other'];
const RANKS: { label: string, dept: 'Deck'|'Engine'|'Catering', icon: string }[] = [
  { label: 'Master / Captain', dept: 'Deck', icon: '👨‍✈️' },{ label: 'Chief Mate / Chief Officer', dept: 'Deck', icon: '🧭' },{ label: 'Second Mate / Second Officer', dept: 'Deck', icon: '🗺️' },{ label: 'Third Mate / Third Officer', dept: 'Deck', icon: '📡' },{ label: 'Deck Cadet', dept: 'Deck', icon: '🎓' },{ label: 'Bosun / Boatswain', dept: 'Deck', icon: '⚓' },{ label: 'Able Seaman (AB)', dept: 'Deck', icon: '🪢' },{ label: 'Ordinary Seaman (OS)', dept: 'Deck', icon: '🌊' },
  { label: 'Chief Engineer', dept: 'Engine', icon: '⚙️' },{ label: 'Second Engineer', dept: 'Engine', icon: '🔧' },{ label: 'Third Engineer', dept: 'Engine', icon: '🔩' },{ label: 'Fourth Engineer', dept: 'Engine', icon: '🛠️' },{ label: 'Electrical Officer (ETO)', dept: 'Engine', icon: '💡' },{ label: 'Fitter', dept: 'Engine', icon: '🔨' },{ label: 'Oiler / Motorman', dept: 'Engine', icon: '⛽' },{ label: 'Wiper', dept: 'Engine', icon: '🧹' },{ label: 'Engine Cadet', dept: 'Engine', icon: '🎓' },
  { label: 'Chief Steward', dept: 'Catering', icon: '👨‍🍳' },{ label: 'Chief Cook', dept: 'Catering', icon: '🍳' },{ label: 'Second Cook', dept: 'Catering', icon: '🥘' },{ label: 'Messman', dept: 'Catering', icon: '🍽️' },{ label: 'Steward / Utility', dept: 'Catering', icon: '🧼' },
];
const BREAKDOWN_FIELDS: { key: keyof Breakdown; label: string; short: string; icon: string; }[] = [
  { key: 'deckWork', label: 'Deck Work', short: 'Deck Work', icon: '🛠️' },{ key: 'watch', label: 'Watch Duty', short: 'Watch Duty', icon: '👁️' },{ key: 'standby', label: 'Standby / Extra', short: 'Standby', icon: '⏳' },{ key: 'mooring', label: 'Mooring / Unmooring', short: 'Mooring', icon: '⚓' },{ key: 'bunkering', label: 'Bunkering', short: 'Bunkering', icon: '⛽' },{ key: 'provisionDeck', label: 'Provision - Deck', short: 'Provision Deck', icon: '📦' },{ key: 'provisionEngine', label: 'Provision - Engine', short: 'Provision Engine', icon: '🔧' },{ key: 'provisionGalley', label: 'Provision - Galley', short: 'Provision Galley', icon: '🍳' },{ key: 'garbage', label: 'Garbage Disposal', short: 'Garbage', icon: '♻️' },{ key: 'cargo', label: 'Cargo Operations', short: 'Cargo', icon: '📋' },{ key: 'drills', label: 'Drills & Training', short: 'Drills', icon: '🚨' },{ key: 'other', label: 'Other Tasks', short: 'Other', icon: '➕' },
];
const WATCH_SLOTS = ['12-4 (00-04 & 12-16)','4-8 (04-08 & 16-20)','8-12 (08-12 & 20-00)','12-6 (00-06 & 12-18)','6-12 (06-12 & 18-00)','Daywork (06-18)','No Watch'];
// DMW Contract Holidays - 10 Regular Holidays (Eid'l removed per user request)
// All Saints' Day NOT included - Special Non-Working only
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

function toISO(d: Date){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function format24H(date: Date){return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`;}
function format24H_HM(date: Date){return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;}
function parseISO(s: string){const [y,m,dd]=s.split('-').map(Number);return new Date(y,m-1,dd);}
function getMonday(d: Date){const date=new Date(d);const day=date.getDay();const diff=date.getDate()-day+(day===0?-6:1);date.setDate(diff);date.setHours(0,0,0,0);return date;}
function addDays(d: Date,n: number){const nd=new Date(d);nd.setDate(nd.getDate()+n);return nd;}
function sumBreakdown(b: Breakdown){return Object.values(b).reduce((a,v)=>a+(Number(v)||0),0);}
function emptyBreakdown(): Breakdown{return {deckWork:0,watch:0,standby:0,mooring:0,bunkering:0,provisionDeck:0,provisionEngine:0,provisionGalley:0,garbage:0,cargo:0,drills:0,other:0};}

function Time24Input({value, onChange, isDark}:{value:string, onChange:(v:string)=>void, isDark:boolean}){
  const [h,m]= (value||'').split(':');
  const hh = h||''; const mm = m||'';
  const setH=(newH:string)=>{const newVal = `${newH.padStart(2,'0')}:${(mm||'00').padStart(2,'0')}`; onChange(newVal);};
  const setM=(newM:string)=>{const newVal = `${(hh||'00').padStart(2,'0')}:${newM.padStart(2,'0')}`; onChange(newVal);};
  return (
    <div className="flex items-center gap-1.5">
      <select value={hh} onChange={e=>setH(e.target.value)} className={`flex-1 border rounded-full px-2 py-2 text-[13px] font-bold text-center outline-none focus:ring-2 focus:ring-orange-500/30 ${isDark?'bg-[#0f172a] border-white/20 text-white':'bg-slate-50 border-slate-200 text-slate-900'}`}>
        <option value="">--</option>
        {Array.from({length:24}).map((_,i)=><option key={i} value={String(i).padStart(2,'0')} className="text-black">{String(i).padStart(2,'0')}</option>)}
      </select>
      <span className={`font-bold ${isDark?'text-white':'text-slate-900'}`}>:</span>
      <select value={mm} onChange={e=>setM(e.target.value)} className={`flex-1 border rounded-full px-2 py-2 text-[13px] font-bold text-center outline-none focus:ring-2 focus:ring-orange-500/30 ${isDark?'bg-[#0f172a] border-white/20 text-white':'bg-slate-50 border-slate-200 text-slate-900'}`}>
        <option value="">--</option>
        {Array.from({length:60}).map((_,i)=><option key={i} value={String(i).padStart(2,'0')} className="text-black">{String(i).padStart(2,'0')}</option>)}
      </select>
      <span className="text-[10px] text-orange-400 font-bold ml-1">24H</span>
    </div>
  );
}

type DayOTInfo={type:string;regularHours:number;otHours:number;doubleHours:number;payHours:number;multiplier:number;isHoliday:boolean;isWeekend:boolean;};
function computeWeekOT(entries: Record<string, Entry>, weekStart: Date, holidaysSet: Set<string>){
  const perDay: Record<string, DayOTInfo>={}; 
  for(let i=0;i<7;i++){
    const d=addDays(weekStart,i);
    const iso=toISO(d);
    const e=entries[iso];
    const isHoliday=holidaysSet.has(iso);
    const isWeekend=d.getDay()===0||d.getDay()===6;
    const work=e?.totalWork||0;
    let regularHours=0,otHours=0,doubleHours=0,payHours=0,type='Regular',multiplier=1;
    const isDouble=isHoliday && e?.location==='At Port' && e?.duty==='Watch Duty';
    if(!e||work===0){
      type='No Work';
    }else if(isDouble){
      doubleHours=work*2; payHours=doubleHours; type='Double OT (Holiday+Port+Watch 8h→16h)'; multiplier=2;
    }else if(isHoliday){
      otHours=work; payHours=work; type='OT-Holiday'; multiplier=1;
    }else if(isWeekend){
      otHours=work; payHours=work; type='OT-Weekend (Sat/Sun Auto OT)'; multiplier=1;
    }else{
      const dailyReg=Math.min(work,8); const dailyOT=Math.max(0,work-8);
      regularHours=dailyReg; otHours=dailyOT; payHours=work;
      type=dailyOT>0?`Regular ${dailyReg}h + OT ${dailyOT}h (Beyond 8h/day)`:'Regular - Working Time (8h/day Mon-Fri)';
    }
    perDay[iso]={type,regularHours,otHours,doubleHours,payHours,multiplier,isHoliday,isWeekend};
  }
  let totalOT=0,totalDouble=0,totalPay=0,weekdayOT=0,weekendOT=0,holidayOT=0,cumulativeRegular=0;
  Object.values(perDay).forEach(p=>{
    totalOT+=p.otHours; totalDouble+=p.doubleHours; totalPay+=p.payHours; cumulativeRegular+=p.regularHours;
    if(p.isWeekend) weekendOT+=p.otHours;
    else if(p.isHoliday) holidayOT+=p.otHours + (p.doubleHours>0? p.doubleHours/2 : 0);
    else weekdayOT+=p.otHours;
  });
  return {perDay,totals:{totalOT,totalDouble,totalPay,cumulativeRegular,weekdayOT,weekendOT,holidayOT}};
}

export default function App(){
  const [theme,setTheme]=useState<'dark'|'light'>(()=>{try{const s=localStorage.getItem('seatime-theme'); if(s==='dark'||s==='light') return s as any;}catch{} return 'dark';});
  const [viewDate,setViewDate]=useState(()=>new Date());
  const [seafarerInfo,setSeafarerInfo]=useState<SeafarerInfo>(()=>{try{const s=localStorage.getItem('seatime-seafarer');if(s){const parsed=JSON.parse(s); return {name:parsed.name||'',employeeNo:parsed.employeeNo||'',department:parsed.department||'Deck'};}}catch{}return {name:'',employeeNo:'',department:'Deck'};});
  const [vesselInfo,setVesselInfo]=useState<VesselInfo>(()=>{try{const s=localStorage.getItem('seatime-vessel');if(s){const parsed=JSON.parse(s); return {name:parsed.name||'',type:parsed.type||'Container Ship',imo:parsed.imo||'',flag:parsed.flag||'',masterName:parsed.masterName||''};}}catch{}return {name:'',type:'Container Ship',imo:'',flag:'',masterName:''};});
  const [showVesselModal,setShowVesselModal]=useState(false);
  const [summaryView,setSummaryView]=useState<'weekly'|'monthly'>('weekly');
  const [userRank,setUserRank]=useState<Rank>(()=>{try{const s=localStorage.getItem('seatime-rank');if(s)return s as Rank;}catch{}return 'Able Seaman (AB)';});
  const [entries,setEntries]=useState<Record<string, Entry>>(()=>{try{const s=localStorage.getItem('seatime-entries');if(s)return JSON.parse(s);}catch{}return {};});
  const [selectedISO,setSelectedISO]=useState<string|null>(null);
  const [editing,setEditing]=useState<Entry|null>(null);
  const [now24H,setNow24H]=useState(()=>new Date());
  React.useEffect(()=>{const id=setInterval(()=>setNow24H(new Date()),1000);return ()=>clearInterval(id);},[]);
  React.useEffect(()=>{try{localStorage.setItem('seatime-theme',theme);}catch{}},[theme]);
  React.useEffect(()=>{try{localStorage.setItem('seatime-rank',userRank);}catch{}},[userRank]);
  React.useEffect(()=>{try{localStorage.setItem('seatime-vessel',JSON.stringify(vesselInfo));}catch{}},[vesselInfo]);
  React.useEffect(()=>{try{localStorage.setItem('seatime-seafarer',JSON.stringify(seafarerInfo));}catch{}},[seafarerInfo]);
  React.useEffect(()=>{try{localStorage.setItem('seatime-entries',JSON.stringify(entries));}catch{}},[entries]);

  const holidaysSet=useMemo(()=>new Set(PH_HOLIDAYS_2026.map(h=>h.date)),[]);
  const holidayMap=useMemo(()=>new Map(PH_HOLIDAYS_2026.map(h=>[h.date,h.name] as [string,string])),[]);
  const weekStart=useMemo(()=>getMonday(viewDate),[viewDate]);
  const monthStart=useMemo(()=>new Date(viewDate.getFullYear(),viewDate.getMonth(),1),[viewDate]);
  const monthEnd=useMemo(()=>new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0),[viewDate]);
  const weekOT=useMemo(()=>computeWeekOT(entries,weekStart,holidaysSet),[entries,weekStart,holidaysSet]);
  const calendarDays=useMemo(()=>{const days: Date[]=[];const start=getMonday(monthStart);for(let i=0;i<42;i++)days.push(addDays(start,i));return days;},[monthStart]);

  const weekBreakdownTotals=useMemo(()=>{
    const totals=emptyBreakdown(); let totalWork=0,totalRest=0;
    for(let i=0;i<7;i++){const d=addDays(weekStart,i);const iso=toISO(d);const e=entries[iso];if(e){(Object.keys(totals) as (keyof Breakdown)[]).forEach(k=>{totals[k]+=e.breakdown[k]||0;});totalWork+=e.totalWork;totalRest+=Math.max(0,24-e.totalWork);}}
    return {totals,totalWork,totalRest};
  },[entries,weekStart]);

  const compliance=useMemo(()=>{
    let compliantDays=0,totalDaysWithEntry=0,weekRest=0;
    for(let i=0;i<7;i++){const d=addDays(weekStart,i);const iso=toISO(d);const e=entries[iso];if(e){totalDaysWithEntry++;const rest=24-e.totalWork;weekRest+=rest;if(rest>=10)compliantDays++;}else{weekRest+=24;}}
    return {compliantDays,totalDaysWithEntry,weekRest,dayCompliancePct: totalDaysWithEntry?Math.round((compliantDays/totalDaysWithEntry)*100):100};
  },[entries,weekStart]);

  const monthTotals=useMemo(()=>{
    let totalWork=0,monthPay=0,monthOT=0,monthDouble=0,monthRegular=0,monthWeekendOT=0,monthWeekdayOT=0;
    let cur=getMonday(monthStart); const last=getMonday(monthEnd);
    while(cur<=last){
      const w=computeWeekOT(entries,cur,holidaysSet);
      monthPay+=w.totals.totalPay;
      for(let i=0;i<7;i++){
        const d=addDays(cur,i);
        if(d.getMonth()===viewDate.getMonth() && d.getFullYear()===viewDate.getFullYear()){
          const iso=toISO(d); const dayInfo=w.perDay[iso];
          if(dayInfo){monthOT+=dayInfo.otHours; monthDouble+=dayInfo.doubleHours; monthRegular+=dayInfo.regularHours; if(dayInfo.isWeekend) monthWeekendOT+=dayInfo.otHours; else if(!dayInfo.isHoliday) monthWeekdayOT+=dayInfo.otHours;}
        }
      }
      cur=addDays(cur,7);
    }
    Object.values(entries).forEach(e=>{const d=parseISO(e.date);if(d.getMonth()===viewDate.getMonth()&&d.getFullYear()===viewDate.getFullYear())totalWork+=e.totalWork;});
    const daysInMonth=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0).getDate();
    const monthRest=daysInMonth*24-totalWork;
    return {totalWork,monthPay,monthOT,monthDouble,monthRegular,monthWeekendOT,monthWeekdayOT,monthRest,daysInMonth};
  },[entries,monthStart,monthEnd,viewDate,holidaysSet]);

  const openDay=(iso: string)=>{
    const existing=entries[iso];
    const holidayName = holidayMap.get(iso);
    let newEntry: Entry;
    if(existing){
      newEntry={...existing};
      if(holidayName && !newEntry.notes){
        // Auto-note holiday if notes empty
        newEntry={...newEntry, notes: holidayName};
      }
    }else{
      newEntry={breakdown:emptyBreakdown(),totalWork:0,location:'At Sea',duty:'Regular Work',watchSlot:'12-4 (00-04 & 12-16)',notes: holidayName || '',portName:'',arrivalTime:'',departureTime:'',date:iso};
    }
    setEditing(newEntry); setSelectedISO(iso);
  };
  const handleSave=()=>{if(!editing)return;const total=sumBreakdown(editing.breakdown);const toSave: Entry={...editing,totalWork:total};if(total===0&&!editing.notes&&!editing.arrivalTime&&!editing.departureTime){const copy={...entries};delete copy[editing.date];setEntries(copy);}else{setEntries(prev=>({...prev,[editing.date]:toSave}));}setSelectedISO(null);setEditing(null);};
  const handleDelete=()=>{if(!editing)return;const copy={...entries};delete copy[editing.date];setEntries(copy);setSelectedISO(null);setEditing(null);};
  const updateBreakdown=(key: keyof Breakdown, delta: number)=>{if(!editing)return;const cur=editing.breakdown[key]||0;const next=Math.max(0,Math.min(24,parseFloat((cur+delta).toFixed(1))));setEditing({...editing,breakdown:{...editing.breakdown,[key]:next}});};
  const setBreakdownValue=(key: keyof Breakdown, val: number)=>{if(!editing)return;const next=Math.max(0,Math.min(24,isNaN(val)?0:val));setEditing({...editing,breakdown:{...editing.breakdown,[key]:next}});};
  const liveTotal=editing?sumBreakdown(editing.breakdown):0;
  const liveRest=Math.max(0,24-liveTotal);
  const liveOTPreview=useMemo(()=>{
    if(!editing) return null;
    const iso=editing.date; const isHoliday=holidaysSet.has(iso); const d=parseISO(iso); const isWeekend=d.getDay()===0||d.getDay()===6;
    const isDouble=isHoliday&&editing.location==='At Port'&&editing.duty==='Watch Duty';
    if(isDouble) return {type:'Double OT (Holiday+Port+Watch 8h→16h)',multiplier:2,pay:liveTotal*2};
    if(isWeekend) return {type:'OT-Weekend (Auto OT - straight)',multiplier:1,pay:liveTotal};
    if(isHoliday) return {type:'OT-Holiday (straight)',multiplier:1,pay:liveTotal};
    if(liveTotal>8) return {type:`Regular 8h + OT ${liveTotal-8}h (Beyond 8h/day)`,multiplier:1,pay:liveTotal};
    return {type:'Regular - Working Time (8h/day Mon-Fri)',multiplier:1,pay:liveTotal};
  },[editing,liveTotal,holidaysSet,weekStart,entries]);

  const isDark = theme==='dark';
  const weekPayHours = weekOT.totals.cumulativeRegular + weekOT.totals.totalOT + weekOT.totals.totalDouble;
  const monthPayHours = monthTotals.monthRegular + monthTotals.monthOT + monthTotals.monthDouble;

  return (
    <div className={isDark?"min-h-screen bg-[#070e1f] text-slate-100":"min-h-screen bg-[#f8fafc] text-slate-900"} style={{fontFamily:"'Instrument Sans', system-ui, sans-serif"} as any}>
      <style>{fontLinks}</style>
      <header className={isDark?"sticky top-0 z-30 bg-[#0f172a] border-b border-white/10":"sticky top-0 z-30 bg-[#0f172a] border-b border-white/10 text-white"}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f97316] rounded-[10px] flex items-center justify-center font-bold text-white">S</div>
            <div>
              <div className="text-[15px] font-bold leading-none tracking-wide text-white">SEATIME</div>
              <div className="text-[9px] opacity-60 uppercase text-white">Detailed Breakdown Tracker • TRUE 24H • DMW 40h/week</div>
            </div>
            <div className="hidden lg:flex items-center gap-2 ml-6 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[10px] text-white">
              <span className="opacity-60">OT</span><span className="font-bold">{weekOT.totals.totalOT.toFixed(1)}h (Wkday {weekOT.totals.weekdayOT.toFixed(1)}+Wkend {weekOT.totals.weekendOT.toFixed(1)})</span><span className="opacity-40">•</span><span>Dbl {weekOT.totals.totalDouble.toFixed(1)}h</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setTheme(isDark?'light':'dark')} className="text-[11px] bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-white font-bold">
              {isDark?'☀️ Light':'🌙 Dark'}
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-white"><span className="text-[9px] opacity-60 uppercase">24H</span><span className="text-[12px] font-mono font-bold">{format24H(now24H)}</span></div>
            <button onClick={()=>{
              const data={entries,vesselInfo,seafarerInfo,userRank,exportDate:new Date().toISOString()};
              const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
              const url=URL.createObjectURL(blob);
              const a=document.createElement('a'); a.href=url; a.download=`seatime-${toISO(new Date())}.json`; a.click(); URL.revokeObjectURL(url);
            }} className="hidden md:flex text-[11px] bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-white">Export JSON</button>
            <label className="hidden md:flex text-[11px] bg-white/10 border border-white/20 rounded-full px-3 py-1.5 cursor-pointer text-white">Import JSON<input type="file" accept=".json" className="hidden" onChange={e=>{
              const file=e.target.files?.[0]; if(!file) return;
              const reader=new FileReader();
              reader.onload=ev=>{
                try{
                  const data=JSON.parse(ev.target?.result as string);
                  if(data.entries) setEntries(data.entries);
                  if(data.vesselInfo) setVesselInfo(data.vesselInfo);
                  if(data.seafarerInfo) setSeafarerInfo(data.seafarerInfo);
                  if(data.userRank) setUserRank(data.userRank);
                  alert('Imported!');
                }catch{alert('Invalid file');}
              };
              reader.readAsText(file);
            }} /></label>
            <button onClick={async()=>{
              const shareData={title:'SeaTime - Seafarer Tracker',text:'Track work, rest & OT - DMW 40h/week 8h/day Mon-Fri Sat/Sun Auto OT Straight, PH Holiday Double OT, PWA offline, True 24H',url:window.location.href};
              try{if(navigator.share){await navigator.share(shareData);}else if(navigator.clipboard){await navigator.clipboard.writeText(window.location.href); alert('Link copied: '+window.location.href);}else{prompt('Copy link:',window.location.href);}}catch{}
            }} className="text-[11px] bg-[#f97316] text-white rounded-full px-3 py-1.5 font-bold">Share App</button>
            <button onClick={()=>{
              if(confirm('Clear ALL data?\n\nThis will delete:\n- All calendar entries\n- Vessel info (Beijing, IMO, Flag, Master)\n- Seafarer info\n\nCannot be undone. Export JSON first if you want backup.')){ 
                setEntries({}); 
                setVesselInfo({name:'',type:'Container Ship',imo:'',flag:'',masterName:''}); 
                setSeafarerInfo({name:'',employeeNo:'',department:'Deck'}); 
                setUserRank('Able Seaman (AB)' as any); 
                try{localStorage.removeItem('seatime-entries'); localStorage.removeItem('seatime-vessel'); localStorage.removeItem('seatime-seafarer'); localStorage.removeItem('seatime-rank');}catch{} 
                alert('All data cleared - blank slate for new users!'); 
              }
            }} className="text-[11px] bg-red-500/20 border border-red-500/30 text-red-400 rounded-full px-3 py-1.5 font-bold hover:bg-red-500 hover:text-white">Clear All</button>
            <button onClick={()=>setViewDate(new Date())} className="text-[11px] border border-white/20 rounded-full px-3 py-1.5 text-white">Today</button>
          </div>
        </div>
      </header>

      <div className={isDark?"bg-[#0b1222] border-b border-white/5":"bg-white border-b border-slate-200"}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div><div className="text-[9px] uppercase opacity-50">Vessel Name</div><button onClick={()=>setShowVesselModal(true)} className={`mt-1 w-full text-left border rounded-[10px] px-3 py-2 text-[12px] font-bold hover:opacity-80 ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.name}</button></div>
          <div><div className="text-[9px] uppercase opacity-50">Master Name</div><button onClick={()=>setShowVesselModal(true)} className={`mt-1 w-full text-left border rounded-[10px] px-3 py-2 text-[11px] font-bold hover:opacity-80 ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.masterName||'Set Master'}</button></div>
          <div><div className="text-[9px] uppercase opacity-50">IMO</div><div className={`mt-1 border rounded-[10px] px-3 py-2 text-[11px] font-mono ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.imo}</div></div>
          <div><div className="text-[9px] uppercase opacity-50">Flag</div><div className={`mt-1 border rounded-[10px] px-3 py-2 text-[11px] ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{vesselInfo.flag}</div></div>
          <div><div className="text-[9px] uppercase opacity-50">Seafarer</div><button onClick={()=>setShowVesselModal(true)} className={`mt-1 w-full text-left border rounded-[10px] px-3 py-2 text-[11px] font-bold hover:opacity-80 ${isDark?'bg-white/[0.04] border-white/10':'bg-slate-50 border-slate-200'}`}>{seafarerInfo.name||'Set Name'} • {userRank.split(' / ')[0]} • {seafarerInfo.department}</button></div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wide">Pay Hours</div>
              <div className={`flex rounded-full p-1 border ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-100 border-slate-200'}`}>
                <button onClick={()=>setSummaryView('weekly')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${summaryView==='weekly'?'bg-[#f97316] text-white':isDark?'text-white/60':'text-slate-600'}`}>WEEK</button>
                <button onClick={()=>setSummaryView('monthly')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${summaryView==='monthly'?'bg-[#f97316] text-white':isDark?'text-white/60':'text-slate-600'}`}>MONTH</button>
              </div>
            </div>

            {summaryView==='weekly'?(
              <>
                <div className="space-y-2">
                  <div className={`flex justify-between items-center border rounded-[12px] px-3 py-3 ${isDark?'bg-white/[0.03] border-white/5':'bg-slate-50 border-slate-200'}`}>
                    <div><div className="text-[10px] opacity-60">SEA • REG • Regular</div><div className="text-[11px] opacity-40">Mon-Fri 8h/day = 40h/week</div></div>
                    <div className="text-[18px] font-bold text-emerald-400">{weekOT.totals.cumulativeRegular.toFixed(1)}</div>
                  </div>
                  <div className={`flex justify-between items-center border rounded-[12px] px-3 py-3 ${isDark?'bg-white/[0.03] border-white/5':'bg-slate-50 border-slate-200'}`}>
                    <div><div className="text-[10px] opacity-60">OT Straight</div><div className="text-[11px] opacity-40">Beyond 8h/day + Sat/Sun Auto OT (No 1.5×)</div></div>
                    <div className="text-[18px] font-bold text-blue-400">{(weekOT.totals.totalOT).toFixed(1)}</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-950/30 border border-red-500/20 rounded-[12px] px-3 py-3">
                    <div><div className="text-[10px] text-red-300">Double OT • PH + PORT + WATCH</div><div className="text-[11px] opacity-40">8h → 16h ONLY case</div></div>
                    <div className="text-[18px] font-bold text-red-400">{weekOT.totals.totalDouble.toFixed(1)}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className={`border rounded-[12px] p-3 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                    <div className="text-[9px] uppercase opacity-50">Total Actual</div>
                    <div className="text-[18px] font-bold mt-1">{weekBreakdownTotals.totalWork.toFixed(1)}h</div>
                  </div>
                  <div className="bg-[#f97316] rounded-[12px] p-3 text-white">
                    <div className="text-[9px] uppercase opacity-80">Total Paid (incl 2×)</div>
                    <div className="text-[18px] font-bold mt-1">{weekPayHours.toFixed(1)}h</div>
                  </div>
                </div>
                <div className={`mt-3 border rounded-[12px] p-3 ${isDark?'bg-emerald-950/20 border-emerald-500/20':'bg-emerald-50 border-emerald-200'}`}>
                  <div className="text-[9px] uppercase text-emerald-600">Rest Hours</div>
                  <div className="text-[14px] font-bold text-emerald-500">{weekBreakdownTotals.totalRest.toFixed(1)}h <span className="text-[10px] opacity-60">/ 168h week</span></div>
                  <div className="text-[9px] opacity-50 mt-1">{compliance.compliantDays}/{compliance.totalDaysWithEntry} days ≥10h rest • {compliance.weekRest}h week rest</div>
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
                  <div className="flex justify-between items-center bg-red-950/30 border border-red-500/20 rounded-[12px] px-3 py-3">
                    <div><div className="text-[10px] text-red-300">Double OT</div><div className="text-[11px] opacity-40">Holiday+Port+Watch</div></div>
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
            <div className="mt-4 flex gap-2">
              <button onClick={()=>{
                const data={entries,vesselInfo,seafarerInfo,userRank,exportDate:new Date().toISOString()};
                const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
                const url=URL.createObjectURL(blob);
                const a=document.createElement('a'); a.href=url; a.download=`seatime-${toISO(new Date())}.json`; a.click(); URL.revokeObjectURL(url);
              }} className={`flex-1 text-[10px] border rounded-full py-2 font-bold ${isDark?'bg-white/10 border-white/20':'bg-slate-100 border-slate-200'}`}>Export</button>
              <label className={`flex-1 text-[10px] border rounded-full py-2 font-bold text-center cursor-pointer ${isDark?'bg-white/10 border-white/20':'bg-slate-100 border-slate-200'}`}>Import<input type="file" accept=".json" className="hidden" onChange={e=>{
                const file=e.target.files?.[0]; if(!file) return;
                const reader=new FileReader();
                reader.onload=ev=>{
                  try{
                    const data=JSON.parse(ev.target?.result as string);
                    if(data.entries) setEntries(data.entries);
                    if(data.vesselInfo) setVesselInfo(data.vesselInfo);
                    if(data.seafarerInfo) setSeafarerInfo(data.seafarerInfo);
                    if(data.userRank) setUserRank(data.userRank);
                    alert('Imported!');
                  }catch{alert('Invalid');}
                };
                reader.readAsText(file);
              }} /></label>
              <button onClick={async()=>{
                const shareData={title:'SeaTime - Seafarer Tracker',text:'Track work/rest/OT - DMW 40h/week 8h/day Mon-Fri Sat/Sun Auto OT, PH Double OT, True 24H',url:window.location.href};
                try{if(navigator.share){await navigator.share(shareData);}else{await navigator.clipboard.writeText(window.location.href); alert('Link copied');}}catch{}
              }} className="flex-1 text-[10px] bg-[#f97316] text-white rounded-full py-2 font-bold">Share</button>
            </div>
          </div>

          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="text-[10px] uppercase opacity-60 mb-2">MLC Compliance</div>
            <div className="text-[24px] font-bold">{compliance.dayCompliancePct}%</div>
            <div className="text-[10px] opacity-50 mt-1">{compliance.compliantDays}/{compliance.totalDaysWithEntry} days ≥10h • {compliance.weekRest}h week (need 77h)</div>
            <div className="mt-2 w-full bg-black/10 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{width:`${compliance.dayCompliancePct}%`}} /></div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-bold">{viewDate.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</h2>
                <button onClick={()=>setViewDate(new Date())} className={`text-[10px] border rounded-full px-3 py-1 ${isDark?'bg-white/10 border-white/20':'bg-slate-100 border-slate-200'}`}>TODAY</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setViewDate(new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1))} className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark?'bg-white/10':'bg-slate-100'}`}>‹</button>
                <button onClick={()=>setViewDate(new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1))} className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark?'bg-white/10':'bg-slate-100'}`}>›</button>
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
                const isToday=toISO(new Date())===iso;
                const isWeekend=d.getDay()===0||d.getDay()===6;
                const holidayName = holidayMap.get(iso) as string | undefined;
                const isHoliday = !!holidayName;
                const info=weekOT.perDay[iso];
                return (
                  <div key={i} onClick={()=>openDay(iso)} className={`min-h-[92px] p-2 cursor-pointer transition relative ${!isCurrentMonth? (isDark?'bg-[#0a1120] opacity-30':'bg-slate-50 opacity-40') : isHoliday ? (isDark?'bg-red-950/30 hover:bg-red-900/40':'bg-red-50 hover:bg-red-100') : isDark?'bg-[#0f172a] hover:bg-white/[0.04]':'bg-white hover:bg-slate-50'} ${isToday?'ring-1 ring-orange-500 ring-inset':''} ${e? (isDark?'bg-[#121c33]':'bg-blue-50'):''} ${isHoliday?'border border-red-500/30':''}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-bold ${isHoliday?'text-red-500': isWeekend?'text-orange-400':''} ${isToday?'bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold': isHoliday && !isToday ? 'bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center' : ''}`}>{d.getDate()}</span>
                      {e&&<span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${info?.otHours>0?'bg-orange-500 text-white':'bg-black/10'}`}>{e.totalWork.toFixed(1)}h</span>}
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
                          <span className={`text-[7px] rounded-full px-1.5 py-0.5 ${isDark?'bg-white/10':'bg-slate-200'}`}>{e.location==='At Sea'?'SEA':'PORT'}</span>
                          {e.duty==='Watch Duty'&&<span className="text-[7px] bg-blue-500/30 text-blue-400 rounded-full px-1.5 py-0.5">WATCH</span>}
                          {info?.otHours>0&&<span className="text-[7px] bg-orange-500/30 text-orange-400 rounded-full px-1.5 py-0.5">OT {info.otHours.toFixed(1)}h</span>}
                          {info?.doubleHours>0&&<span className="text-[7px] bg-red-500/30 text-red-400 rounded-full px-1.5 py-0.5">DBL</span>}
                        </div>
                      </div>
                    )}
                    {!e && !isHoliday && isCurrentMonth && (
                      <div className="mt-2 text-[7px] opacity-30 text-center">Click to log</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={isDark?"bg-[#121c33] border border-white/10 rounded-[16px] p-4":"bg-white border border-slate-200 rounded-[16px] p-4"}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold uppercase">Detailed Breakdown</div>
              <div className="text-[9px] opacity-50">{Object.keys(entries).length} entries • True 24h • Overnight support</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-[9px] uppercase opacity-40 border-b border-white/10">
                    <th className="text-center py-2 px-2">Date</th>
                    <th className="text-center py-2 px-2">Location</th>
                    <th className="text-center py-2 px-2">Regular Work Hrs</th>
                    <th className="text-center py-2 px-2">OT Hrs</th>
                    <th className="text-center py-2 px-2">Rest Hrs</th>
                    <th className="text-center py-2 px-2">Day Type</th>
                    <th className="text-center py-2 px-2">Port / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(entries).sort((a,b)=>a.date.localeCompare(b.date)).slice(-20).map((e)=>{
                    const d=parseISO(e.date);
                    const isWeekend = d.getDay()===0||d.getDay()===6;
                    const holidayName = holidayMap.get(e.date);
                    const isHoliday = !!holidayName;
                    const isDouble = isHoliday && e.location==='At Port' && e.duty==='Watch Duty';
                    const work = e.totalWork;
                    let reg=0, ot=0, dblWork=0;
                    if(isDouble){ dblWork=work; }
                    else if(isHoliday){ ot=work; }
                    else if(isWeekend){ ot=work; }
                    else { reg=Math.min(work,8); ot=Math.max(0,work-8); }
                    const rest = Math.max(0,24-work);
                    const info=weekOT.perDay[e.date];
                    return (
                      <tr key={e.date} className={`border-b hover:bg-white/[0.04] ${isDark?'border-white/5':'border-slate-100'} ${isHoliday?'bg-red-500/5':''}`}>
                        <td className={`py-3 px-2 font-mono font-bold text-center ${isHoliday?'text-red-500':''}`}>
                          <div>{e.date}</div>
                          {isHoliday&&<div className="text-[7px] bg-red-500 text-white rounded-full px-1.5 py-0.5 mt-1 inline-block">{holidayName}</div>}
                        </td>
                        <td className="py-3 px-2 text-[10px] text-center">{e.location}</td>
                        <td className="py-3 px-2 text-center"><span className="font-bold text-[12px]">{reg.toFixed(1)}</span></td>
                        <td className="py-3 px-2 text-center">
                          {isDouble? (
                            <span className="font-bold text-[12px] text-red-500">{(dblWork*2).toFixed(1)}</span>
                          ): (
                            <span className={`font-bold text-[12px] ${isHoliday?'text-red-500':''}`}>{ot.toFixed(1)}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center"><span className="font-bold text-[12px]">{rest.toFixed(1)}</span></td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-[8px] font-bold ${isHoliday?'bg-red-500 text-white': info?.doubleHours>0?'bg-red-500/20 text-red-400 border border-red-500/30':info?.otHours>0?'bg-orange-500/20 text-orange-400 border border-orange-500/30':'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>{isHoliday? (isDouble?'DOUBLE HOL':'HOLIDAY') : info?.doubleHours>0?'DOUBLE':info?.isWeekend?'OT-WKND':info?.otHours>0?'OT':'REG'}</span>
                        </td>
                        <td className="py-3 px-2 max-w-[260px] text-[10px] leading-snug text-center">
                          {isHoliday && !e.notes ? holidayName : (e.notes || '')}
                          {isHoliday && e.notes && <div className="text-[8px] text-red-400 mt-1">{holidayName}</div>}
                        </td>
                      </tr>
                    );
                  })}
                  {Object.keys(entries).length===0&&<tr><td colSpan={7} className="py-8 text-center opacity-40">No entries yet. Click a day in calendar to log work → add Notes → Save. Holidays auto-noted in red.</td></tr>}
                </tbody>
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
                  <div><label className="text-[10px] opacity-60">Rank (Master to Messman)</label><select value={userRank} onChange={e=>{const newRank=e.target.value as Rank; setUserRank(newRank); const rankDept=RANKS.find(r=>r.label===newRank)?.dept; if(rankDept){const mapped: Department = rankDept==='Catering'?'Galley':rankDept as Department; setSeafarerInfo(prev=>({...prev,department:mapped}));}}} className={`mt-1 w-full px-4 py-2.5 rounded-[12px] border text-[13px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}><optgroup label="Deck Department">{RANKS.filter(r=>r.dept==='Deck').map(r=><option key={r.label} value={r.label}>{r.icon} {r.label}</option>)}</optgroup><optgroup label="Engine Department">{RANKS.filter(r=>r.dept==='Engine').map(r=><option key={r.label} value={r.label}>{r.icon} {r.label}</option>)}</optgroup><optgroup label="Catering / Galley">{RANKS.filter(r=>r.dept==='Catering').map(r=><option key={r.label} value={r.label}>{r.icon} {r.label}</option>)}</optgroup></select></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] uppercase font-semibold opacity-70">Vessel Name</label><input value={vesselInfo.name} onChange={e=>setVesselInfo({...vesselInfo,name:e.target.value})} placeholder="MV SEATIME" className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[14px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
                <div><label className="text-[11px] uppercase font-semibold opacity-70">👨‍✈️ Master's Name</label><input value={vesselInfo.masterName} onChange={e=>setVesselInfo({...vesselInfo,masterName:e.target.value})} placeholder="Capt. John Smith" className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] font-bold ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] uppercase font-semibold opacity-70">Vessel Type</label><select value={vesselInfo.type} onChange={e=>setVesselInfo({...vesselInfo,type:e.target.value})} className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}>{VESSEL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="text-[11px] uppercase font-semibold opacity-70">Flag Registry</label><select value={vesselInfo.flag} onChange={e=>setVesselInfo({...vesselInfo,flag:e.target.value})} className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`}>{FLAG_REGISTRIES.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
              </div>
              <div><label className="text-[11px] uppercase font-semibold opacity-70">IMO Number</label><input value={vesselInfo.imo} onChange={e=>setVesselInfo({...vesselInfo,imo:e.target.value})} placeholder="IMO 9734412" className={`mt-2 w-full px-4 py-3 rounded-[12px] border text-[13px] font-mono ${isDark?'bg-[#0f172a] border-white/10 text-white':'bg-slate-50 border-slate-200'}`} /></div>
            </div>
            <div className={`sticky bottom-0 border-t px-6 py-4 flex justify-end gap-2 ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
              <button onClick={()=>setShowVesselModal(false)} className="px-5 py-2.5 rounded-full border text-[12px] font-semibold">Cancel</button>
              <button onClick={()=>setShowVesselModal(false)} className="px-6 py-2.5 rounded-full bg-[#f97316] text-white text-[12px] font-bold">Save</button>
            </div>
          </div>
        </div>
      )}

      {selectedISO && editing && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={()=>{setSelectedISO(null);setEditing(null);}} />
          <div className={`relative w-full md:max-w-[760px] max-h-[92vh] md:max-h-[86vh] rounded-t-[22px] md:rounded-[22px] shadow-2xl border flex flex-col overflow-hidden ${isDark?'bg-[#121c33] border-white/10':'bg-white border-slate-200'}`}>
            <div className={`text-white px-7 py-5 flex items-start justify-between border-b ${isDark?'bg-[#0f172a] border-white/10':'bg-[#0f172a] border-white/10'}`}>
              <div>
                <div className="text-[11px] uppercase opacity-60">Log Day {holidaysSet.has(editing.date)&&<span className="bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">Holiday</span>}</div>
                <div className="text-[18px] font-bold mt-1">{parseISO(editing.date).toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                <div className="flex gap-2 mt-3">
                  <select value={editing.location} onChange={e=>setEditing({...editing,location:e.target.value as any})} className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-[12px] text-white"><option className="text-black" value="At Sea">At Sea</option><option className="text-black" value="At Port">At Port</option></select>
                  <select value={editing.duty} onChange={e=>setEditing({...editing,duty:e.target.value as any})} className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-[12px] text-white"><option className="text-black" value="Regular Work">Regular Work</option><option className="text-black" value="Watch Duty">Watch Duty</option><option className="text-black" value="Standby / Extra">Standby / Extra</option></select>
                  <select value={editing.watchSlot} onChange={e=>setEditing({...editing,watchSlot:e.target.value})} className="bg-[#f97316] text-white rounded-full px-3 py-1.5 text-[12px] font-semibold max-w-[180px]">{WATCH_SLOTS.map(s=><option key={s} value={s} className="text-black">{s}</option>)}</select>
                </div>
              </div>
              <button onClick={()=>{setSelectedISO(null);setEditing(null);}} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">✕</button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="px-7 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BREAKDOWN_FIELDS.map(f=>{
                    const val=editing.breakdown[f.key]||0;
                    return (
                      <div key={f.key} className={`border rounded-[16px] p-3 flex flex-col justify-between ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold flex items-center gap-1.5 truncate"><span>{f.icon}</span><span className="truncate">{f.label}</span></span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${val>0?'bg-[#f97316] text-white':'bg-black/10 opacity-60'}`}>{val.toFixed(1)}h</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 bg-black/5 dark:bg-white/5 rounded-full px-2 py-1.5">
                          <button onClick={()=>updateBreakdown(f.key,-0.5)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0 transition active:scale-95 ${isDark?'bg-white/10 hover:bg-white/20 text-white':'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm'}`}>−</button>
                          <input type="number" step="0.5" value={val} onChange={e=>setBreakdownValue(f.key,parseFloat(e.target.value))} className={`flex-1 bg-transparent text-center font-bold text-[18px] outline-none min-w-0 ${isDark?'text-white':'text-slate-900'}`} />
                          <button onClick={()=>updateBreakdown(f.key,0.5)} className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center text-[16px] font-bold shrink-0 shadow-md hover:bg-[#ea6d12] transition active:scale-95">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`border rounded-[14px] p-4 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                    <div className="text-[11px] uppercase opacity-60">Port & Times (True 24H)</div>
                    <div className="mt-3"><label className="text-[10px] opacity-60">Port Name</label><input value={editing.portName} onChange={e=>setEditing({...editing,portName:e.target.value})} placeholder="Manila, PH" className={`mt-1 w-full border rounded-full px-4 py-2 text-[13px] ${isDark?'bg-white/5 border-white/10 text-white':'bg-white border-slate-200'}`} /></div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={`border rounded-[12px] p-3 ${isDark?'bg-white/[0.03] border-white/10':'bg-white border-slate-200'}`}><label className="text-[10px] uppercase font-semibold opacity-60 flex items-center gap-1">🚢 Arrival Time <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full text-[8px]">24H</span></label><div className="mt-2"><Time24Input value={editing.arrivalTime} onChange={v=>setEditing({...editing,arrivalTime:v})} isDark={isDark} /></div><div className="mt-2 flex gap-1"><button onClick={()=>setEditing({...editing,arrivalTime:format24H_HM(new Date())})} className={`text-[10px] px-2 py-1 rounded-full ${isDark?'bg-white text-black':'bg-slate-900 text-white'}`}>Now {format24H_HM(new Date())}H</button><button onClick={()=>setEditing({...editing,arrivalTime:''})} className={`text-[10px] border px-2 py-1 rounded-full ${isDark?'bg-white/10 border-white/20':'bg-slate-100 border-slate-200'}`}>Clear</button></div></div>
                      <div className={`border rounded-[12px] p-3 ${isDark?'bg-white/[0.03] border-white/10':'bg-white border-slate-200'}`}><label className="text-[10px] uppercase font-semibold opacity-60 flex items-center gap-1">🛳️ Departure Time <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-white/10">24H</span></label><div className="mt-2"><Time24Input value={editing.departureTime} onChange={v=>setEditing({...editing,departureTime:v})} isDark={isDark} /></div><div className="mt-2 flex gap-1"><button onClick={()=>setEditing({...editing,departureTime:format24H_HM(new Date())})} className={`text-[10px] px-2 py-1 rounded-full ${isDark?'bg-white text-black':'bg-slate-900 text-white'}`}>Now {format24H_HM(new Date())}H</button><button onClick={()=>setEditing({...editing,departureTime:''})} className={`text-[10px] border px-2 py-1 rounded-full ${isDark?'bg-white/10 border-white/20':'bg-slate-100 border-slate-200'}`}>Clear</button></div></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`border rounded-[14px] p-4 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[11px] uppercase opacity-60">Day Summary (True 24H)</div>
                      <div className="mt-2 flex items-baseline gap-2"><span className="text-[28px] font-bold">{liveTotal.toFixed(1)}h</span><span className="text-[12px] opacity-60">work / {liveRest.toFixed(1)}h rest</span></div>
                      {liveOTPreview&&<div className={`mt-2 text-[11px] px-3 py-2 rounded-full border ${liveOTPreview.multiplier===2?'bg-red-500/20 text-red-400 border-red-500/30':liveOTPreview.multiplier>1?'bg-orange-500/20 text-orange-400 border-orange-500/30':'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>{liveOTPreview.type} → {liveOTPreview.pay.toFixed(1)}h pay</div>}
                    </div>
                    <div className={`border rounded-[14px] p-4 ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
                      <label className="text-[10px] uppercase opacity-60">Notes</label><textarea value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})} placeholder="Cargo operation, mooring, etc." className={`mt-2 w-full border rounded-[12px] px-3 py-2 text-[12px] min-h-[60px] ${isDark?'bg-white/5 border-white/10 text-white':'bg-white border-slate-200'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`border-t px-7 py-4 flex items-center justify-between ${isDark?'bg-[#0f172a] border-white/10':'bg-slate-50 border-slate-200'}`}>
              <button onClick={handleDelete} className="text-[11px] text-red-400 border border-red-500/30 rounded-full px-4 py-2">Delete Entry</button>
              <div className="flex gap-2">
                <button onClick={()=>{setSelectedISO(null);setEditing(null);}} className={`px-5 py-2.5 rounded-full border text-[12px] ${isDark?'border-white/20':'border-slate-200'}`}>Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-full bg-[#f97316] text-white text-[12px] font-bold">Save {liveTotal.toFixed(1)}h • {liveRest.toFixed(1)}h rest</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
