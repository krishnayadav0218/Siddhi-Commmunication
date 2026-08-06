import { useState } from 'react';
import { useTheme, THEMES } from '../lib/ThemeContext';

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES.find((t) => t.key === theme) || THEMES[0];

  return (
    <div className="theme-picker">
      <button
        type="button"
        className="theme-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change color theme"
        aria-expanded={open}
      >
        <span
          className="theme-swatch-dot"
          style={{ background: `linear-gradient(135deg, ${current.swatch[0]}, ${current.swatch[1]})` }}
        />
      </button>

      {open ? (
        <>
          <div className="theme-picker-backdrop" onClick={() => setOpen(false)} />
          <div className="theme-picker-menu">
            <p className="theme-picker-title">Color Theme</p>
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`theme-picker-option${theme === t.key ? ' active' : ''}`}
                onClick={() => {
                  setTheme(t.key);
                  setOpen(false);
                }}
              >
                <span
                  className="theme-swatch-dot"
                  style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})` }}
                />
                <span>{t.label}</span>
                {theme === t.key ? <span className="theme-picker-check">✓</span> : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
