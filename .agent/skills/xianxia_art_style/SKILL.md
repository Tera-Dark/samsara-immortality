---
description: Xianxia Meta Art Style & UI/UX Standards
---

# Xianxia Meta Art Style Guide

## 1. Core Aesthetic Philosophy
**"Cyber-Cultivation" (赛博修仙)**: A fusion of traditional Eastern fantasy (Xianxia) with modern, minimalist, and slightly futuristic UI elements.
- **Keywords**: Ethereal (飘渺), Void (虚空), Jade (玉), Minimalism (极简), Glow (流光).
- **Atmosphere**: Deep, mysterious, immersive. High contrast between the dark void background and luminous jade/gold accents.

## 2. Color Palette (Design Tokens)

### Backgrounds
- **Void (Primary BG)**: `#020617` (Slate-950/Black mix) - The infinite darkness of the cultivation universe.
- **Ink (Secondary BG)**: `#0f172a` (Slate-900) - Panels, cards, modal backgrounds.
- **Glass**: `rgba(15, 23, 42, 0.6)` with `backdrop-filter: blur(12px)`.

### Accents
- **Jade (Primary Brand)**: `#10b981` (Emerald-500) - Health, Success, Growth, Main Action.
    - Glow: `box-shadow: 0 0 20px rgba(16, 185, 129, 0.2)`
- **Gold (Secondary Brand)**: `#f59e0b` (Amber-500) - Wealth, Divine, Rare Items, Titles.
- **Sky (Spiritual Power)**: `#0ea5e9` (Sky-500) - Mana, Intelligence, Learning.
- **Rose (Combat/Danger)**: `#f43f5e` (Rose-500) - Attack, Critical, Enemies.

### Text
- **Primary**: `#e2e8f0` (Slate-200) - Main reading text.
- **Secondary**: `#94a3b8` (Slate-400) - Descriptions, labels.
- **Muted**: `#475569` (Slate-600) - Subtle dividers, inactive states.

## 3. Typography

### Title / Display
- **Font**: `"Ma Shan Zheng"`, serif
- **Usage**: Main Logos, Scene Headers, Critical Notifications.
- **Style**: Large, loose tracking (`tracking-widest`), text-shadow/glow.

### UI / Body
- **Font**: `"Noto Serif SC"`, serif (Primary) OR `"Jost"`, sans-serif (Modern UI elements)
- **Usage**: Button text, dialogues, descriptions.
- **Style**: Elegant, refined, readable.

### Data / Numbers
- **Font**: `"JetBrains Mono"`, monospace
- **Usage**: Attributes, Logs, Resources, Version numbers.
- **Style**: Precise, technical.

## 4. UI Component Standards

### Buttons
- **Shape**: Rounded-lg (8px) or slight cut-corners.
- **Primary Button**:
    - transparent or low-opacity background.
    - Thin border (`border-emerald-500/40`).
    - Hover: Glow effect, border lightens, distinct background shift.
    - Text: widely spaced (`tracking-[0.3em]`), serif.
- **Secondary Button**:
    - Muted colors, minimal border.

### Panels & Cards
- **Glassmorphism**: Dark semi-transparent backgrounds with thin white/slate borders (`border-white/5`).
- **Dividers**: Gradient lines (`from-transparent via-slate-700 to-transparent`).

### Layout & Spacing
- **Max Width**: `max-w-[1200px]` for main content layouts to preserve density on large screens.
- **Full Screen**: Main interfaces (Menu, Game Scene) must be 100% viewport height/width (`h-full w-full`) without global scrollbars. Use internal scrolling for specific panels only.
- **Whitespace**: Generous vertical spacing. Elements should "float" in the void.

## 5. Animation Guidelines
- **Speed**: Slow, breathing, ethereal.
- **Types**:
    - `fade-in`: Smooth entry for scenes (0.5s - 1s).
    - `pulse-glow`: Gentle breathing light on key elements (Jade/Gold).
    - `float`: Subtle vertical movement for "floating" UI elements.
- **Interactions**: Swift but smooth transitions (0.2s - 0.3s) on hover.

## 6. Implementation Reference (Tailwind)
```tsx
// Example Primary Button
<button className="
    px-8 py-3 rounded-lg
    border border-emerald-500/30 bg-emerald-950/20
    text-emerald-400 font-serif tracking-[0.2em]
    hover:bg-emerald-950/40 hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]
    transition-all duration-300
">
    开始修炼
</button>

// Example Panel
<div className="
    bg-slate-900/60 backdrop-blur-md
    border border-slate-800/60
    p-6 rounded-xl
    shadow-2xl
">
    Content
</div>
```
