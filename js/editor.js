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

/* ---------- LOAD JSON ---------- */

fetch("data/bulletin.json")
  .then(r => {
    if (!r.ok) throw new Error("HTTP error! status: " + r.status);
    return r.json();
  })
  .then(json => {
    data = json;

    if (!data.screens || !Array.isArray(data.screens) || data.screens.length === 0) {
      data.screens = [{ bands: [] }];
    }

    if (!data.macros) {
      data.macros = {
        date: dateFormatField.value || "%Y-%m-%d",
        time: timeFormatField.value || "%H:%M:%S",
        datetime: "%Y-%m-%d %H:%M:%S"
      };
    } else {
      dateFormatField.value = data.macros.date || "%Y-%m-%d";
      timeFormatField.value = data.macros.time || "%H:%M:%S";
    }

    if (!data.ticker) {
      data.ticker = { text: "", speed: 40 };
    }

    tickerTextField.value = data.ticker.text || "";
    tickerSpeedField.value = data.ticker.speed || 40;

    renderScreenList();
    render();

    if (data.screens[0]?.bands?.length) {
      loadBand();
    }
  })
  .catch(err => {
    console.error("Failed to load bulletin.json:", err);
    screenEl.innerHTML =
      '<div style="color:#D65108;padding:20px;text-align:center;">' +
      "Error loading bulletin data: " + err.message +
      "</div>";
  });

/* ---------- SCREEN LIST ---------- */

function renderScreenList() {
  listEl.innerHTML = "";

  data.screens.forEach((_, i) => {
    const li = document.createElement("li");
    li.className = "screen-item" + (i === currentScreen ? " selected" : "");

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "screen-select";
    selectButton.textContent = "Screen " + (i + 1);

    selectButton.onclick = () => {
      currentScreen = i;
      currentBand = 0;
      renderScreenList();
      render();
      loadBand();
    };

    const actions = document.createElement("div");
    actions.className = "screen-actions";

    const upButton = document.createElement("button");
    upButton.type = "button";
    upButton.textContent = "⬆";
    upButton.title = "Move screen up";
    upButton.disabled = i === 0;
    upButton.onclick = event => {
      event.stopPropagation();
      moveScreenUp(i);
    };

    const downButton = document.createElement("button");
    downButton.type = "button";
    downButton.textContent = "⬇";
    downButton.title = "Move screen down";
    downButton.disabled = i === data.screens.length - 1;
    downButton.onclick = event => {
      event.stopPropagation();
      moveScreenDown(i);
    };

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-screen";
    deleteButton.textContent = "✕";
    deleteButton.title = "Delete screen";
    deleteButton.disabled = data.screens.length <= 1;
    deleteButton.onclick = event => {
      event.stopPropagation();
      deleteScreen(i);
    };

    actions.appendChild(upButton);
    actions.appendChild(downButton);
    actions.appendChild(deleteButton);

    li.appendChild(selectButton);
    li.appendChild(actions);
    listEl.appendChild(li);
  });
}

function moveScreenUp(index) {
  if (index <= 0) return;

  [data.screens[index - 1], data.screens[index]] =
    [data.screens[index], data.screens[index - 1]];

  if (currentScreen === index) {
    currentScreen = index - 1;
  } else if (currentScreen === index - 1) {
    currentScreen = index;
  }

  renderScreenList();
  render();
  loadBand();
}

function moveScreenDown(index) {
  if (index >= data.screens.length - 1) return;

  [data.screens[index + 1], data.screens[index]] =
    [data.screens[index], data.screens[index + 1]];

  if (currentScreen === index) {
    currentScreen = index + 1;
  } else if (currentScreen === index + 1) {
    currentScreen = index;
  }

  renderScreenList();
  render();
  loadBand();
}

function deleteScreen(index) {
  if (data.screens.length <= 1) return;

  if (!confirm("Delete Screen " + (index + 1) + "?")) return;

  data.screens.splice(index, 1);

  if (currentScreen > index) {
    currentScreen--;
  } else if (currentScreen === index) {
    currentScreen = Math.min(currentScreen, data.screens.length - 1);
    currentBand = 0;
  }

  renderScreenList();
  render();
  loadBand();
}

/* ---------- MAIN RENDER ---------- */

