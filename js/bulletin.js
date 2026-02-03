let data;
let currentScreen = 0;
let aspect = "4:3";
let scanlinesEnabled = false;
let tickerRAF = null;
const screenEl = document.getElementById("screen");
let tickerTextEl; // Will be set after structure is created

/* ---------- LOAD DATA ---------- */
fetch("data/bulletin.json")
  .then(r => {
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return r.json();
  })
  .then(json => {
    data = json;
    aspect = data.settings?.aspectRatio || "4:3";

    // Set persistent structure ONCE (fixes ticker disappearing on rotation)
    screenEl.innerHTML = `
      <div id="bands"></div>
      <div id="ticker">
        <div id="ticker-text"></div>
      </div>
    `;

    // Cache the ticker element
    tickerTextEl = document.getElementById("ticker-text");

    setAspect();
    renderScreen();
    startRotation();
    startTicker();
    startMacroClock();
  })
  .catch(err => {
    console.error("Failed to load bulletin.json:", err);
    screenEl.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
      Error loading bulletin data: ${err.message}<br>
      Check console for details or your bulletin.json file.
    </div>`;
  });

/* ---------- ASPECT / SCALE ---------- */
function setAspect() {
  screenEl.className = "";
  screenEl.classList.add(aspect === "4:3" ? "aspect-4-3" : "aspect-16-9");
  scaleScreen();
}

function scaleScreen() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const baseWidth = aspect === "4:3" ? 640 : 1280;
  const baseHeight = aspect === "4:3" ? 480 : 720;
  const scale = Math.min(vw / baseWidth, vh / baseHeight);
  screenEl.style.transform = `scale(${scale})`;

  // Restart ticker to adjust to new dimensions
  startTicker();
}

window.addEventListener("resize", scaleScreen);

/* ---------- SCREEN RENDER ---------- */
function renderScreen() {
  const bandsEl = document.getElementById("bands");
  if (!bandsEl) return;

  bandsEl.innerHTML = ""; // Clear old bands only

  const screen = data?.screens?.[currentScreen];
  if (!screen || !Array.isArray(screen.bands)) return;

  screen.bands.forEach(band => {
    const div = document.createElement("div");
    div.className = `band ${band.align || "center"} font-${band.fontSize || "medium"}`;
    if (band.blink) div.classList.add("blink");

    div.style.backgroundColor = band.bgColor || "transparent";
    div.style.color = band.textColor || "#ffffff";
    div.style.height = `${band.height || 100}px`;

    const text = band.text || "";
    div.dataset.template = text;
    div.textContent = resolveMacros(text);

    bandsEl.appendChild(div);
  });
}

/* ---------- SCREEN ROTATION ---------- */
function startRotation() {
  setInterval(() => {
    currentScreen = (currentScreen + 1) % (data?.screens?.length || 1);
    renderScreen();
  }, (data?.settings?.screenDuration ||10) * 1000);
}

/* ---------- TICKER ---------- */
function startTicker() {
  if (!tickerTextEl) return;
  if (tickerRAF) cancelAnimationFrame(tickerRAF);

  const ticker = data?.ticker || {};
  const text = ticker.text || "";
  tickerTextEl.dataset.template = text;
  tickerTextEl.textContent = resolveMacros(text);

  let x = screenEl.offsetWidth;
  let lastTime = performance.now();
  const speed = ticker.speed || 40; // pixels per second (from your JSON)

  function tick(now) {
    const delta = (now - lastTime) / 1000; // time in seconds since last frame
    lastTime = now;

    x -= speed * delta;

    if (x < -tickerTextEl.offsetWidth) {
      x = screenEl.offsetWidth; // reset to right edge
    }

    tickerTextEl.style.transform = `translateX(${x}px)`;
    tickerRAF = requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ---------- MACROS (made safe for missing macros object) ---------- */
function resolveMacros(text) {
  if (typeof text !== "string") return text;

  const d = new Date();
  const macros = data?.macros || {};
  const format = (fmt) => fmt ? formatDate(fmt, d) : "";

  return text
    // spacing macros
    .replaceAll("{space}", " ")
    .replaceAll("{tab}", "   ")
    .replaceAll("{linef}", "\n")

    // date/time macros
    .replaceAll("{date}", format(macros.date))
    .replaceAll("{time}", format(macros.time))
    .replaceAll("{datetime}", format(macros.datetime));
}

function formatDate(fmt, d) {
  const pad = (n) => String(n).padStart(2, "0");

// Function to get the ordinal suffix of a number
  const getOrdinalSuffix = (n) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  return fmt
    .replace(/%Y/g, d.getFullYear())
    .replace(/%m/g, pad(d.getMonth() + 1))
    .replace(/%d/g, pad(d.getDate()))
    .replace(/%H/g, pad(d.getHours()))
    .replace(/%d/g, d.getDate()) // Day of month without padding
    .replace(/%M/g, pad(d.getMinutes()))
    .replace(/%S/g, pad(d.getSeconds()))
    .replace(/%a/g, d.toLocaleString('en-US', { weekday: 'short' })) // Abbreviated weekday
    .replace(/%b/g, d.toLocaleString('en-US', { month: 'short' })) // Abbreviated month
    .replace(/%e/g, d.getDate() + getOrdinalSuffix(d.getDate())); // Day with ordinal suffix;
}

/* ---------- MACRO CLOCK (updates time-sensitive elements every second) ---------- */
function startMacroClock() {
  setInterval(() => {
    document.querySelectorAll("[data-template]").forEach(el => {
      el.textContent = resolveMacros(el.dataset.template);
    });
  }, 1000);
}

/* ---------- CONTROLS (unchanged) ---------- */
document.getElementById("toggleAspect").onclick = () => {
  aspect = aspect === "4:3" ? "16:9" : "4:3";
  setAspect();
};

document.getElementById("fullscreen").onclick = () => {
  document.documentElement.requestFullscreen();
};

document.getElementById("toggleScanlines").onclick = () => {
  scanlinesEnabled = !scanlinesEnabled;
  screenEl.classList.toggle("scanlines", scanlinesEnabled);
};

document.addEventListener("fullscreenchange", () => {
  const controls = document.getElementById("controls");
  if (controls) {
    controls.style.display = document.fullscreenElement ? "none" : "block";
  }
});
