import React, { useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, Button } from '@/components/ui/Primitives';
import { exportAsJson, parseImportedJson } from '@/lib/storage';
import { Download, Upload, RotateCcw, Trash2 } from 'lucide-react';

export default function Settings() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const replaceAllData = useAppStore((s) => s.replaceAllData);
  const resetToSeed = useAppStore((s) => s.resetToSeed);
  const resetToEmpty = useAppStore((s) => s.resetToEmpty);
  const fullState = useAppStore((s) => s);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleExport() {
    const { version, exercises, plans, workouts, bodyMetrics, settings: s } = fullState;
    exportAsJson({ version, exercises, plans, workouts, bodyMetrics, settings: s });
  }

  function handleImportClick() {
    setImportError(null);
    setImportSuccess(false);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = parseImportedJson(text);
      replaceAllData(data);
      setImportSuccess(true);
      setImportError(null);
    } catch (err) {
      setImportError('Die Datei konnte nicht importiert werden. Bitte prüfe das Format.');
    } finally {
      e.target.value = '';
    }
  }

  function handleReset() {
    resetToEmpty();
    setConfirmReset(false);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>
        <p className="text-sm text-ink-muted mt-1">Einheiten, Darstellung und Datenverwaltung.</p>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Einheiten</h2>
        <div className="flex gap-2">
          {(['kg', 'lb'] as const).map((u) => (
            <button
              key={u}
              onClick={() => updateSettings({ weightUnit: u })}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium border ${
                settings.weightUnit === u
                  ? 'bg-accent-soft text-accent border-accent/30'
                  : 'bg-surface-overlay text-ink-muted border-surface-border hover:text-ink'
              }`}
            >
              {u === 'kg' ? 'Kilogramm (kg)' : 'Pfund (lb)'}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Darstellung</h2>
        <div className="flex gap-2">
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateSettings({ theme: t })}
              disabled={t === 'light'}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium border disabled:opacity-40 disabled:cursor-not-allowed ${
                settings.theme === t
                  ? 'bg-accent-soft text-accent border-accent/30'
                  : 'bg-surface-overlay text-ink-muted border-surface-border hover:text-ink'
              }`}
            >
              {t === 'dark' ? 'Dunkel' : 'Hell (bald verfügbar)'}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-faint">
          Der Hellmodus ist als nächster Ausbauschritt vorgesehen — die Farbtoken sind bereits so aufgebaut, dass ein
          zweites Theme ergänzt werden kann.
        </p>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Daten exportieren &amp; importieren</h2>
        <p className="text-sm text-ink-muted">
          Exportiere alle Daten als JSON-Datei für ein Backup, oder importiere eine zuvor exportierte Datei.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={16} /> Als JSON exportieren
          </Button>
          <Button variant="secondary" onClick={handleImportClick}>
            <Upload size={16} /> JSON importieren
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
        </div>
        {importError && <p className="text-sm text-warn">{importError}</p>}
        {importSuccess && <p className="text-sm text-good">Daten wurden erfolgreich importiert.</p>}
      </Card>

      <Card className="p-5 flex flex-col gap-4 border-warn/20">
        <h2 className="text-sm font-semibold text-ink">Daten zurücksetzen</h2>
        <p className="text-sm text-ink-muted">
          Setzt alle lokalen Daten (Übungen, Pläne, Trainings, Körpermaße) unwiderruflich zurück.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => resetToSeed()}>
            <RotateCcw size={16} /> Auf Beispieldaten zurücksetzen
          </Button>
          {confirmReset ? (
            <Button variant="danger" onClick={handleReset}>
              Wirklich alle Daten löschen?
            </Button>
          ) : (
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <Trash2 size={16} /> Alle Daten löschen
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
