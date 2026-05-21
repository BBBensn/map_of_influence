---
date_created: 2026-05-21
type: project
status: active
bereich: coding
tags: [project, coding, d3, wikidata, knowledge-graph, map-of-influence]
---

# Map of Influence

## Was ist das Projekt?
Interaktive Web-App zur Visualisierung von Einflüssen und Beziehungen zwischen Philosophen, Denkern, Bewegungen und Konzepten. Nutzer suchen eine Person, sehen einen dynamisch wachsenden Netzwerkgraphen und können durch Klicken auf Nodes die Ideengeschichte explorieren. Daten kommen live aus Wikidata und Wikipedia.

## Ziel / Done-Definition
MVP ist fertig wenn: Suche → Wikidata-Daten → D3-Graph mit klickbaren Nodes funktioniert, Beziehungstypen sichtbar sind, und die Sidebar Bild + Kurzbeschreibung zeigt. Die App ist unter `influence.bensn.me` öffentlich erreichbar.

## Scope

**In v1.0.0:**
- Suchfeld für Personen
- Wikidata SPARQL → D3-force-directed Graph
- Beziehungstypen: beeinflusst von / beeinflusste / gleiche Schule / verwandt / Gegner
- Klickbare Nodes (Graph erweitert sich dynamisch)
- Sidebar: Wikipedia-Bild + Kurzbeschreibung (EN, DE als Fallback)
- Zoom + Pan

**Bewusst nicht in v1:**
Accounts, Datenbank, AI-Features, gespeicherte Graphen, mobile Optimierung, Timeline, komplexe Filter, Animationen

## Meilensteine
- v1.0.0 — MVP: Suche, Graph, Sidebar, Deploy auf influence.bensn.me ✅ done (2026-05-21)
- v1.1.0 — Pfadsuche zwischen zwei Personen, Beziehungstypen farblich differenziert
- v1.2.0 — Cluster nach Bewegung/Epoche, Timeline-Modus, thematische Layer
- v1.3.0 — Gespeicherte Reisen/Collections, Export als Bild/Graph

## Stack
- **Frontend:** React + Vite + TypeScript
- **Visualisierung:** D3.js (d3-force, d3-zoom)
- **Daten:** Wikidata SPARQL + Wikipedia REST API (direkt aus dem Frontend, kein Backend in v1)
- **Deploy:** Static via SCP → `/var/www/map-of-influence/public/`, nginx auf `influence.bensn.me`
- **Repo:** `git@github.com:BBBensn/map_of_influence.git`

## Offene Fragen
- Backend für Caching ab v1.1? (Port 5057 reserviert, Entscheidung offen)
- DBpedia als zusätzliche Datenquelle ab v1.2?

## Notizen
- Wikidata-Daten sind inkonsistent — v1 fokussiert auf Exploration, nicht auf Datenperfektionismus
- D3 statt Cytoscape gewählt: mehr Kontrolle, Wiederverwendung des Wissens für Mneme
- Wikipedia: EN primär, DE als Fallback falls kein EN-Artikel vorhanden

---
<!-- status: planning / active / paused / done / cancelled -->
<!-- bereich: coding / music / fashion / creative / homelab / other -->
