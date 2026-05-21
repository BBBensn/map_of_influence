---
date_created: 2026-05-21 21:25:00
type: changelog
tags:
  - map-of-influence
  - changelog
date_modified: 2026-05-21 21:25:00
---

# v1.0.0 — MVP (2026-05-21)

- Vite + React + TypeScript Projekt aufgesetzt, d3 + @types/d3 installiert
- Wikidata-Service: SPARQL-Query via QID für direkte Beziehungen (influenced_by, influenced, member_of, associated_with, opponent_of), LIMIT 50, User-Agent Header, graceful error handling
- Wikidata Search: `wbsearchentities` API für schnelle Autocomplete-Suche (Top 5 Vorschläge)
- Wikipedia-Service: Thumbnail + Kurzbeschreibung via REST API, EN primär, DE als Fallback
- Graph-Types definiert: GraphNode, GraphEdge, RelationType, NodeType als Union Types
- GraphCanvas: D3 force-directed Graph auf SVG, d3-force für Layout, d3-zoom für Zoom + Pan, Nodes als Kreise mit Labels, Edges mit Beziehungsfarben und Richtungspfeilen, Drag-and-Drop für Nodes
- SearchBar: Freitexteingabe mit debounced Wikidata-Suche, Dropdown mit Top-5-Vorschlägen, Keyboard-Navigation (↑↓ Enter Escape)
- Sidebar: Wikipedia-Bild mit Gradient-Overlay, Name, Kurzbeschreibung, Liste klickbarer Beziehungen mit Farb-Dots
- LoadingOverlay: animierter Spinner mit Backdrop-Blur
- ParticleBackground: subtile Partikel-Animation (Canvas) für den leeren Startzustand, Verbindungslinien zwischen nahen Partikeln
- App.tsx: zentraler State (nodes[], edges[], selectedNode, loading), Graph wächst beim Klicken auf Nodes, Duplikat-Check via QID, Wikipedia-Daten werden nach SPARQL geladen und in Node-State gemergt
- Dunkles UI: Linear.app-Referenz, Farben funktional für Beziehungstypen (indigo, cyan, violet, emerald, red)
- Farbdefinitionen zentral in src/constants/colors.ts
- Production Build: 272 KB JS (88 KB gzip), kein Backend in v1
