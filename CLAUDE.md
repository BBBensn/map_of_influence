---
date_created: 2026-05-21
date_modified: 2026-05-21
---

# map-of-influence — CLAUDE.md

Projekt-spezifischer Kontext. Ergänzt `~/.claude/CLAUDE.md`.
Ablageort: `~/Documents/Coding/Map of Influence/CLAUDE.md`

---

## Projekt-Basics

- **Name:** map-of-influence
- **Domain:** influence.bensn.me
- **Version:** v1.0.0 (released 2026-05-21)
- **Status:** active
- **Stack:** React + Vite + TypeScript + D3.js (d3-force + d3-zoom)
- **Kein Backend in v1** — alle Daten direkt aus dem Frontend via Wikidata SPARQL + Wikipedia REST API

---

## Lokale Struktur

```
~/Documents/Coding/Map of Influence/
├── src/
│   ├── components/
│   │   ├── GraphCanvas.tsx       ← D3 SVG-Wrapper (force simulation)
│   │   ├── SearchBar.tsx         ← Suchfeld mit Autocomplete
│   │   ├── Sidebar.tsx           ← Node-Detail-Panel (Bild, Beschreibung, Links)
│   │   └── LoadingOverlay.tsx
│   ├── services/
│   │   ├── wikidata.ts           ← SPARQL-Abfragen gegen query.wikidata.org
│   │   └── wikipedia.ts          ← Thumbnail + Kurzbeschreibung
│   ├── types/
│   │   └── graph.ts              ← Person, Relation, GraphNode, GraphEdge
│   ├── constants/
│   │   └── colors.ts             ← Farb-Mapping für Beziehungstypen
│   ├── App.tsx
│   └── main.tsx
├── public/
├── docs/
│   └── changelogs/               ← Claude Code schreibt Changelogs hierher
├── CLAUDE.md
├── .gitignore
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Remote-Struktur

```
/var/www/map-of-influence/
└── public/                       ← dist/ wird hierher deployed
```

Reines Static Frontend, kein Backend-Verzeichnis in v1.

---

## Services & Ports

| Dienst | Port | systemd-Service |
|--------|------|-----------------|
| — (kein Backend in v1) | — | — |
| Zukünftiger Cache-Proxy | 5057 | `map-of-influence.service` |

---

## Deploy

```bash
# Build
cd ~/Documents/Coding/Map\ of\ Influence
npm run build

# Frontend deployen
scp -r dist/* bensn:/var/www/map-of-influence/public/

# nginx reload falls nötig
ssh bensn systemctl reload nginx
```

nginx-Config für `influence.bensn.me`: SPA-Modus mit `try_files $uri /index.html`.

---

## Git

- **Repo:** `git@github.com:BBBensn/map_of_influence.git`
- **Immer SSH verwenden**, nie HTTPS

```bash
git add .
git commit -m "feat: [beschreibung]"
git push origin main
```

---

## Auth

- [x] Öffentlich — kein Auth

---

## Projekt-spezifische Konventionen

- Wikidata-Entitäten immer via QID referenzieren (z.B. `Q7197` für Foucault)
- Graph-State zentral: `{ nodes: GraphNode[], edges: GraphEdge[] }`
- Vor dem Hinzufügen neuer Nodes immer auf Duplikate prüfen (QID-Vergleich)
- SPARQL-Queries immer mit `LIMIT 50` absichern
- Beziehungstypen als Union Type: `'influenced_by' | 'influenced' | 'member_of' | 'associated_with' | 'opponent_of'`
- Farb-Mapping für Beziehungstypen zentral in `src/constants/colors.ts`
- Fehler von Wikidata/Wikipedia graceful behandeln: leerer Zustand statt Crash
- Wikipedia: Englisch primär, Deutsch als Fallback (`de.wikipedia.org/api/rest_v1/...`)
- D3 Simulation: `d3-force` für Layout, `d3-zoom` für Zoom/Pan auf dem SVG-Root

---

## Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| v1.0.0 | MVP: Suche → Wikidata SPARQL → D3-Graph, klickbare Nodes, Sidebar mit Bild + Beschreibung, Beziehungstypen sichtbar | ✅ done |
| v1.1.0 | Pfadsuche zwischen zwei Personen, Beziehungstypen farblich differenziert | geplant |
| v1.2.0 | Cluster nach Bewegung/Epoche, Timeline-Modus, thematische Layer | geplant |
| v1.3.0 | Gespeicherte Reisen/Collections, Export als Bild | geplant |

---

## Externe APIs

- **Wikidata SPARQL:** `https://query.wikidata.org/sparql`
  - Header: `User-Agent: map-of-influence/1.0 (benni@bensn.me)`
  - CORS: erlaubt
  - Rate Limit: moderat, mit `LIMIT` in Queries absichern
- **Wikipedia REST API (EN):** `https://en.wikipedia.org/api/rest_v1/page/summary/{title}`
- **Wikipedia REST API (DE Fallback):** `https://de.wikipedia.org/api/rest_v1/page/summary/{title}`
