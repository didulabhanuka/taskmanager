import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoard } from '../../context/BoardContext';

const cardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
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
    --danger: #ff4d6d;
    --danger-soft: rgba(255,77,109,0.1);
  }

  .card-root {
    font-family: 'Sora', sans-serif;
    position: relative;
    border-radius: 10px;
    padding: 11px 12px;
    margin-bottom: 6px;
    cursor: grab;
    background: var(--surface-2);
    border: 1px solid var(--border);
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
    will-change: transform;
  }
  .card-root:last-child { margin-bottom: 0; }

  .card-root:hover {
    border-color: var(--border-hover);
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  }

  .card-root.is-dragging {
    opacity: 0;
    pointer-events: none;
  }

  .card-root:active { cursor: grabbing; }

  /* ── Body ── */
  .card-body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .card-title {
    flex: 1;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-1);
    line-height: 1.5;
    word-break: break-word;
    min-width: 0;
  }

  .card-title-input {
    font-family: 'Sora', sans-serif;
    flex: 1;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-1);
    background: transparent;
    border: none;
    outline: none;
    line-height: 1.5;
    resize: none;
    padding: 0;
    width: 100%;
    min-width: 0;
  }

  .card-delete-btn {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    background: transparent;
    border: none;
    color: var(--text-3);
    cursor: pointer;
    opacity: 0;
    transition: all 0.15s ease;
    margin-top: 1px;
  }
  .card-root:hover .card-delete-btn {
    opacity: 1;
  }
  .card-delete-btn:hover {
    background: var(--danger-soft);
    color: var(--danger);
  }

  /* ── Labels ── */
  .card-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 9px;
  }

  .card-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.3px;
    padding: 2px 7px;
    border-radius: 20px;
    color: #fff;
    background: var(--accent);
    opacity: 0.9;
    text-transform: uppercase;
  }

  /* ── Meta row ── */
  .card-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 9px;
    flex-wrap: wrap;
  }

  .card-due {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: var(--text-3);
    background: var(--surface-3);
    border-radius: 5px;
    padding: 2px 6px;
  }

  .card-due.overdue {
    color: #ff8099;
    background: var(--danger-soft);
  }

  .card-assignee {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .card-avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .card-assignee-name {
    font-size: 11px;
    color: var(--text-3);
    font-weight: 500;
  }

  /* ── Drag handle hint ── */
  .card-drag-dots {
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.15s ease;
    color: var(--text-3);
    pointer-events: none;
  }
  .card-root:hover .card-drag-dots { opacity: 1; }
`;

const Card = ({ card }) => {
  const { deleteCard, updateCard } = useBoard();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id, data: { type: 'card', card } });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSave = () => {
    if (title.trim() && title !== card.title) {
      updateCard(card._id, { title: title.trim() });
    } else {
      setTitle(card.title);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleTitleSave(); }
    if (e.key === 'Escape') { setTitle(card.title); setEditing(false); }
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <>
      <style>{cardStyles}</style>
      <div
        ref={setNodeRef}
        style={dndStyle}
        {...attributes}
        {...listeners}
        className={`card-root ${isDragging ? 'is-dragging' : ''}`}
      >
        {/* Drag grip dots */}
        <span className="card-drag-dots">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
            <circle cx="2" cy="2"  r="1.2" />
            <circle cx="6" cy="2"  r="1.2" />
            <circle cx="2" cy="7"  r="1.2" />
            <circle cx="6" cy="7"  r="1.2" />
            <circle cx="2" cy="12" r="1.2" />
            <circle cx="6" cy="12" r="1.2" />
          </svg>
        </span>

        {/* Title row */}
        <div className="card-body">
          {editing ? (
            <textarea
              autoFocus
              className="card-title-input"
              value={title}
              rows={2}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="card-title" onDoubleClick={() => setEditing(true)}>
              {card.title}
            </p>
          )}

          {!editing && (
            <button
              className="card-delete-btn"
              onClick={(e) => { e.stopPropagation(); deleteCard(card._id); }}
              onPointerDown={(e) => e.stopPropagation()}
              title="Delete card"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Labels */}
        {card.labels?.length > 0 && (
          <div className="card-labels">
            {card.labels.map((label, i) => (
              <span key={i} className="card-label">{label}</span>
            ))}
          </div>
        )}

        {/* Meta */}
        {(card.dueDate || card.assignee) && (
          <div className="card-meta">
            {card.dueDate && (
              <span className={`card-due ${isOverdue ? 'overdue' : ''}`}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {card.assignee && (
              <span className="card-assignee">
                <span className="card-avatar">
                  {card.assignee.avatar || card.assignee.name?.[0]}
                </span>
                <span className="card-assignee-name">{card.assignee.name}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Card;