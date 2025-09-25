import { useEffect, useMemo, useState } from "react";

const MODES = {
  focus25:{label:"Focus (25m)", seconds:25*60},
  break5: {label:"Short Break (5m)", seconds:5*60},
  break10:{label:"Long Break (10m)", seconds:10*60},
};

export default function Timer({ onFinish }){
  const [mode,setMode]=useState("focus25");

  // Planned end timestamp when running; null when paused/stopped
  const [endTime,setEndTime]=useState(null);      // number | null (epoch ms)
  // Remaining seconds when paused/stopped
  const [remainingBase,setRemainingBase]=useState(MODES[mode].seconds);
  const [running,setRunning]=useState(false);

  // Heartbeat: updating this causes re-renders while running
  const [now, setNow] = useState(() => Date.now());

  // Reset remainingBase when mode changes and we're not running
  useEffect(()=>{
    if(!running){
      setRemainingBase(MODES[mode].seconds);
    }
  },[mode, running]);

  // Derived remaining time (in seconds)
  const remaining = useMemo(()=>{
    if(!running || !endTime) return remainingBase;
    const diff = Math.max(0, Math.round((endTime - now)/1000));
    return diff;
  },[running, endTime, remainingBase, now]);

  // Ticker to update `now` and detect finish
  useEffect(()=>{
    if(!running || !endTime) return;

    const intervalMs = document.visibilityState === "visible" ? 250 : 1000;
    const id = setInterval(()=>{
      setNow(Date.now());
    }, intervalMs);

    return ()=>clearInterval(id);
  },[running, endTime]);

  // Also catch finish immediately on refocus/visibility change
  useEffect(()=>{
    const check = () => setNow(Date.now());
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return ()=>{
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  },[]);

  // Finish side-effect: when remaining hits 0
  useEffect(()=>{
    if(running && endTime && remaining <= 0){
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running, endTime]);

  useEffect(() => {
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  const label = MODES[mode].label;

  if (running) {
    document.title = `${m}:${s} • ${label}`;
  } else {
    document.title = `Pomodoro Timer`;
  }

  // Cleanup: restore when component unmounts
  return () => {
    document.title = "Pomodoro Timer";
  };
}, [remaining, running, mode]);

  function start(){
    // Start from current remaining (supports resume)
    setEndTime(Date.now() + remaining * 1000);
    setRunning(true);
    setNow(Date.now());
  }

  function stop(){
    // Pause: capture remaining and clear endTime
    setRemainingBase(remaining);
    setEndTime(null);
    setRunning(false);
  }

  function reset(){
    setRunning(false);
    setEndTime(null);
    setRemainingBase(MODES[mode].seconds);
    setNow(Date.now());
  }

  function startFresh(){
    setRemainingBase(MODES[mode].seconds);
    // Important: setEndTime after updating base via callback
    const dur = MODES[mode].seconds;
    const t = Date.now() + dur * 1000;
    setEndTime(t);
    setRunning(true);
    setNow(Date.now());
  }

  function finish(){
    setRunning(false);
    setEndTime(null);
    setRemainingBase(0);
    onFinish?.();
  }

  const mmss = useMemo(()=>{
    const m=String(Math.floor(remaining/60)).padStart(2,"0");
    const s=String(remaining%60).padStart(2,"0");
    return `${m}:${s}`;
  },[remaining]);

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
        {!running
          ? <button className="btn pixel" onClick={start}>Start</button>
          : <button className="btn pixel" onClick={stop}>Stop</button>
        }
        <button className="btn pixel" onClick={reset}>Reset</button>
        <button className="btn pixel" onClick={startFresh}>Start Fresh</button>
      </div>

      {/* presets */}
      <div className="grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        {Object.entries(MODES).map(([k,v])=>(
          <button
            key={k}
            className="btn pixel"
            style={{background:k===mode?"var(--blue)":"var(--mint)"}}
            onClick={()=>{ if(!running){ setMode(k); } }}
            title={running ? "Stop or Reset to change mode" : ""}
            disabled={running && k!==mode}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
