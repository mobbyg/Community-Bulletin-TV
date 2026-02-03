let data;
let currentScreen = 0;
let currentBand = 0;
let scanlines = false;
const screenEl = document.getElementById("screen");
const listEl = document.getElementById("screenList");
const bandForm = document.getElementById("bandForm");
const textField = document.getElementById("text");
const heightField = document.getElementById("height");
const bgField = document.getElementById("bg");
const fgField = document.getElementById("fg");
const sizeField = document.getElementById("size");
const alignField = document.getElementById("align");
const blinkField = document.getElementById("blink");
const dateFormatField = document.getElementById("dateFormat");
const timeFormatField = document.getElementById("timeFormat");
const tickerTextField = document.getElementById("tickerText");
const tickerSpeedField = document.getElementById("tickerSpeed");


// Load JSON
fetch("data/bulletin.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    // Ensure macros object exists
    if (!data.macros) {
      data.macros = {
        date: dateFormatField.value || "%Y-%m-%d",
        time: timeFormatField.value || "%H:%M:%S",
        datetime: "%Y-%m-%d %H:%M:%S"
      };
    } else {
      // Sync inputs with loaded values
      dateFormatField.value = data.macros.date || "%Y-%m-%d";
      timeFormatField.value = data.macros.time || "%H:%M:%S";
    }

//  INSERTED BLOCK STARTS HERE
    if (!data.ticker) {
      data.ticker = { text: "", speed: 40 };
    }

    tickerTextField.value = data.ticker.text || "";
    tickerSpeedField.value = data.ticker.speed || 40;
    // INSERTED BLOCK ENDS HERE

    renderScreenList();
    render();
    if (data.screens[0]?.bands?.length) {
      loadBand();
    }
  });

// Render screen list
function renderScreenList() {
  listEl.innerHTML = "";
  data.screens.forEach((_, i) => {
    const li = document.createElement("li");
    li.textContent = "Screen " + (i + 1);
    li.onclick = () => {
      currentScreen = i;
      currentBand = 0;
      render();
      loadBand();
    };
    listEl.appendChild(li);
  });
}

// Main render function with macro resolution in preview
function render() {
  screenEl.innerHTML = `
    <div id="bands"></div>
    <div id="ticker">
      <div id="ticker-text"></div>
    </div>
  `;
  const bandsEl = screenEl.querySelector("#bands");
  screenEl.className = "aspect-4-3";
  if (scanlines) screenEl.classList.add("scanlines");

  const screen = data.screens[currentScreen];
  if (screen && screen.bands) {
    screen.bands.forEach((band, i) => {
      const div = document.createElement("div");
      div.className = `band ${band.align || "center"} font-${band.fontSize || "medium"}`;
      if (band.blink) div.classList.add("blink");
      div.style.backgroundColor = band.bgColor || "transparent";
      div.style.color = band.textColor || "#ffffff";
      div.style.height = `${band.height || 100}px`;

      // Resolve macros for preview (shows real date/time)
      const resolvedText = resolveMacros(band.text || "");
      div.textContent = resolvedText;

      div.onclick = () => {
        currentBand = i;
        loadBand();
      };
      bandsEl.appendChild(div);
    });
  }

  // Ticker preview (no macros needed here usually)
  const tickerTextEl = document.getElementById("ticker-text");
  tickerTextEl.textContent = data.ticker?.text || "";
  startEditorTicker();
}

// Load selected band into form
function loadBand() {
  const band = data.screens[currentScreen]?.bands[currentBand];
  if (!band) return;
  textField.value = band.text || "";
  heightField.value = band.height || 80;
  bgField.value = band.bgColor || "#000000";
  fgField.value = band.textColor || "#ffffff";
  sizeField.value = band.fontSize || "medium";
  alignField.value = band.align || "center";
  blinkField.checked = band.blink || false;
}

// Save band changes and re-render
bandForm.onsubmit = e => {
  e.preventDefault();
  const band = data.screens[currentScreen]?.bands[currentBand];
  if (!band) return;
  band.text = textField.value;
  band.height = Number(heightField.value);
  band.bgColor = bgField.value;
  band.textColor = fgField.value;
  band.fontSize = sizeField.value;
  band.align = alignField.value;
  band.blink = blinkField.checked;
  render();
};

