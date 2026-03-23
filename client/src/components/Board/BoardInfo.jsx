import { useState, useEffect, useRef } from 'react';
import * as boardsApi from '../../api/boards.api';
import { useAuth } from '../../context/AuthContext';

const boardInfoStyles = `
  .bi-wrap {
    position: relative;
    font-family: 'Sora', sans-serif;
  }

  /* ── Trigger ── */
  .bi-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 7px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .bi-trigger:hover,
  .bi-trigger.open {
    background: var(--surface-2);
  }

  .bi-trigger-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-1);
    letter-spacing: -0.2px;
    white-space: nowrap;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bi-edit-icon {
    color: var(--text-3);
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
  }
  .bi-trigger:hover .bi-edit-icon { opacity: 1; }

  /* ── Panel ── */
  .bi-panel {
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    width: 300px;
    background: var(--surface);
    border: 1px solid var(--border-hover);
    border-radius: var(--radius-lg);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
    z-index: 200;
    overflow: hidden;
    animation: biPanelIn 0.2s cubic-bezier(0.22,1,0.36,1);
  }

  @keyframes biPanelIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Panel header ── */
  .bi-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .bi-panel-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
    letter-spacing: -0.1px;
  }

  .bi-owner-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: var(--text-3);
    background: var(--surface-3);
    border-radius: 5px;
    padding: 2px 7px;
  }

  /* ── Panel body ── */
  .bi-panel-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Error ── */
  .bi-error {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #ff8099;
    background: var(--danger-soft);
    border: 1px solid rgba(255,77,109,0.2);
    border-radius: 6px;
    padding: 7px 10px;
    animation: shake 0.3s ease;
  }

  /* ── Field ── */
  .bi-field { display: flex; flex-direction: column; gap: 6px; }

  .bi-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--text-3);
  }
  .bi-label span {
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
    font-size: 10px;
    color: var(--text-3);
    margin-left: 4px;
  }

  .bi-input,
  .bi-textarea {
    font-family: 'Sora', sans-serif;
    width: 100%;
    padding: 9px 11px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-1);
    font-size: 13px;
    outline: none;
    transition: all 0.18s ease;
    box-sizing: border-box;
  }
  .bi-input::placeholder,
  .bi-textarea::placeholder { color: var(--text-3); }
  .bi-input:focus,
  .bi-textarea:focus {
    border-color: var(--accent);
    background: var(--surface-3);
    box-shadow: 0 0 0 2px var(--accent-soft);
  }
  .bi-input:disabled,
  .bi-textarea:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .bi-textarea {
    resize: none;
    line-height: 1.55;
  }

  /* ── Footer ── */
  .bi-panel-footer {
    padding: 0 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .bi-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-3);
    font-family: 'JetBrains Mono', monospace;
  }

  .bi-actions {
    display: flex;
    gap: 8px;
  }

  .bi-cancel-btn {
    font-family: 'Sora', sans-serif;
    flex: 1;
    padding: 9px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-2);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .bi-cancel-btn:hover {
    color: var(--text-1);
    background: var(--surface-2);
    border-color: var(--border-hover);
  }

  .bi-save-btn {
    font-family: 'Sora', sans-serif;
    flex: 1;
    padding: 9px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.18s ease;
    box-shadow: 0 2px 8px var(--accent-glow);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .bi-save-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px var(--accent-glow);
  }
  .bi-save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .bi-save-btn.saved {
    background: linear-gradient(135deg, #059669, var(--success));
    box-shadow: 0 2px 8px rgba(52,211,153,0.3);
  }

  .bi-btn-spinner {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    animation: spin 0.6s linear infinite;
  }

  /* Read-only view for non-owners */
  .bi-readonly-value {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.5;
  }
  .bi-readonly-value.empty { color: var(--text-3); font-style: italic; }
`;

const BoardInfo = ({ board, onUpdate }) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const dropdownRef = useRef(null);

  const isOwner = board?.owner?._id === user?._id;

  // Sync local state when board prop changes
  useEffect(() => {
    setTitle(board?.title || '');
    setDescription(board?.description || '');
  }, [board]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShow(false);
        setError('');
        setTitle(board?.title || '');
        setDescription(board?.description || '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [board]);

  const reset = () => {
    setShow(false);
    setTitle(board?.title || '');
    setDescription(board?.description || '');
    setError('');
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title cannot be empty'); return; }
    const unchanged = title.trim() === board?.title && description.trim() === (board?.description || '');
    if (unchanged) { setShow(false); return; }

    setLoading(true);
    setError('');
    try {
      const res = await boardsApi.updateBoard(board._id, {
        title: title.trim(),
        description: description.trim(),
      });
      onUpdate(res.data.data);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShow(false); }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update board');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') reset();
  };

  if (!board) return null;

  return (
    <>
      <style>{boardInfoStyles}</style>
      <div className="bi-wrap" ref={dropdownRef}>

        {/* Trigger */}
        <button
          className={`bi-trigger ${show ? 'open' : ''}`}
          onClick={() => setShow((p) => !p)}
          title="Board settings"
        >
          <span className="bi-trigger-title">{board.title}</span>
          {isOwner && (
            <svg className="bi-edit-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          )}
        </button>

        {/* Panel */}
        {show && (
          <div className="bi-panel">

            {/* Header */}
            <div className="bi-panel-header">
              <span className="bi-panel-title">Board settings</span>
              <span className="bi-owner-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {board.owner?.name}
              </span>
            </div>

            {/* Body */}
            <div className="bi-panel-body">
              {error && (
                <div className="bi-error">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Title field */}
              <div className="bi-field">
                <label className="bi-label">Title</label>
                {isOwner ? (
                  <input
                    type="text"
                    className="bi-input"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Board title"
                  />
                ) : (
                  <p className="bi-readonly-value">{board.title}</p>
                )}
              </div>

              {/* Description field */}
              <div className="bi-field">
                <label className="bi-label">
                  Description <span>(optional)</span>
                </label>
                {isOwner ? (
                  <textarea
                    className="bi-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What is this board for?"
                    rows={3}
                  />
                ) : (
                  <p className={`bi-readonly-value ${!board.description ? 'empty' : ''}`}>
                    {board.description || 'No description'}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bi-panel-footer">
              <div className="bi-meta">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {isOwner && (
                <div className="bi-actions">
                  <button className="bi-cancel-btn" onClick={reset}>Cancel</button>
                  <button
                    className={`bi-save-btn ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                    disabled={loading || saved}
                  >
                    {loading ? (
                      <><span className="bi-btn-spinner" /> Saving…</>
                    ) : saved ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Saved
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default BoardInfo;