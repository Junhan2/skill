// Toolbar for the document editor.
import { motion } from 'framer-motion';
import { useState } from 'react';

const styles = `
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar__save {
  transition: all 300ms ease-in;
  background: #2563eb;
  color: white;
  border: 0;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 14px;
}

.toolbar__save:hover {
  background: #1d4ed8;
}

.toolbar__icon {
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
`;

type EditorToolbarProps = {
  onSave: () => Promise<void>;
  onDelete: () => void;
};

export function EditorToolbar({ onSave, onDelete }: EditorToolbarProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="toolbar">
        <motion.button
          className="toolbar__save"
          whileHover={{ scale: 1.05 }}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </motion.button>

        <button className="toolbar__icon" onClick={onDelete} aria-label="Delete draft">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3 4h10M6 4V2h4v2M5 4l1 10h4l1-10" stroke="currentColor" fill="none" />
          </svg>
        </button>
      </div>
    </>
  );
}
