# ⚔️ SHADOW STRIKE: MORTAL DUEL

A mobile-first, high-octane 2D fighting game inspired by **Mortal Kombat** and **Shadow Fight**. Built with pure vanilla HTML5, Canvas, Web Audio API, and CSS3 — 100% self-contained with **zero external dependencies**, making it instantly deployable to **GitHub Pages**.

---

## 🎮 Features

- **🥋 5 Unique Shadow Warriors**:
  1. **Kage (Shadow Shinobi)** — *Element: Void* | Dual Katanas | Special Moves: *Shadow Step* (Instant back-teleport), *Shuriken Storm*, *Void Execution* (Ultimate).
  2. **Ignis (Infernal Warlock)** — *Element: Hellfire* | Blazing Claws | Special Moves: *Hellfire Blast* (Fireball), *Flame Pillar*, *Infernal Dragon* (Ultimate).
  3. **Raiden Volt (Thunder Monk)** — *Element: Lightning* | Storm Staff | Special Moves: *Volt Surge* (Dash attack), *Heaven's Bolt*, *Storm Overload* (Ultimate).
  4. **Frost (Glacial Assassin)** — *Element: Frost* | Cryo Kamas | Special Moves: *Glacial Spikes* (Freezes target), *Ice Decoy*, *Absolute Zero* (Ultimate).
  5. **Titan (Iron Colossus)** — *Element: Earth & Steel* | War Hammer | Special Moves: *Ground Slam* (Earthquake), *Titanic Tackle*, *Tectonic Cataclysm* (Ultimate).

- **📱 Mobile-First Touch Controls**:
  - Left ergonomic virtual D-Pad (◀ Left, ▶ Right, ▲ Jump, ▼ Crouch).
  - Right action buttons (👊 Punch, 🦵 Kick, 🛡️ Block, ⚡ Special 1, 🔥 Special 2, ☠️ ULTIMATE button).
  - Cooldown countdowns displayed directly on the buttons.
  - Multi-touch and haptic vibration feedback.
  - Landscape orientation notice.

- **🔊 Pure Web Audio API Synthesizer**:
  - Dynamic martial arts drum rhythms, swooshes, punch thuds, sword slashes, fire explosions, thunder bolts, freezing ice, and victory gongs. No external audio files required!

- **💥 Combat Mechanics**:
  - Street Fighter / Mortal Kombat lagging health bars.
  - Super Meter charging up to 100% for cinematic Ultimates.
  - Combo hit streak counters with damage scaling.
  - Reaction-based AI opponent with blocking and counters.
  - 3 Dynamic Battle Arenas: *Blood Moon Shrine*, *Cyber Neon Dojo*, *Nether Magma Pit*.

---

## 🕹️ Controls Guide

### 📱 Mobile Touch Controls
- **D-Pad (Left)**: Move Left / Right, Jump (▲), Crouch (▼).
- **Punch (👊)**: Fast attack, builds combo streak.
- **Kick (🦵)**: Heavy attack, high damage and knockback.
- **Block (🛡️)**: Hold to absorb 82% of incoming damage.
- **Special 1 (⚡)**: Character signature ability (Teleport, Fireball, Freeze Spikes, etc.).
- **Special 2 (🔥)**: Secondary superpower (Flame Pillar, Lightning, Decoy).
- **Ultimate (☠️)**: Cinematic super move (Available when Super Meter reaches 100%).

### 💻 Desktop Keyboard Controls
- **Move / Jump / Crouch**: `A` / `D` (or `◀` / `▶`) to Walk, `W` (or `▲`) to Jump, `S` (or `▼`) to Crouch.
- **Punch**: `J`
- **Kick**: `K`
- **Block**: `L`
- **Special 1**: `U`
- **Special 2**: `I`
- **Ultimate**: `Space` (or `O`)

---

## 🚀 How to Deploy to GitHub Pages (Free Hosting)

Since this game is built entirely in vanilla HTML, CSS, and JavaScript with no build steps or backend:

1. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and click **New Repository**.
   - Name it (e.g., `shadow-strike-fighter`).
   - Choose **Public**.

2. **Upload the Files**:
   - Upload all files from this folder:
     - `index.html`
     - `style.css`
     - `game.js`
     - `fighter.js`
     - `characters.js`
     - `particles.js`
     - `controls.js`
     - `audio.js`
     - `README.md`
   - Commit the changes to the `main` branch.

3. **Enable GitHub Pages**:
   - In your repository, go to **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/(root)`, then click **Save**.
   - Within 1–2 minutes, GitHub will generate a live URL:
     `https://<your-username>.github.io/<repository-name>/`
   - Open this link on your mobile phone browser to play anywhere!

---

## 📂 Local Testing

Simply double-click `index.html` in your browser (Chrome, Edge, Safari, Firefox) to start playing instantly.
