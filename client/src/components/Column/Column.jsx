import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import Card from '../Card/Card';
import AddCard from '../Card/AddCard';
import { useBoard } from '../../context/BoardContext';

const columnStyles = `
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

  /* ── Column shell ── */
  .col-root {
    flex-shrink: 0;
    width: 280px;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    max-height: calc(100vh - 120px);
    transition: border-color 0.2s ease;
    font-family: 'Sora', sans-serif;
    margin-right: 12px;
  }
  .col-root:last-child { margin-right: 0; }

  /* ── Header ── */
  .col-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 11px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--border);
  }

  .col-title-area {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .col-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
    letter-spacing: -0.1px;
    cursor: default;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
  .col-title:hover {
    cursor: text;
  }

  .col-title-input {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
    background: var(--surface-2);
    border: 1px solid var(--accent);
    border-radius: 6px;
    padding: 2px 6px;
    outline: none;
    flex: 1;
    min-width: 0;
    box-shadow: 0 0 0 2px var(--accent-soft);
  }

  .col-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-3);
    background: var(--surface-3);
    border-radius: 5px;
    padding: 1px 6px;
    flex-shrink: 0;
  }

  .col-header-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: 6px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .col-root:hover .col-header-actions { opacity: 1; }

  .col-action-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: transparent;
    border: none;
    color: var(--text-3);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .col-action-btn:hover {
    background: var(--danger-soft);
    color: var(--danger);
  }

  /* ── Cards area ── */
  .col-cards {
    flex: 1;
    overflow-y: auto;
    padding: 10px 10px 4px;
    min-height: 48px;
    transition: background 0.15s ease;
    scroll-behavior: smooth;
  }
  .col-cards.is-over {
    background: rgba(108,99,255,0.04);
  }

  .col-cards::-webkit-scrollbar { width: 3px; }
  .col-cards::-webkit-scrollbar-track { background: transparent; }
  .col-cards::-webkit-scrollbar-thumb {
    background: var(--surface-3);
    border-radius: 2px;
  }

  /* Empty drop target hint */
  .col-empty-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    border: 1px dashed rgba(255,255,255,0.05);
    border-radius: 8px;
    margin-bottom: 4px;
  }
  .col-empty-hint span {
    font-size: 11px;
    color: var(--text-3);
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── Footer ── */
  .col-footer {
    padding: 6px 10px 10px;
    flex-shrink: 0;
  }

  .col-add-card-btn {
    font-family: 'Sora', sans-serif;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 8px;
    background: transparent;
    border: none;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-3);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .col-add-card-btn:hover {
    background: var(--surface-2);
    color: var(--text-2);
  }
`;

const Column = ({ column, cards, boardId }) => {
  const { dispatch } = useBoard();
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  const sortedCards = [...cards].sort((a, b) => a.order - b.order);
  const cardIds = sortedCards.map((c) => c._id);

  const { setNodeRef, isOver } = useDroppable({ id: column._id });

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (title.trim() && title !== column.title) {
      try {
        const { updateColumn } = await import('../../api/columns.api');
        await updateColumn(column._id, { title: title.trim() });
        dispatch({ type: 'COLUMN_UPDATED', payload: { ...column, title: title.trim() } });
      } catch {
        setTitle(column.title);
      }
    } else {
      setTitle(column.title);
    }
  };

  const handleDeleteColumn = async () => {
    if (!confirm(`Delete "${column.title}" and all its cards?`)) return;
    try {
      const { deleteColumn } = await import('../../api/columns.api');
      await deleteColumn(column._id);
      dispatch({ type: 'COLUMN_DELETED', payload: column._id });
    } catch (err) {
      console.error('Failed to delete column:', err.message);
    }
  };

  return (
    <>
      <style>{columnStyles}</style>
      <div className="col-root">

        {/* Header */}
        <div className="col-header">
          <div className="col-title-area">
            {editingTitle ? (
              <input
                autoFocus
                className="col-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') { setTitle(column.title); setEditingTitle(false); }
                }}
              />
            ) : (
              <h3 className="col-title" onDoubleClick={() => setEditingTitle(true)}>
                {column.title}
              </h3>
            )}
            <span className="col-count">{sortedCards.length}</span>
          </div>

          <div className="col-header-actions">
            <button
              className="col-action-btn"
              onClick={handleDeleteColumn}
              title={`Delete "${column.title}"`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={setNodeRef}
          className={`col-cards ${isOver ? 'is-over' : ''}`}
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {sortedCards.length === 0 ? (
              <div className="col-empty-hint">
                <span>drop here</span>
              </div>
            ) : (
              sortedCards.map((card) => <Card key={card._id} card={card} />)
            )}
          </SortableContext>
        </div>

        {/* Footer */}
        <div className="col-footer">
          {showAddCard ? (
            <AddCard
              columnId={column._id}
              boardId={boardId}
              onClose={() => setShowAddCard(false)}
            />
          ) : (
            <button className="col-add-card-btn" onClick={() => setShowAddCard(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add card
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Column;