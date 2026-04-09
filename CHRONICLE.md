# 📜 The Redditch Chronicle: Project Genesis

## 📅 Session Date: April 9, 2026
**Participants:** User (CEO) & Gemini CLI (Head of Product)

---

### 🎙️ The Goal
To build an open-source, web-based tool for Royal Enfield owners that combines a **Maintenance Automator** (odometer-based service tracking) with a **Technical Wiki** (torque specs, fluid capacities).

### 🛠️ The Identity
The project was named **Redditch** after the birthplace of Royal Enfield in Worcestershire, England. It signals authenticity, heritage, and "The Source" of technical truth.

### 📍 Domain Strategy
The tool will live at `redditch.pixelabs.net`. It is designed as a **Reference Utility**, not a marketing site.

### 🗝️ Core Decisions
1. **User Experience:** Focus on "Glove-Friendly" UI for garage use. High contrast, large touch targets, mobile-first.
2. **Data Model:** Use a human-readable **YAML/JSON database** in the repo. This allows non-coders to contribute bike specs via Pull Requests.
3. **Architecture:** Next.js Static Export for speed, SEO, and zero-cost hosting on GitHub Pages/Vercel.
4. **Community:** Build for the "Bulleteers" and "MLAG" (Made Like A Gun) enthusiasts.

---

### 🚀 Immediate Next Steps
- Initialize Next.js environment.
- Define the `bikes/` YAML schema.
- Create the "Garage" mileage calculation hook.
