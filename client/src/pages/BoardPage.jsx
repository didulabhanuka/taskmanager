import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import throttle from 'lodash.throttle';
import { useAuth } from '../context/AuthContext';
import { BoardProvider, useBoard } from '../context/BoardContext';
import Board from '../components/Board/Board';
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';
import PresenceBar from '../components/Presence/PresenceBar';
import UserCursor from '../components/Presence/UserCursor';
import AddMember from '../components/Board/AddMember';
import BoardInfo from '../components/Board/BoardInfo';

const boardPageStyles = `
  .bp-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
    font-family: 'Sora', sans-serif;
    color: var(--text-1);
  }

  /* ── Navbar ── */
  .bp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 56px;
    flex-shrink: 0;
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    z-index: 40;
  }

  .bp-nav-left {
    display: flex;
    align-items: center;
  }

  .bp-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px 6px 6px;
    border-radius: var(--radius-sm);
    background: transparent;
    border: none;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .bp-back-btn:hover {
    color: var(--text-1);
    background: var(--surface-2);
  }

  .bp-breadcrumb-sep {
    color: var(--text-3);
    font-size: 16px;
    margin: 0 6px;
    user-select: none;
  }

  .bp-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .bp-activity-btn {
    font-family: 'Sora', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s ease;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-2);
  }
  .bp-activity-btn:hover {
    border-color: var(--border-hover);
    color: var(--text-1);
    background: var(--surface-2);
  }
  .bp-activity-btn.active {
    background: var(--accent-soft);
    border-color: rgba(108, 99, 255, 0.3);
    color: var(--accent-2);
  }

  .bp-activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-2);
    animation: livePulse 2s ease infinite;
    flex-shrink: 0;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  .bp-logout-btn {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .bp-logout-btn:hover {
    color: var(--text-1);
    border-color: var(--border-hover);
    background: var(--surface-2);
  }

  /* ── Body ── */
  .bp-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* ── Board area ── */
  .bp-board-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  /* Top-fade depth effect */
  .bp-board-area::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 36px;
    background: linear-gradient(to bottom, rgba(10, 10, 15, 0.35), transparent);
    pointer-events: none;
    z-index: 2;
  }

  .bp-board-scroll {
    display: flex;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 24px 24px 24px;
    align-items: flex-start;
    scroll-behavior: smooth;
  }

  .bp-board-scroll::-webkit-scrollbar { height: 5px; }
  .bp-board-scroll::-webkit-scrollbar-track { background: transparent; }
  .bp-board-scroll::-webkit-scrollbar-thumb {
    background: var(--surface-3);
    border-radius: 3px;
  }
  .bp-board-scroll::-webkit-scrollbar-thumb:hover { background: var(--text-3); }

  /* ── Add Column ── */
  .bp-add-col-wrap {
    flex-shrink: 0;
    width: 280px;
    margin-left: 12px;
  }

  .bp-add-col-form {
    background: var(--surface);
    border: 1px solid var(--border-hover);
    border-radius: var(--radius);
    padding: 12px;
    animation: scaleInSpring 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .bp-add-col-input {
    font-family: 'Sora', sans-serif;
    width: 100%;
    padding: 9px 12px;
    background: var(--surface-2);
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    color: var(--text-1);
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    margin-bottom: 10px;
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .bp-add-col-input::placeholder { color: var(--text-3); }

  .bp-add-col-actions { display: flex; gap: 8px; }

  .bp-add-col-submit {
    font-family: 'Sora', sans-serif;
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.18s ease;
    box-shadow: 0 2px 10px var(--accent-glow);
  }
  .bp-add-col-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px var(--accent-glow);
  }

  .bp-add-col-cancel {
    font-family: 'Sora', sans-serif;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-2);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .bp-add-col-cancel:hover {
    color: var(--text-1);
    background: var(--surface-2);
    border-color: var(--border-hover);
  }

  .bp-add-col-trigger {
    font-family: 'Sora', sans-serif;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.08);
    color: var(--text-3);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .bp-add-col-trigger:hover {
    border-color: rgba(108, 99, 255, 0.4);
    color: var(--accent-2);
    background: var(--accent-soft);
  }

  /* ── Activity sidebar ── */
  .bp-activity-sidebar {
    flex-shrink: 0;
    width: 300px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface);
    border-left: 1px solid var(--border);
    animation: slideInRight 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .bp-activity-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .bp-activity-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
  }

  .bp-activity-close {
    width: 26px;
    height: 26px;
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
  .bp-activity-close:hover {
    background: var(--surface-2);
    color: var(--text-1);
  }

  .bp-activity-body {
    flex: 1;
    overflow-y: auto;
  }
  .bp-activity-body::-webkit-scrollbar { width: 3px; }
  .bp-activity-body::-webkit-scrollbar-track { background: transparent; }
  .bp-activity-body::-webkit-scrollbar-thumb {
    background: var(--surface-3);
    border-radius: 2px;
  }
`;

