// App.jsx
import { useEffect, useState, useRef } from "react";
import "./index.css";
import Timer from "./components/Timer";

const FALLBACK_CATS = ["/cats/Xivu1.jpg", "/cats/Dio1.jpg"];
const CATS = FALLBACK_CATS; // swap this with your API list if you want

// LocalStorage hook (if you don't already have one defined elsewhere)
function useLocal(key, initial) {
  const [v, setV] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key, v]);
  return [v, setV];
}

export default function App() {
  const [reward, setReward] = useState(null);
  const [foodUnlocked, setFoodUnlocked] = useLocal("sf_food", []);
  const [catUnlocked, setCatUnlocked] = useLocal("sf_cats", []);
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);

  // preload audio once
  useEffect(() => {
    const a = new Audio("/sounds/done.mp3"); // file in public/sounds/
    a.preload = "auto";
    a.volume = 0.9;
    audioRef.current = a;
  }, []);

  // when timer ends
  function onTimerFinish() {
  // reward logic...
  const a = audioRef.current;
  if (!a || muted) return;

  let count = 0;
  const maxRepeats = 5; // how many times to repeat

  // remove old listeners first
  a.onended = null;

  // define play cycle
  const playCycle = () => {
    if (count < maxRepeats) {
      a.currentTime = 0;
      a.play().catch(() => {});
      count++;
    } else {
      a.onended = null; // cleanup
    }
  };

  // hook up ended → play again
  a.onended = playCycle;

  // start first play
  playCycle();
}


  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 36,
      }}
    >
      <div
        className="grid"
        style={{
          width: "min(1100px,100%)",
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* LEFT: Timer */}
        <div
          className="card"
          style={{
            border: "2px solid #b77",
            borderRadius: 16,
            overflow: "auto",
            height: "70%",
          }}
        >
          <div
            style={{
              borderBottom: "5px solid #b77",
              padding: "10px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1 className="pixel" style={{ fontSize: 20 }}>
              Stay_Focused.exe
            </h1>

            {/* mute toggle */}
            <button
              className="btn pixel"
              onClick={() => setMuted((m) => !m)}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                background: muted ? "var(--mint)" : "var(--blue)",
                color: muted ? "black" : "white",
              }}
              aria-pressed={muted}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇 Mute" : "🔔 Sound"}
            </button>
          </div>
          <div style={{ padding: 16 }}>
            <p
              style={{
                fontSize: 24,
                margin: "8px 0 12px",
                textAlign: "center",
              }}
            >
              Start the timer to make sure Xivu and Dio get fed! AHHHHH!
            </p>
            <Timer onFinish={onTimerFinish} />
          </div>
        </div>

        {/* RIGHT: Cat viewer + placeholder */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 }}>
          <div
            className="card"
            style={{
              border: "2px solid #b77",
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ borderBottom: "2px solid #b77", padding: "10px 12px" }}>
              <h2 className="pixel" style={{ fontSize: 18 }}>
                Cats.png
              </h2>
            </div>
            <div
              style={{
                padding: 12,
                height: "calc(100% - 40px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CatViewer fallbackList={FALLBACK_CATS} />
            </div>
          </div>

          {/* bottom placeholder */}
          <div></div>
        </div>
      </div>
    </div>
  );
}

/** Side-button image viewer */
function CatViewer({ fallbackList = [] }) {
  const [cats, setCats] = useState(fallbackList);
  const [idx, setIdx] = useState(0);

  // load from API or fallback
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/cats");
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (Array.isArray(data) && data.length && alive) {
          setCats(data);
          setIdx(0);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const hasCats = cats.length > 0;
  const current = hasCats ? cats[idx] : null;

  function next() {
    if (!hasCats) return;
    setIdx((i) => (i + 1) % cats.length);
  }
  function prev() {
    if (!hasCats) return;
    setIdx((i) => (i - 1 + cats.length) % cats.length);
  }

  // keyboard arrow support
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cats]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        flex: "1 1 auto",
        marginBottom: 16,
      }}
    >
      {/* Image */}
      <img
        src={current ?? ""}
        alt="cat"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          aspectRatio: "16/9",
          border: "2px solid #b77",
          borderRadius: 16,
          display: current ? "block" : "none",
        }}
      />
      {!current && (
        <div
          style={{
            height: "100%",
            aspectRatio: "16/9",
            border: "2px solid #b77",
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          No cats found
        </div>
      )}

      {/* Nav buttons */}
      <button onClick={prev} aria-label="Previous cat" style={navBtnStyle("left")}>
        ◀
      </button>
      <button onClick={next} aria-label="Next cat" style={navBtnStyle("right")}>
        ▶
      </button>

      {/* Counter */}
      {hasCats && (
        <div
          className="pixel"
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            padding: "4px 8px",
            borderRadius: 10,
            border: "1px solid #b77",
            background: "rgba(255,255,255,.8)",
            fontSize: 11,
          }}
        >
          {idx + 1}/{cats.length}
        </div>
      )}
    </div>
  );
}

function navBtnStyle(side) {
  const base = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    padding: 8,
    borderRadius: 12,
    border: "1px solid #b77",
    background: "rgba(255,255,255,.85)",
    backdropFilter: "blur(2px)",
    cursor: "pointer",
    lineHeight: 1,
    fontSize: 16,
    width: 36,
    height: 36,
    display: "grid",
    placeItems: "center",
    userSelect: "none",
  };
  return {
    ...base,
    [side]: 10,
  };
}
