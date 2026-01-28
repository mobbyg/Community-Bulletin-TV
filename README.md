# Community-Bulletins-TV
## A Community Access TV Channel Bulletin System Emulator

## Screenshots

### Main Interface
![Main Interface](https://via.placeholder.com/800x400?text=Main+Interface)

### Settings Panel
![Settings](https://via.placeholder.com/800x400?text=Settings+Panel)

### Mobile View
![Mobile](https://via.placeholder.com/400x600?text=Mobile+View)


## Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## About
<p>
Remeber those days when your local cable company had a channel dedicated to Community Bulletins? Community access TV in the 1990s featured a variety of local programming, including bulletin boards that provided information about community events, public announcements, and local news. These channels allowed residents to share information and engage with their community in a unique way. 
</p>

This emulator recreates the text for on screen announcements and notices. It uses a simple editor to create the screens and the "bands" that gave these systems their unique look. You can do all one color screen or have bright colors to emphesize something important. There is also a ticker that runs along the bottom for scrolling messages. 

<p>
<img width="2101" height="1059" alt="Screenshot 2026-01-27 at 11 28 00 PM" src="https://github.com/user-attachments/assets/6f59e05e-08f0-4a10-8e38-4e7ac3381935" />
</p>

The inspiration for this came from 2 different sources. <a href="https://github.com/shane-mason/FieldStation42">The Field Station 42 project by Shane Mason</a> and the <a href="https://github.com/netbymatt/ws4kp">WS4K+ project by Matt Walsh</a>. Both of these projects capture retro TV intheir own unique way. FS42, a cable box simulator that lets you create stations that stream and even a station scheduler and onscreen "Prevue Guide" channel. The WS4K+ captures that "Weather Channel" vibe, which I took a lot of cues from. After playing with them for a bit, I didn't know if there was a project that captured the Community Access vibe, so I decided to make this to incorporate into my own FS42 streaming cable box. If you're in for a penny, may as well be a pound, right?

I wanted to make this as simple as I can so there wasn't a lot of moving parts that needed to be configured. The goal is to clone, and just drop it in the folder and go with as little fuss as possible. 
This was developed and tested with the following:
<li>
  <ul>An old PC running Ubuntu Server 24 with 12 GB of RAM</ul>
  <ul>Nginx Webserver</ul>
  <ul>Tested primarily in Firefox</ul>
</li>

