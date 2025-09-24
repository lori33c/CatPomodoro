import { useEffect, useMemo, useState } from "react";

const MODES = {
  focus25:{label:"Focus (25m)", seconds:25*60},
  break5: {label:"Short Break (5m)", seconds:5*60},
  break10:{label:"Long Break (10m)", seconds:10*60},
};

export default function Timer({ onFinish }){
  const [mode,setMode]=useState("focus25");
  const [seconds,setSeconds]=useState(MODES[mode].seconds);
  const [running,setRunning]=useState(false);

  useEffect(()=>{ if(!running) setSeconds(MODES[mode].seconds); },[mode, running]);

  useEffect(()=>{
    if(!running) return;
    if(seconds<=0){ setRunning(false); onFinish?.(); return; }
    const id=setInterval(()=>setSeconds(s=>s-1),1000);
    return ()=>clearInterval(id);
  },[running, seconds, onFinish]);

  const mmss = useMemo(()=>{
    const m=String(Math.floor(seconds/60)).padStart(2,"0");
    const s=String(seconds%60).padStart(2,"0");
    return `${m}:${s}`;
  },[seconds]);

  return (
    <div>
      {/* timer display */}
      <div style={{background:"#ecebecff", borderRadius:20, border:"5px solid #b77", padding:"40px 16px", textAlign:"center", marginBottom:12}}>
        <div style={{position:"relative", display:"inline-block"}}>
          <div className="pixel" style={{position:"absolute", left:6, top:6, opacity:.35, fontSize:64}}>{mmss}</div>
          <div className="pixel" style={{fontSize:64}}>{mmss}</div>
        </div>
      </div>

      {/* transport */}
      <div className="grid" style={{gridTemplateColumns:"repeat(3,1fr)", marginBottom:12}}>
        <button className="btn pixel" onClick={()=>setRunning(true)}>Start</button>
        <button className="btn pixel" onClick={()=>setRunning(false)}>Stop</button>
        <button className="btn pixel" onClick={()=>{setRunning(false); setSeconds(MODES[mode].seconds);}}>Reset</button>
      </div>

      {/* presets */}
      <div className="grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        {Object.entries(MODES).map(([k,v])=>(
          <button
            key={k}
            className="btn pixel"
            style={{background:k===mode?"var(--blue)":"var(--mint)"}}
            onClick={()=>setMode(k)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
