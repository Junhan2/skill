// Document toolbar.
const styles = `
.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.toolbar__button {
  min-height: 44px;
  padding-inline: 16px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  background: #fafafa;
  font-size: 15px;
}

.toolbar__button:hover {
  background: #f4f4f5;
}

.toolbar__button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
`;

type ToolbarProps = {
  onPublish: () => void;
  onDuplicate: () => void;
};

export function Toolbar({ onPublish, onDuplicate }: ToolbarProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="toolbar">
        <button type="button" className="toolbar__button" onClick={onPublish}>
          Publish
        </button>
        <button type="button" className="toolbar__button" onClick={onDuplicate}>
          Duplicate
        </button>
      </div>
    </>
  );
}