function render() {
  screenEl.innerHTML = `
    <div id="bands"></div>
    <div id="ticker">
      <div id="ticker-text"></div>
    </div>
  `;

  const bandsEl = screenEl.querySelector("#bands");
  screenEl.className = "aspect-4-3";

  if (scanlines) {
    screenEl.classList.add("scanlines");
  }

  const screen = data.screens[currentScreen];

  if (screen && screen.bands) {
    screen.bands.forEach((band, i) => {
      const div = document.createElement("div");

      div.className =
        "band " +
        (band.align || "center") +
        " font-" +
        (band.fontSize || "medium");

      if (band.blink) {
        div.classList.add("blink");
      }

      div.style.backgroundColor = band.bgColor || "transparent";
      div.style.color = band.textColor || "#ffffff";
      div.style.height = `${band.height || 100}px`;

      div.textContent = resolveMacros(band.text || "");

      div.onclick = () => {
        currentBand = i;
        loadBand();
      };

      bandsEl.appendChild(div);
    });
  }

  const tickerTextEl = document.getElementById("ticker-text");
  tickerTextEl.textContent = data.ticker?.text || "";
  startEditorTicker();
}

/* ---------- BAND EDITOR ---------- */

function loadBand() {
  const band = data.screens[currentScreen]?.bands?.[currentBand];

  if (!band) {
    textField.value = "";
    heightField.value = 80;
    bgField.value = "#000000";
    fgField.value = "#ffffff";
    sizeField.value = "medium";
    alignField.value = "center";
    blinkField.checked = false;
    return;
  }

  textField.value = band.text || "";
  heightField.value = band.height || 80;
  bgField.value = band.bgColor || "#000000";
  fgField.value = band.textColor || "#ffffff";
  sizeField.value = band.fontSize || "medium";
  alignField.value = band.align || "center";
  blinkField.checked = band.blink || false;
}

bandForm.onsubmit = e => {
  e.preventDefault();

  const band = data.screens[currentScreen]?.bands?.[currentBand];
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

[textField, heightField, bgField, fgField, sizeField, alignField, blinkField]
  .forEach(el => {
    el.addEventListener("input", () => bandForm.requestSubmit());
  });

/* ---------- MACROS ---------- */

[dateFormatField, timeFormatField].forEach(el => {
  el.addEventListener("input", () => {
    if (!data.macros) data.macros = {};

    data.macros.date = dateFormatField.value || "%Y-%m-%d";
    data.macros.time = timeFormatField.value || "%H:%M:%S";
    data.macros.datetime =
      data.macros.datetime || "%Y-%m-%d %H:%M:%S";

    render();
  });
});

/* ---------- TICKER ---------- */

[tickerTextField, tickerSpeedField].forEach(el => {
  el.addEventListener("input", () => {
    data.ticker.text = tickerTextField.value;
    data.ticker.speed = Number(tickerSpeedField.value) || 40;
    render();
  });
});

/* ---------- MACRO RESOLUTION ---------- */

function resolveMacros(text) {
  if (typeof text !== "string") return text;

  const d = new Date();
  const macros = data.macros || {};
  const format = fmt => (fmt ? formatDate(fmt, d) : "");

  return text
    .replaceAll("{space}", " ")
    .replaceAll("{tab}", "   ")
    .replaceAll("{linef}", "\n")
    .replaceAll("{date}", format(macros.date))
    .replaceAll("{time}", format(macros.time))
    .replaceAll("{datetime}", format(macros.datetime));
}

function formatDate(fmt, d) {
  const pad = n => String(n).padStart(2, "0");

  return fmt
    .replace(/%Y/g, d.getFullYear())
    .replace(/%m/g, pad(d.getMonth() + 1))
    .replace(/%d/g, pad(d.getDate()))
    .replace(/%H/g, pad(d.getHours()))
    .replace(/%M/g, pad(d.getMinutes()))
    .replace(/%S/g, pad(d.getSeconds()));
}

/* ---------- TICKER ANIMATION ---------- */

let tickerX = 0;
let tickerRAF = null;

function startEditorTicker() {
  if (tickerRAF) {
    cancelAnimationFrame(tickerRAF);
  }

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

/* ---------- CONTROLS ---------- */

document.getElementById("addScreen").onclick = () => {
  data.screens.push({ bands: [] });
  currentScreen = data.screens.length - 1;
  currentBand = 0;
  renderScreenList();
  render();
  loadBand();
};

document.getElementById("saveJson").onclick = () => {
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
    .then(r => {
      if (!r.ok) throw new Error("HTTP error! status: " + r.status);
      return r.text();
    })
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

  [bands[currentBand - 1], bands[currentBand]] =
    [bands[currentBand], bands[currentBand - 1]];

  currentBand--;
  render();
  loadBand();
};

document.getElementById("moveDown").onclick = () => {
  const bands = data.screens[currentScreen].bands;

  if (currentBand >= bands.length - 1) return;

  [bands[currentBand + 1], bands[currentBand]] =
    [bands[currentBand], bands[currentBand + 1]];

  currentBand++;
  render();
  loadBand();
};
