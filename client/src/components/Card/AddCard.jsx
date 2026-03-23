import { useState } from 'react';
import { useBoard } from '../../context/BoardContext';

const addCardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

  :root {
    --surface-2: #18181f;
    --surface-3: #1e1e28;
    --border: rgba(255,255,255,0.06);
    --border-hover: rgba(255,255,255,0.12);
    --accent: #6c63ff;
    --accent-2: #a78bfa;
    --accent-glow: rgba(108,99,255,0.3);
    --accent-soft: rgba(108,99,255,0.1);
    --text-1: #f0f0f8;
    --text-2: #8888aa;
    --text-3: #44445a;
  }

  .add-card-root {
    font-family: 'Sora', sans-serif;
    animation: addCardIn 0.18s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes addCardIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .add-card-textarea {
    font-family: 'Sora', sans-serif;
    display: block;
    width: 100%;
    padding: 9px 11px;
    background: var(--surface-3);
    border: 1px solid var(--accent);
    border-radius: 8px;
    color: var(--text-1);
    font-size: 13px;
    line-height: 1.5;
    resize: none;
    outline: none;
    box-sizing: border-box;
    box-shadow: 0 0 0 3px var(--accent-soft);
    transition: border-color 0.15s ease;
  }
  .add-card-textarea::placeholder {
    color: var(--text-3);
    font-family: 'Sora', sans-serif;
  }

  .add-card-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }

  .add-card-submit {
    font-family: 'Sora', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 2px 8px var(--accent-glow);
  }
  .add-card-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px var(--accent-glow);
  }
  .add-card-submit:active { transform: translateY(0); }

  .add-card-cancel {
    font-family: 'Sora', sans-serif;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-3);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .add-card-cancel:hover {
    background: var(--surface-2);
    border-color: var(--border-hover);
    color: var(--text-2);
  }

  .add-card-hint {
    font-size: 10px;
    color: var(--text-3);
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }
`;

const AddCard = ({ columnId, boardId, onClose }) => {
  const { createCard } = useBoard();
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    createCard(title.trim(), columnId, boardId);
    setTitle('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
  };

  return (
    <>
      <style>{addCardStyles}</style>
      <div className="add-card-root">
        <form onSubmit={handleSubmit}>
          <textarea
            autoFocus
            className="add-card-textarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Card title…"
            rows={2}
          />
          <div className="add-card-actions">
            <button type="submit" className="add-card-submit">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add card
            </button>
            <button type="button" className="add-card-cancel" onClick={onClose} title="Cancel">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <span className="add-card-hint">⌘↵ to save</span>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddCard;