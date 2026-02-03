# Community Bulletin Board TV

A lightweight, retro-inspired **Community Bulletin Board system** that recreates the look and feel of classic 1990s cable-access TV displays — blinking text, stacked bands, and scrolling tickers — all editable through a web browser.

Built with plain HTML, CSS, JavaScript, and PHP. No frameworks. No database.
<img width="642" height="473" alt="Screenshot 2026-02-03 083548" src="https://github.com/user-attachments/assets/0b34ef26-b0d3-416f-ad5a-1b2915091dc7" />


## 📺 Screenshots

> Community Bulletin TV is designed to feel like a classic cable-access bulletin board — bold text, simple layouts, and continuous rotation.

### Welcome Screen
![Welcome Screen](screenshots/screen-welcome.png)

### Programming / Announcements
![Programming Screen](screenshots/screen-programming.png)

### Upcoming Features
![Coming Soon Screen](screenshots/screen-coming-soon.png)

---

## 📺 What This Is

This project displays rotating “screens,” each made up of horizontal text bands and an optional scrolling ticker. It’s designed for:

- Community centers
- Local cable channels
- Lobby or signage displays
- Art projects and installations
- Retro / lo-fi broadcast systems

Everything is edited visually via a browser-based editor and saved to a simple JSON file.

---

## ✨ Features

- Authentic CRT-style bulletin board layout
- Multiple rotating screens
- Configurable screen duration
- Stacked text bands with:
  - Color, size, alignment
  - Optional blinking
- Smooth scrolling ticker
- Live date & time macros
- Web-based editor with live preview
- JSON storage (no database required)
- Runs well on low-power or older hardware

---

## 🗂 Project Structure

```bash
community-bulletin/
├── play.html # Public display page
├── editor.html # Editor interface
├── save.php # Saves bulletin data
├── data/
│ └── bulletin.json # All content & settings
├── js/
│ ├── bulletin.js # Display logic
│ └── editor.js # Editor logic
├── css/
│ └── bulletin.css # Shared styles
└── README.md
```

## 🚀 Getting Started

### Requirements

- Web server (Apache or NGINX)
- PHP enabled
- No database

### Installation

1. Copy or clone the project into your web root:
   ```bash
   /var/www/html/community-bulletin/
2. Ensure PHP can write to the data directory:
  ```bash
    chown -R www-data:www-data data
    chmod 664 data/bulletin.json
```
3. Open in your browser:

- Display:
```bash
/community-bulletin/play.html
```
- Editor:
```bash
/community-bulletin/editor.html
```

🕒 Macros

Macros are placeholders in band or ticker text that update automatically.

Date & Time Macros

Defined in bulletin.json:
```JSON
"macros": {
  "date": "%Y-%m-%d",
  "time": "%H:%M:%S",
  "datetime": "%Y-%m-%d %H:%M:%S"
}
```
Usage:
```css
Date: {date}   Time: {time}
```

Macros update live on the display page.

Spacing Macros (Built-In)

These do not need to be configured:
| Macro     | Result       |
| --------- | ------------ |
| `{space}` | Single space |
| `{tab}`   | 3 spaces     |
| `{linef}` | Line break   |

Example:
```css
Date:{tab}{date}{linef}Time:{tab}{time}
```

⏱ Screen Rotation

Screen timing is controlled globally:
```JSON
"settings": {
  "screenDuration": 10
}
```
- Duration is in seconds
- Screens rotate automatically on the display page

  📜 Ticker

Ticker settings:
```json
"ticker": {
  "speed": 40,
  "text": "COMMUNITY EVENTS • LOCAL ANNOUNCEMENTS • WEATHER ALERTS"
}
```

- Speed is pixels per second
- Ticker text supports macros



  🛠 Editor Notes
  
<img width="956" height="453" alt="Screenshot 2026-02-03 083919" src="https://github.com/user-attachments/assets/2629ab49-0030-4c3e-aab3-f382ef67066a" />


- Editor includes a live preview
- Changes are saved to bulletin.json
- Preview resolves macros for readability
- Display page updates macros in real time



🔐 Security Notes

This project assumes a trusted environment.

If exposed publicly:

- Restrict access to editor.html
- Protect save.php
- Consider HTTP authentication or IP filtering

🧠 Design Philosophy

- Simple over clever
- Files instead of databases
- Predictable rendering
- Hardware-friendly
- Nostalgia with purpose

🧭 Roadmap Ideas

- Per-screen ticker overrides
- Custom macro definitions
- Transition effects
- Editor UI enhancements
- Authentication
- Preset import/export

📄 License

GPL2 License
Free to use, modify, and redistribute.

If you run this on a cable channel in 1996, that’s on you 😉
