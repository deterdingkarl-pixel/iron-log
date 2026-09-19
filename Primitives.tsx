import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export function Card({
  children,
  className = '',
  as: As = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: any;
}) {
  return (
    <As className={`bg-surface-raised border border-surface-border rounded-lg shadow-card ${className}`}>
      {children}
    </As>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm';
  const variants: Record<string, string> = {
    primary: 'bg-accent text-surface hover:bg-accent-strong',
    secondary: 'bg-surface-overlay text-ink hover:bg-surface-border border border-surface-border',
    ghost: 'text-ink-muted hover:text-ink hover:bg-surface-overlay',
    danger: 'bg-warn/15 text-warn hover:bg-warn/25 border border-warn/30',
  };
  return (
    <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Input({
  label,
  hint,
  className = '',
  id,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-sm text-ink-muted">{label}</span>}
      <input
        id={inputId}
        className={`w-full bg-surface-overlay border border-surface-border rounded-md px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:ring-1 focus:ring-accent outline-none ${className}`}
        {...rest}
      />
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Textarea({
  label,
  className = '',
  id,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-sm text-ink-muted">{label}</span>}
      <textarea
        id={inputId}
        className={`w-full bg-surface-overlay border border-surface-border rounded-md px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-y min-h-[80px] ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Select({
  label,
  children,
  className = '',
  id,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-sm text-ink-muted">{label}</span>}
      <select
        id={inputId}
        className={`w-full bg-surface-overlay border border-surface-border rounded-md px-3.5 py-2.5 text-base text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'warn' }) {
  const tones: Record<string, string> = {
    default: 'bg-surface-overlay text-ink-muted border-surface-border',
    accent: 'bg-accent-soft text-accent border-accent/30',
    warn: 'bg-warn/10 text-warn border-warn/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs border ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[width];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${widths} max-h-[90vh] overflow-y-auto bg-surface-raised border border-surface-border rounded-lg shadow-card`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border sticky top-0 bg-surface-raised">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-ink-muted hover:text-ink p-1 rounded-md hover:bg-surface-overlay"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 gap-3">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm">{description}</p>
      {action}
    </div>
  );
}
