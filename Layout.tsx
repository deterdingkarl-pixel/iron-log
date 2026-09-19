import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/training-eintragen', label: 'Training eintragen', icon: PlusCircle },
  { to: '/plaene', label: 'Trainingspläne', icon: ClipboardList },
  { to: '/uebungen', label: 'Übungen', icon: Dumbbell },
  { to: '/fortschritt', label: 'Fortschritt', icon: TrendingUp },
  { to: '/einstellungen', label: 'Einstellungen', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-surface-border bg-surface-raised px-4 py-6 gap-1">
        <div className="flex items-center gap-2 px-2 pb-6">
          <div className="w-8 h-8 rounded-md bg-accent-soft flex items-center justify-center">
            <Dumbbell size={18} className="text-accent" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Iron Log</span>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-overlay'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-surface-border bg-surface-raised sticky top-0 z-30">
          <div className="w-7 h-7 rounded-md bg-accent-soft flex items-center justify-center">
            <Dumbbell size={16} className="text-accent" />
          </div>
          <span className="font-semibold">Iron Log</span>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-raised border-t border-surface-border flex justify-around py-2"
          aria-label="Hauptnavigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium ${
                  isActive ? 'text-accent' : 'text-ink-faint'
                }`
              }
            >
              <item.icon size={20} />
              {item.label.split(' ')[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
