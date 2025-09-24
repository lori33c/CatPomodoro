// App.jsx
import { useEffect, useState } from "react";
import "./index.css";
import Timer from "./components/Timer";

const FALLBACK_CATS = ["/cats/Xivu1.jpg", "/cats/Dio1.jpg"]; // local fallback

export default function App() {
  function onTimerFinish() {
    // keep your reward logic here later if you want
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 36 }}>
      {/* Outer 2-column grid */}
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
        {/* LEFT: Tall timer window fills entire column */}
        <div
          className="card"
          style={{ border: "2px solid #b77", borderRadius: 16, overflow: "auto", height: "70%" }}
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
            <h1 className="pixel" style={{ fontSize: 20 }}>Stay_Focused.exe</h1>
          </div>
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 24, margin: "8px 0 12px", textAlign: "center" }}>
              Start the timer to make sure Xivu and Dio get fed! 
              AHHHHH!
            </p>
            <Timer onFinish={onTimerFinish} />
          </div>
        </div>

        {/* RIGHT COLUMN: split vertically into two equal rows (each ~50%) */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 }}>
          {/* Top: Cats preview with side buttons */}
          <div
            className="card"
            style={{ border: "2px solid #b77", borderRadius: 16, overflow: "hidden", position: "relative" }}
          >
            <div style={{ borderBottom: "2px solid #b77", padding: "10px 12px" }}>
              <h2 className="pixel" style={{ fontSize: 18 }}>Cats.png</h2>
            </div>
            <div style={{ padding: 12, height: "calc(100% - 40px)", display: "flex", flexDirection: "column" }}>
              <CatViewer fallbackList={FALLBACK_CATS} />
            </div>
          </div>

          {/* Bottom: placeholder (add anything later) */}
          <div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Side-button image viewer */
function CatViewer({ fallbackList = [] }) {
  const [cats, setCats] = useState(fallbackList);
  const [idx, setIdx] = useState(0);

  // Try loading from your API; if it fails, fall back to local list
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/cats");
        if (!res.ok) throw new Error("bad status");
        const data = await res.json(); // expect: ["url1","url2", ...]
        if (Array.isArray(data) && data.length && alive) {
          setCats(data);
          setIdx(0);
        }
      } catch {
        // ignore, stay on fallback
      }
    })();
    return () => { alive = false; };
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

  // keyboard arrows
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cats]);

  return (
    <div style={{ position: "relative", width: "100%", flex: "1 1 auto", marginBottom: 16 }}>
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

      {/* Left button */}
      <button
        onClick={prev}
        aria-label="Previous cat"
        style={navBtnStyle("left")}
      >
        ◀
      </button>

      {/* Right button */}
      <button
        onClick={next}
        aria-label="Next cat"
        style={navBtnStyle("right")}
      >
        ▶
      </button>

      {/* Counter pill */}
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
