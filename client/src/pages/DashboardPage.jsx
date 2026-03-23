import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as boardsApi from '../api/boards.api';
import Avatar from '../components/common/Avatar';

const styles = `
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
    --success: #34d399;
    --radius: 14px;
    --radius-sm: 8px;
    --radius-lg: 20px;
  }

  .dash-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Sora', sans-serif;
    color: var(--text-1);
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background blobs */
  .dash-root::before {
    content: '';
    position: fixed;
    top: -200px;
    left: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .dash-root::after {
    content: '';
    position: fixed;
    bottom: -150px;
    right: -150px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Navbar ── */
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 64px;
    background: rgba(10,10,15,0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-logo-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px var(--accent-glow);
  }

  .nav-logo-text {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.3px;
    color: var(--text-1);
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-user-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
  }

  .btn-logout {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-logout:hover {
    color: var(--text-1);
    border-color: var(--border-hover);
    background: var(--surface-2);
  }

  /* ── Main ── */
  .main {
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin: 0 auto;
    padding: 48px 32px 80px;
  }

  /* ── Page header ── */
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.8px;
    color: var(--text-1);
    line-height: 1;
    margin-bottom: 6px;
  }

  .page-subtitle {
    font-size: 13px;
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 400;
    letter-spacing: 0;
  }

  .count-chip {
    display: inline-flex;
    align-items: center;
    background: var(--accent-soft);
    color: var(--accent-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 20px;
    margin-left: 8px;
    border: 1px solid rgba(108,99,255,0.2);
  }

  /* ── Primary button ── */
  .btn-primary {
    font-family: 'Sora', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 0 0 var(--accent-glow);
    letter-spacing: 0.1px;
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 24px var(--accent-glow);
  }
  .btn-primary:active {
    transform: translateY(0);
  }

  /* ── Error banner ── */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding: 12px 16px;
    background: var(--danger-soft);
    border: 1px solid rgba(255,77,109,0.2);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: #ff8099;
    animation: slideDown 0.2s ease;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .modal {
    width: 100%;
    max-width: 440px;
    background: var(--surface);
    border: 1px solid var(--border-hover);
    border-radius: var(--radius-lg);
    padding: 28px;
    animation: scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }

  .modal-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-1);
    letter-spacing: -0.4px;
    margin-bottom: 22px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 8px;
  }

  .form-label span {
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
    color: var(--text-3);
    margin-left: 4px;
  }

  .form-input {
    font-family: 'Sora', sans-serif;
    width: 100%;
    padding: 11px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-1);
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .form-input::placeholder {
    color: var(--text-3);
  }
  .form-input:focus {
    border-color: var(--accent);
    background: var(--surface-3);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  textarea.form-input {
    resize: none;
    line-height: 1.6;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 24px;
  }

  .btn-ghost {
    font-family: 'Sora', sans-serif;
    flex: 1;
    padding: 10px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-ghost:hover {
    color: var(--text-1);
    background: var(--surface-2);
    border-color: var(--border-hover);
  }

  .btn-submit {
    font-family: 'Sora', sans-serif;
    flex: 1;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 12px var(--accent-glow);
  }
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px var(--accent-glow);
  }
  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Loading ── */
  .loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 100px 0;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--surface-3);
    border-top-color: var(--accent);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--text-3);
  }

  /* ── Empty state ── */
  .empty-state {
    text-align: center;
    padding: 100px 0;
    animation: fadeIn 0.4s ease;
  }

  .empty-icon-wrap {
    width: 72px;
    height: 72px;
    border-radius: var(--radius);
    background: var(--surface-2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 6px;
  }

  .empty-subtitle {
    font-size: 13px;
    color: var(--text-2);
    margin-bottom: 24px;
  }

  /* ── Boards grid ── */
  .boards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  /* ── Board card ── */
  .board-card {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px;
    cursor: pointer;
    transition: all 0.25s ease;
    overflow: hidden;
    animation: cardIn 0.35s ease both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .board-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--accent-soft), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .board-card:hover {
    border-color: rgba(108,99,255,0.35);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(108,99,255,0.1);
  }

  .board-card:hover::before {
    opacity: 1;
  }

  /* Staggered animation */
  .board-card:nth-child(1)  { animation-delay: 0.03s; }
  .board-card:nth-child(2)  { animation-delay: 0.06s; }
  .board-card:nth-child(3)  { animation-delay: 0.09s; }
  .board-card:nth-child(4)  { animation-delay: 0.12s; }
  .board-card:nth-child(5)  { animation-delay: 0.15s; }
  .board-card:nth-child(6)  { animation-delay: 0.18s; }

  .board-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .board-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 16px var(--accent-glow);
    flex-shrink: 0;
  }

  .board-delete-btn {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-sm);
    background: transparent;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-3);
    opacity: 0;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .board-card:hover .board-delete-btn {
    opacity: 1;
  }

  .board-delete-btn:hover {
    background: var(--danger-soft) !important;
    border-color: rgba(255,77,109,0.2) !important;
    color: var(--danger) !important;
  }

  .board-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-1);
    letter-spacing: -0.3px;
    margin-bottom: 6px;
    padding-right: 4px;
    line-height: 1.3;
  }

  .board-description {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 18px;
  }

  .board-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .member-stack {
    display: flex;
    align-items: center;
  }

  .member-stack > * {
    margin-left: -6px;
  }
  .member-stack > *:first-child {
    margin-left: 0;
  }

  .member-overflow {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--surface-3);
    border: 2px solid var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
  }

  .board-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-3);
    letter-spacing: 0;
  }

  /* ── Divider ── */
  .section-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .section-divider-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-3);
    white-space: nowrap;
  }
  .section-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .navbar { padding: 0 16px; }
    .main { padding: 32px 16px 60px; }
    .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .boards-grid { grid-template-columns: 1fr; }
    .nav-user-name { display: none; }
  }
`;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await boardsApi.getBoards();
        setBoards(res.data.data);
      } catch {
        setError('Failed to load boards');
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBoard.title.trim()) return;
    setCreating(true);
    try {
      const res = await boardsApi.createBoard(newBoard);
      setBoards((prev) => [res.data.data, ...prev]);
      setNewBoard({ title: '', description: '' });
      setShowCreate(false);
    } catch {
      setError('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, boardId) => {
    e.stopPropagation();
    if (!confirm('Delete this board and all its contents?')) return;
    try {
      await boardsApi.deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
    } catch {
      setError('Failed to delete board');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root">

        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="nav-logo-text">Flowboard</span>
          </div>

          <div className="nav-actions">
            <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
            <span className="nav-user-name">{user?.name}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </nav>

        {/* Main content */}
        <main className="main">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                My Boards
                <span className="count-chip">{boards.length}</span>
              </h1>
              <p className="page-subtitle">
                {loading ? 'Loading...' : `${boards.length} workspace${boards.length !== 1 ? 's' : ''} active`}
              </p>
            </div>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Board
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Modal */}
          {showCreate && (
            <div className="modal-overlay" onClick={() => setShowCreate(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Create a new board</h2>

                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label className="form-label">Board title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newBoard.title}
                      onChange={(e) => setNewBoard((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Product Roadmap"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Description <span>(optional)</span>
                    </label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={newBoard.description}
                      onChange={(e) => setNewBoard((p) => ({ ...p, description: e.target.value }))}
                      placeholder="What is this board for?"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={creating}>
                      {creating ? 'Creating…' : 'Create board'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* States */}
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <span className="loading-text">Fetching your boards…</span>
            </div>
          ) : boards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="empty-title">No boards yet</p>
              <p className="empty-subtitle">Create your first board to get started</p>
              <button className="btn-primary" onClick={() => setShowCreate(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create board
              </button>
            </div>
          ) : (
            <>
              <div className="section-divider">
                <span className="section-divider-label">All boards</span>
                <div className="section-divider-line" />
              </div>
              <div className="boards-grid">
                {boards.map((board) => (
                  <div
                    key={board._id}
                    className="board-card"
                    onClick={() => navigate(`/board/${board._id}`)}
                  >
                    <div className="board-card-top">
                      <div className="board-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <button
                        className="board-delete-btn"
                        onClick={(e) => handleDelete(e, board._id)}
                        title="Delete board"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>

                    <h3 className="board-title">{board.title}</h3>
                    {board.description && (
                      <p className="board-description">{board.description}</p>
                    )}

                    <div className="board-footer">
                      <div className="member-stack">
                        {board.members.slice(0, 4).map((member) => (
                          <Avatar
                            key={member._id}
                            name={member.name}
                            avatar={member.avatar}
                            size="sm"
                          />
                        ))}
                        {board.members.length > 4 && (
                          <div className="member-overflow">
                            +{board.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="board-date">
                        {new Date(board.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default DashboardPage;