/* ── AddColumnButton ── */
const AddColumnButton = ({ boardId }) => {
  const { createColumn } = useBoard();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    createColumn(title.trim(), boardId);
    setTitle('');
    setShow(false);
  };

  return (
    <div className="bp-add-col-wrap">
      {show ? (
        <form className="bp-add-col-form" onSubmit={handleSubmit}>
          <input
            autoFocus
            className="bp-add-col-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setShow(false)}
            placeholder="Column title…"
          />
          <div className="bp-add-col-actions">
            <button type="submit" className="bp-add-col-submit">Add column</button>
            <button type="button" className="bp-add-col-cancel" onClick={() => setShow(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="bp-add-col-trigger" onClick={() => setShow(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add column
        </button>
      )}
    </div>
  );
};

/* ── BoardContent ── */
const BoardContent = ({ boardId }) => {
  const { state, onlineUsers, cursors, socketRef, dispatch } = useBoard();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showActivity, setShowActivity] = useState(false);
  const boardAreaRef = useRef(null);

  // Update board state when members change
  const handleBoardUpdate = (updatedBoard) => {
    dispatch({ type: 'BOARD_LOADED', payload: {
      board: updatedBoard,
      columns: Object.values(state.columns),
      cards: Object.values(state.cards),
    }});
  };

  // Throttled cursor emit — 50ms = 20fps, prevents socket spam
  const emitCursor = useCallback(
    throttle((x, y) => {
      socketRef.current?.emit('cursor:move', { boardId, x, y });
    }, 50),
    [boardId, socketRef]
  );

  const handleMouseMove = (e) => {
    const el = boardAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Normalise to 0–1 so cursors work at any screen size
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    emitCursor(x, y);
  };

  return (
    <div className="bp-root">

      {/* Navbar */}
      <nav className="bp-nav">
        <div className="bp-nav-left">
          <button className="bp-back-btn" onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Boards
          </button>
          <span className="bp-breadcrumb-sep">/</span>
          <BoardInfo board={state.board} onUpdate={handleBoardUpdate} />
        </div>

        <div className="bp-nav-right">
          <PresenceBar users={onlineUsers} />

          <AddMember board={state.board} onUpdate={handleBoardUpdate} />

          <button
            className={`bp-activity-btn ${showActivity ? 'active' : ''}`}
            onClick={() => setShowActivity((p) => !p)}
          >
            {showActivity
              ? <span className="bp-activity-dot" />
              : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )
            }
            Activity
          </button>

          <button className="bp-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* Body — cursor tracking lives here so coords are relative to this element */}
      <div
        ref={boardAreaRef}
        className="bp-body"
        onMouseMove={handleMouseMove}
      >
        {/* Board scroll */}
        <div className="bp-board-area">
          <div className="bp-board-scroll">
            <Board boardId={boardId} />
            <AddColumnButton boardId={boardId} />
          </div>
        </div>

        {/* Activity sidebar */}
        {showActivity && (
          <aside className="bp-activity-sidebar">
            <div className="bp-activity-header">
              <span className="bp-activity-title">
                <span className="bp-activity-dot" />
                Activity
              </span>
              <button className="bp-activity-close" onClick={() => setShowActivity(false)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="bp-activity-body">
              <ActivityFeed activities={state.activities} />
            </div>
          </aside>
        )}

        {/* Live cursors — absolute within bp-body so x/y match the tracked rect */}
        {Object.entries(cursors).map(([userId, cursor]) => (
          <UserCursor
            key={userId}
            userId={userId}
            name={cursor.name}
            avatar={cursor.avatar}
            x={cursor.x}
            y={cursor.y}
          />
        ))}
      </div>
    </div>
  );
};

/* ── BoardPage (outer) ── */
const BoardPage = () => {
  const { boardId } = useParams();
  return (
    <>
      <style>{boardPageStyles}</style>
      <BoardProvider boardId={boardId}>
        <BoardContent boardId={boardId} />
      </BoardProvider>
    </>
  );
};

export default BoardPage;