# Iron Log — Krafttraining-Tracker (MVP)

Eine lokale Web-App zum nachträglichen Eintragen von Krafttraining, Verwalten von
Übungen und Trainingsplänen, sowie zum Auswerten deines Fortschritts.
Kein Live-Trainingsmodus, kein "Training starten"-Ablauf, kein Pausentimer —
bewusst so designt, wie angefragt.

## 1. Installation & Start

Voraussetzung: [Node.js](https://nodejs.org) ab Version 18.

```bash
# 1. In den Projektordner wechseln
cd fitness-app

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Die App läuft danach unter `http://localhost:5173`. Sie ist eine reine
Client-App — es wird kein Backend benötigt, alle Daten liegen im
`localStorage` deines Browsers.

Für einen Produktions-Build:

```bash
npm run build     # erzeugt einen statischen Build in dist/
npm run preview   # zeigt den Build lokal an
```

## 2. Projektstruktur

```
fitness-app/
├── src/
│   ├── types/index.ts        # Zentrales Datenmodell (Exercise, Workout, Plan, ...)
│   ├── data/seedData.ts      # Beispiel-Übungen, -Pläne und -Trainings
│   ├── lib/
│   │   ├── storage.ts        # localStorage laden/speichern, JSON Export/Import
│   │   └── calculations.ts   # 1RM-Schätzung, Volumen, Trainingsserien, Statistik
│   ├── store/useAppStore.ts  # zentraler Zustand (Zustand-Store) inkl. aller CRUD-Aktionen
│   ├── components/
│   │   ├── ui/Primitives.tsx     # Card, Button, Input, Select, Modal, Badge, EmptyState
│   │   ├── layout/Layout.tsx     # Sidebar (Desktop) + Bottom-Nav (Mobile)
│   │   ├── HeatmapCalendar.tsx   # Kalender mit markierten Trainingstagen
│   │   ├── StatCard.tsx
│   │   ├── WorkoutFormModal.tsx  # Training manuell eintragen/bearbeiten
│   │   ├── PlanFormModal.tsx     # Trainingsplan erstellen/bearbeiten
│   │   └── ExerciseFormModal.tsx # Übung erstellen/bearbeiten
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── LogWorkout.tsx    # Trainingshistorie + Eintragen/Bearbeiten/Kopieren/Löschen
│   │   ├── Plans.tsx
│   │   ├── Exercises.tsx
│   │   ├── Progress.tsx
│   │   └── Settings.tsx
│   ├── App.tsx                # Routing
│   └── main.tsx                # Einstiegspunkt
├── tailwind.config.js          # Design-Tokens (Farben, Radius, Schatten)
└── package.json
```

## 3. Datenstruktur

Alle Daten liegen unter dem `localStorage`-Schlüssel `iron-log:data` als ein
einziges JSON-Objekt vom Typ `AppData` (siehe `src/types/index.ts`):

- **`exercises: Exercise[]`** — Übungsbibliothek. Felder: Name, Muskelgruppe,
  Kategorie, Equipment, Beschreibung, Ausführungshinweise.
- **`plans: WorkoutPlan[]`** — Trainingspläne. Jeder Plan enthält eine
  sortierte Liste von `PlanExercise` (Übungs-Referenz + Ziel-Sätze/-Wdh./-Gewicht).
- **`workouts: Workout[]`** — protokollierte Trainingseinheiten. Jedes Workout
  hat ein Datum (`YYYY-MM-DD`), optional einen verknüpften Plan, und eine
  Liste von `ExerciseLog` (Übungs-Referenz + tatsächliche `WorkoutSet`s mit
  Gewicht, Wiederholungen, optionalem RPE).
- **`bodyMetrics: BodyMetricEntry[]`** — optionale Körpergewichts-/Maße-Einträge.
- **`settings: AppSettings`** — Einheit (kg/lb) und Theme.

**Warum so aufgebaut, im Hinblick auf spätere Cloud-Synchronisierung:**
Jede Entität hat eine eigene, clientseitig erzeugte UUID (`id`) statt einer
fortlaufenden Nummer — so lassen sich Objekte offline anlegen, ohne mit einem
Server kollidierende IDs zu erzeugen. `createdAt`/`updatedAt` sind ISO-Zeitstempel,
die später für einen Last-Write-Wins- oder Merge-Abgleich mit einem Server
genutzt werden können. Referenzen zwischen Entitäten (z. B. `exerciseId` in
einem `ExerciseLog`) laufen ausschließlich über IDs, nicht über Objektkopien —
das entspricht dem Modell einer künftigen Datenbank/REST-API. Die gesamte
Struktur ist reines JSON, ideal für den vorhandenen Export/Import und einen
künftigen Sync-Layer (z. B. Firestore, Supabase oder eine eigene REST-API).

Ein Tag zählt automatisch als Trainingstag, sobald mindestens eine Übung mit
mindestens einem Satz für dieses Datum gespeichert ist (siehe
`trainingDays()` in `lib/calculations.ts`, das eindeutige Datumswerte aus
allen Workouts ableitet).

## 4. Enthaltene Beispieldaten

Beim ersten Start wird die App automatisch mit Beispieldaten befüllt
(`src/data/seedData.ts`):

- 8 Übungen (Bankdrücken, Kniebeuge, Kreuzheben, Klimmzüge, Rudern
  vorgebeugt, Schulterdrücken, Bizepscurls, Beinpresse)
- 4 Trainingspläne (Push, Pull, Beine, Ganzkörper)
- 7 protokollierte Trainingseinheiten der letzten zwei Wochen, für
  sinnvolle Dashboard- und Fortschrittsansichten direkt nach dem Start

Unter **Einstellungen** lassen sich alle Daten jederzeit auf die
Beispieldaten zurücksetzen oder vollständig löschen.

## 5. MVP-Funktionsumfang & mögliche Erweiterungen

Alle im Briefing geforderten Kernfunktionen sind als funktionierendes MVP
umgesetzt: Dashboard mit Kennzahlen, Kalender/Heatmap und Trainingsserien;
manuelles Eintragen/Bearbeiten/Kopieren/Löschen von Trainings; Trainingspläne
mit sortierbaren Übungen und Favoriten; Übungsbibliothek mit Suche/Filtern;
Fortschrittsseite mit Diagrammen, PRs, Kalender und Statistiken samt
Zeitraum-Filter; Einstellungen mit Einheiten, JSON-Export/Import und Reset.

Bewusst als **spätere Erweiterung** markiert (nicht Teil des MVP):

- **Cloud-Synchronisierung / Login** — die Datenstruktur ist dafür
  vorbereitet (siehe Abschnitt 3), aber noch nicht angebunden.
- **Hellmodus** — der Umschalter ist in den Einstellungen sichtbar, aber
  deaktiviert; die Farb-Tokens in `tailwind.config.js` sind so benannt, dass
  ein zweites Farbschema ergänzt werden kann, ohne Komponenten anzufassen.
- **Drag-and-drop** beim Sortieren von Plan-Übungen — aktuell über
  Auf/Ab-Buttons gelöst, funktional aber ohne Maus-Drag.
- **Körpermaße** (Umfänge) — der Datentyp `BodyMetricEntry.measurements`
  existiert bereits, die UI erfasst bislang nur das Körpergewicht.
- **Undo für Löschvorgänge** und ein Papierkorb statt sofortigem Löschen.
- **Mehrsprachigkeit** (aktuell nur Deutsch).
