// Command palette, opened with Cmd+K.
import { useEffect, useState } from 'react';

type Command = { id: string; label: string; run: () => void };

export function CommandPalette({ commands }: { commands: Command[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!isOpen) return null;

  const matches = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="palette__scrim" onClick={() => setIsOpen(false)}>
      <div
        className="palette"
        role="dialog"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command…"
        />
        <ul>
          {matches.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  c.run();
                  setIsOpen(false);
                }}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
