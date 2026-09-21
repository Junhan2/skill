// Primary save button.

const styles = `
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --focus: #1d4ed8;
  --btn-bg: #14532d;
  --btn-bg-hover: #166534;
}

.btn {
  font-family: ui-sans-serif, system-ui;
  font-size: 16px;
  min-height: 44px;
  padding-inline: 1rem;
  border: 0;
  border-radius: 6px;
  background: var(--btn-bg);
  color: white;
  transition: transform 160ms var(--ease-out),
              background-color 160ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .btn:hover {
    background: var(--btn-bg-hover);
  }
}

.btn:active {
  transform: scale(0.97);
}

.btn:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: background-color 160ms var(--ease-out);
  }
}
`;

type SaveButtonProps = {
  onSave: () => void;
  children: React.ReactNode;
};

export function SaveButton({ onSave, children }: SaveButtonProps) {
  return (
    <>
      <style>{styles}</style>
      <button type="button" className="btn" onClick={onSave}>
        {children}
      </button>
    </>
  );
}
