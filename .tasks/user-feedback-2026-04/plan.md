---
epic: user-feedback-2026-04
status: DONE
phases:
  - id: 1
    title: "Fix Change Bike button — rename to Home, remove localStorage clearing, fix auto-redirect"
    persona: staff-engineer
    status: DONE
  - id: 2
    title: "Bike personalization — YAML colors, types, hook, garage UI"
    persona: staff-engineer
    status: DONE
  - id: 3
    title: "Local rider groups finder — Facebook search link + curated communities YAML"
    persona: staff-engineer
    status: DONE
  - id: 4
    title: "GitHub Actions data-check workflow + data source tests"
    persona: devops
    status: DONE
  - id: 5
    title: "Integration verification — ensure all workstreams compile and coexist"
    persona: staff-engineer
    status: DONE
---

## Context & Objective

Execute four independent user feedback items in parallel:

1. **Change Bike button** — rename to Home, make it a simple Link, stop clearing localStorage. CRITICAL: also fix HomeClient.tsx auto-redirect so users can browse the home page even with a saved bike.
2. **Bike personalization** — let users name their bike, pick a color variant, toggle accessories. Persist in localStorage. Extend YAML bike data with colors/accessories.
3. **Rider groups finder** — "Find Riders" button that opens Facebook group search. Plus a curated communities.yaml with known RE communities.
4. **Data-check GitHub Action** — periodic workflow that verifies Overpass API and other external data sources still return expected shapes.

All four workstreams touch different files and can execute in parallel.
