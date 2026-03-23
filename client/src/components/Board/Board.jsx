import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import Column from '../Column/Column';
import Card from '../Card/Card';
import { useBoard } from '../../context/BoardContext';

const boardCompStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface-2: #18181f;
    --surface-3: #1e1e28;
    --border: rgba(255,255,255,0.06);
    --accent: #6c63ff;
    --accent-2: #a78bfa;
    --accent-glow: rgba(108,99,255,0.3);
    --text-1: #f0f0f8;
    --text-2: #8888aa;
    --text-3: #44445a;
    --danger: #ff4d6d;
  }

  /* ── Board container ── */
  .board-comp-root {
    display: flex;
    align-items: flex-start;
    padding: 8px 0 24px 24px;
    flex: 1;
    min-width: 0;
    font-family: 'Sora', sans-serif;
  }

  /* ── Loading ── */
  .board-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 14px;
    min-height: 300px;
  }

  .board-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--surface-3);
    border-top-color: var(--accent);
    animation: boardSpin 0.65s linear infinite;
  }
  @keyframes boardSpin { to { transform: rotate(360deg); } }

  .board-loading-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-3);
    letter-spacing: 0.5px;
  }

  /* ── Error ── */
  .board-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255,77,109,0.08);
    border: 1px solid rgba(255,77,109,0.2);
    border-radius: 10px;
    font-size: 13px;
    color: #ff8099;
    margin: 24px;
  }

  /* ── Drag overlay ghost ── */
  .drag-overlay-card {
    font-family: 'Sora', sans-serif;
    background: var(--surface-3);
    border: 1px solid rgba(108,99,255,0.5);
    border-radius: 10px;
    padding: 11px 12px;
    width: 264px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.2);
    transform: rotate(1.5deg);
    cursor: grabbing;
    backdrop-filter: blur(4px);
  }

  .drag-overlay-title {
    font-size: 13px;
    color: var(--text-1);
    line-height: 1.5;
  }

  .drag-overlay-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--accent-2);
    background: rgba(108,99,255,0.12);
    border-radius: 4px;
    padding: 2px 6px;
  }
`;

const Board = ({ boardId }) => {
  const { state, moveCard } = useBoard();
  const { columns, cards, loading, error } = state;
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const onDragStart = ({ active }) => {
    const card = Object.values(cards).find((c) => c._id === active.id);
    if (card) setActiveCard(card);
  };

  const onDragEnd = ({ active, over }) => {
    setActiveCard(null);
    if (!over) return;

    const cardId = active.id;
    const overId = over.id;
    const overCard = Object.values(cards).find((c) => c._id === overId);
    const overColumnId = overCard ? overCard.columnId : overId;
    const activeCardItem = Object.values(cards).find((c) => c._id === cardId);
    if (!activeCardItem) return;

    const cardsInTargetColumn = Object.values(cards)
      .filter((c) => c.columnId === overColumnId && c._id !== cardId)
      .sort((a, b) => a.order - b.order);

    const newOrder = (overCard && overCard._id !== cardId)
      ? overCard.order
      : cardsInTargetColumn.length;

    moveCard(cardId, overColumnId, newOrder);
  };

  if (loading) {
    return (
      <>
        <style>{boardCompStyles}</style>
        <div className="board-loading">
          <div className="board-spinner" />
          <span className="board-loading-text">Loading board…</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{boardCompStyles}</style>
        <div className="board-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      </>
    );
  }

  const sortedColumns = Object.values(columns).sort((a, b) => a.order - b.order);
  const getColumnCards = (columnId) =>
    Object.values(cards).filter((card) => card.columnId === columnId);

  return (
    <>
      <style>{boardCompStyles}</style>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="board-comp-root">
          {sortedColumns.map((column) => (
            <Column
              key={column._id}
              column={column}
              cards={getColumnCards(column._id)}
              boardId={boardId}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          duration: 180,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeCard ? (
            <div className="drag-overlay-card">
              <p className="drag-overlay-title">{activeCard.title}</p>
              <span className="drag-overlay-badge">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 9l4 4 10-10" />
                </svg>
                moving
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default Board;