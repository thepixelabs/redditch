# 📜 Redditch: The Royal Enfield Digital Service Manual (PRD)

**Hosted At:** `redditch.pixelabs.net`  
**Concept:** A hybrid maintenance automator and technical wiki for modern Royal Enfield motorcycles.

---

## 🏁 1. Product Vision & User Journey
**Value Proposition:** 
The definitive, community-driven, no-nonsense maintenance companion for modern Royal Enfield motorcycles. It replaces scattered forum posts, dog-eared manuals, and confusing PDFs with a clean, mobile-optimized, task-centric database. 

**The User Journey:**
1. **Garage Entry:** The user opens the web app on a smudged smartphone while standing in the garage. The UI is high-contrast (Dark Mode by default) with large, tap-friendly areas.
2. **Bike Selection & State:** They select their model (e.g., "Interceptor 650") and enter their current odometer reading (e.g., "9,800 km").
3. **Actionable Output:** The app calculates and displays the immediate upcoming service: *"10,000 km Service Due in 200 km."*
4. **Task Expansion (The Magic):** The user taps the "Change Engine Oil" task. The card expands to reveal *only* the context needed for this exact job:
   - Oil type and capacity (e.g., 15W50 API SL, 2.9L refill).
   - Filter part numbers (OEM and validated Aftermarket like K&N).
   - Required tools (14mm socket, oil filter wrench).
   - **Crucial Specs:** Drain plug torque (20 Nm).
5. **Completion:** The user gets the spec, torques the bolt, and gets back to riding.

---

## 🛠️ 2. Technical Architecture & Tech Stack
To keep this free to host, blazing fast, and easy for the community to contribute to, we will use a **Static Site Generation (SSG)** approach.

*   **Frontend:** Next.js (Static Export) + TypeScript.
*   **Styling:** TailwindCSS (High-contrast, utility-first).
*   **Hosting:** GitHub Pages or Vercel (Free Tier) under `redditch.pixelabs.net`.
*   **Data Architecture:** Flat YAML files in `data/bikes/*.yaml`.

---

## 📅 3. Phased Rollout Plan
**Phase 1: MVP ("The 650 Blueprint")**
*   **Scope:** 650 Twins (Interceptor, Continental GT, Super Meteor - shared engine platform).
*   **Features:** Core mileage calculator, static list of service intervals, basic task expansion (oil, valves, chain, spark plugs).
*   **Tech:** Read-only YAML database rendered via a static frontend.

**Phase 2: Expansion & State ("The J-Series & Singles")**
*   **Scope:** Add Classic 350, Meteor 350, Hunter 350, and Himalayan 411/450.
*   **Features:** Browser `LocalStorage` saving (remember my bike and last mileage). Checkboxes to "tick off" completed tasks for a specific interval.
*   **Integrations:** Export upcoming service to ICS/Google Calendar.

**Phase 3: Community & Ecosystem ("The Global Garage")**
*   **Scope:** Open-source crowdsourcing.
*   **Features:** "Submit a Correction" button linking directly to GitHub PR templates.
*   **Content:** Extensive aftermarket alternative parts mapping.
*   **Tech:** Automated CI/CD validation to ensure community PRs don't break the app structure.

---

## 👮 4. Agent Delegation Plan
1. **UX/UI Designer Agent:** Design the "Garage View" interface.
2. **Data Architect Agent:** Formalize the YAML Schema and sample data.
3. **Frontend Developer Agent:** Scaffold the Next.js environment and mileage engine.
4. **DevOps Engineer Agent:** Create GitHub Actions for YAML validation and automated deployment.
