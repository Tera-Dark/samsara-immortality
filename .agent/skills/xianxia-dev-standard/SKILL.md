---
name: xianxia-dev-standard
description: Development guidelines and standards for the Xianxia Meta Engine project, ensuring consistency and Chinese language usage.
---

# Xianxia Meta Engine Development Standards (v2.0)

This skill outlines the mandatory development guidelines for the project. **Strict adherence is required** to prevent codebase degradation ("AI rot").

## 1. 🚨 Core Directives (原则)

### 1.1 Language Rule (语言规范)
**ALL user-facing content MUST be in Simplified Chinese (简体中文).**
*   **UI**: Buttons, Labels, Tooltips, Logs.
*   **Data**: Event names, descriptions, items.
*   **Comments**: Complex logic explanations.
*   **Exception**: Code identifiers (variables, functions, IDs) MUST use English (CamelCase/PascalCase/UPPER_SNAKE_CASE).

### 1.2 No "String Eval" (禁止字符串代码)
*   **Forbidden**: `trigger: "stats.STR > 10"`
*   **Required**: Use the `Condition` object structure.
    ```typescript
    // BAD
    trigger: "age > 10 && stats.STR > 5"

    // GOOD
    conditions: [
      { type: 'AGE', op: 'GT', value: 10 },
      { type: 'STAT', target: 'STR', op: 'GT', value: 5 }
    ]
    ```

### 1.3 Strict Separation of Concerns (关注点分离)
*   **UI Components**: ONLY render data and dispatch actions. NO business logic calculations.
    *   *Bad*: `disabled={state.money < 100 && state.age > 10}`
    *   *Good*: `disabled={!canAffordUpgrade(state)}` (Helper) or `engine.canAfford(...)`
*   **Engine**: Handles all state mutations and logic checks.
*   **Data**: Pure JSON/Object configuration. No functions inside data files.

---

## 2. Architecture & Tech Stack

*   **Framework**: React + TypeScript + Zustand + Vite.
*   **Styling**: Tailwind CSS **exclusively**.
    *   Do NOT use `style={{ ... }}` for static styling.
    *   Do NOT use CSS modules or external `.css` files (except global `index.css`).
    *   Use `clsx` or template literals for conditional classes.
*   **State Management**: `gameStore.ts` is the single source of truth.
*   **Icons**: Copy SVG paths directly into components or use a standardized Icon component. Do NOT import heavy icon libraries.

---

## 3. UI/UX Design System (Cyber-Cultivation / 赛博修仙)

> *"Ancient Dao, Digital Soul"* (古道·数魂)

### 3.1 Visual Pillars
*   **Glassmorphism**: `bg-slate-900/60 backdrop-blur-md border border-white/10`
*   **Neon Accents**: Use specific colors to denote Cultivation concepts.
    *   **Growth (Green)**: `emerald-500` (Health, Exp)
    *   **Spirit (Blue)**: `sky-500` (Mana, Dao)
    *   **Realm (Gold)**: `amber-500` (Breakthrough, Rare)
    *   **Karma (Red)**: `rose-500` (Attack, Evil)
*   **Typography**:
    *   Headings: `font-serif` (Bodoni Moda / Noto Serif SC)
    *   UI/Body: `font-sans` (Jost / Noto Sans SC)
    *   Data/Numbers: `font-mono` (JetBrains Mono)

### 3.2 Component Standards
*   **Modals**: Must use `fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm`.
*   **Buttons**:
    *   Primary: `bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-all`.
    *   Disabled: `opacity-50 cursor-not-allowed grayscale`.
*   **Tooltips**: Must be instant and high-contrast.

---

## 4. Coding Standards

### 4.1 Type Safety
*   **No `any`**: Explicitly define interfaces.
*   **IDs**: Use string unions or strict string types for IDs where possible (e.g., `AttributeId` instead of `string`).
*   **Null Safety**: Use optional chaining `?.` and nullish coalescing `??`.

### 4.2 File Structure
```
src/
  ├── components/   # Pure UI components (props driven)
  ├── engine/       # Logic Classes (GameEngine, WorldGenerator)
  ├── modules/      # Data Definitions (xianxia/data)
  ├── store/        # Zustand Stores
  ├── types/        # Shared Interfaces
  ├── utils/        # Pure helper functions
  └── views/        # Screen-level Orchestrators
```

### 4.3 Naming Conventions
*   **Components**: PascalCase (`StatsPanel.tsx`)
*   **Functions**: camelCase (`calculateDamage`)
*   **Constants**: UPPER_SNAKE_CASE (`MAX_INVENTORY_SIZE`)
*   **Data IDs**: UPPER_SNAKE_CASE with Prefix (`EVT_MEETING_01`, `ITEM_SPIRIT_STONE`)

---

## 5. Game Systems Implementation

### 5.1 Event System
*   Events must use `GameEvent` interface.
*   Use `conditions` array for requirements.
*   Use `branches` for outcomes based on stats/randomness.
*   **Logging**:
    *   Format: `Title: Content (Effect)`
    *   Time: Include `[Age]` or `[Date]` prefix.
    *   Color: Highlight gained items/stats in color (e.g., `text-emerald-400`).

### 5.2 Attributes (Stats)
*   **Primary (5D)**: `STR` (体魄), `INT` (悟性), `POT` (资质), `CHR` (魅力), `LUCK` (气运).
*   **Standard Keys**: Always use these 3-4 letter keys. Do NOT use `Strength`, `Intelligence` etc. at runtime.

### 5.3 Modifications Checklist
Before committing changes to specialized logic (e.g., Cultivation, Combat):
1.  [ ] Check `GAME_RULES` in `rules.ts` for constants.
2.  [ ] Ensure all text is Chinese.
3.  [ ] Verify UI matches "Cyber-Cultivation" aesthetic (Dark mode + Neon).
4.  [ ] Run `npm run build` to check for type errors.