// Auto-save on any input change
[textField, heightField, bgField, fgField, sizeField, alignField, blinkField]
  .forEach(el => {
    el.addEventListener("input", () => bandForm.requestSubmit());
  });

// Update macros when format inputs change
[dateFormatField, timeFormatField].forEach(el => {
  el.addEventListener("input", () => {
    if (!data.macros) data.macros = {};
    data.macros.date = dateFormatField.value || "%Y-%m-%d";
    data.macros.time = timeFormatField.value || "%H:%M:%S";
    data.macros.datetime = data.macros.datetime || "%Y-%m-%d %H:%M:%S";
    render(); // Refresh preview to show updated formats
  });
});

// Update ticker when edited
[tickerTextField, tickerSpeedField].forEach(el => {
  el.addEventListener("input", () => {
    data.ticker.text = tickerTextField.value;
    data.ticker.speed = Number(tickerSpeedField.value) || 40;
    render(); // refresh preview
  });
});

// Auto-save macros when date/time format changes
[dateFormatField, timeFormatField].forEach(el => {
  el.addEventListener("change", () => {
    document.getElementById("saveJson").click();
  });
});

// Macro resolution (same as bulletin.js)
function resolveMacros(text) {
  if (typeof text !== "string") return text;

  const d = new Date();
  const macros = data.macros || {};
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
  return fmt
    .replace(/%Y/g, d.getFullYear())
    .replace(/%m/g, pad(d.getMonth() + 1))
    .replace(/%d/g, pad(d.getDate()))
    .replace(/%H/g, pad(d.getHours()))
    .replace(/%M/g, pad(d.getMinutes()))
    .replace(/%S/g, pad(d.getSeconds()));
}

// Ticker animation
let tickerX = 0;
let tickerRAF = null;
function startEditorTicker() {
  if (tickerRAF) cancelAnimationFrame(tickerRAF);
  const tickerTextEl = screenEl.querySelector("#ticker-text");
  if (!tickerTextEl) return;
  tickerX = screenEl.offsetWidth;
  function tick() {
    tickerX -= 1;
    if (tickerX < -tickerTextEl.offsetWidth) {
      tickerX = screenEl.offsetWidth;
    }
    tickerTextEl.style.transform = `translateX(${tickerX}px)`;
    tickerRAF = requestAnimationFrame(tick);
  }
  tick();
}

// Controls
document.getElementById("addScreen").onclick = () => {
  data.screens.push({ bands: [] });
  renderScreenList();
};

document.getElementById("saveJson").onclick = () => {
  // ALWAYS sync macros from inputs before saving
  data.macros = {
    date: dateFormatField.value || "%Y-%m-%d",
    time: timeFormatField.value || "%H:%M:%S",
    datetime: data.macros?.datetime || "%Y-%m-%d %H:%M:%S"
  };

  fetch("save.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data, null, 2)
  })
  .then(r => r.text())
  .then(() => alert("Saved to server"))
  .catch(err => alert("Save failed: " + err.message));
};

document.getElementById("toggleScanlines").onclick = () => {
  scanlines = !scanlines;
  render();
};

document.getElementById("addBand").onclick = () => {
  const screen = data.screens[currentScreen];
  screen.bands.push({
    text: "NEW MESSAGE",
    height: 80,
    bgColor: "#000000",
    textColor: "#00ff00",
    fontSize: "large",
    align: "center",
    blink: false
  });
  currentBand = screen.bands.length - 1;
  render();
  loadBand();
};

document.getElementById("moveUp").onclick = () => {
  const bands = data.screens[currentScreen].bands;
  if (currentBand <= 0) return;
  [bands[currentBand - 1], bands[currentBand]] = [bands[currentBand], bands[currentBand - 1]];
  currentBand--;
  render();
  loadBand();
};

document.getElementById("moveDown").onclick = () => {
  const bands = data.screens[currentScreen].bands;
  if (currentBand >= bands.length - 1) return;
  [bands[currentBand + 1], bands[currentBand]] = [bands[currentBand], bands[currentBand + 1]];
  currentBand++;
  render();
  loadBand();
};
