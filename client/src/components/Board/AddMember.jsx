import { useState, useEffect, useRef } from 'react';
import * as boardsApi from '../../api/boards.api';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

const addMemberStyles = `
  .am-wrap {
    position: relative;
    font-family: 'Sora', sans-serif;
  }

  /* ── Trigger button ── */
  .am-trigger {
    font-family: 'Sora', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    background: transparent;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .am-trigger:hover,
  .am-trigger.open {
    color: var(--text-1);
    background: var(--surface-2);
    border-color: var(--border-hover);
  }

  /* ── Dropdown panel ── */
  .am-panel {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 288px;
    background: var(--surface);
    border: 1px solid var(--border-hover);
    border-radius: var(--radius-lg);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.03);
    z-index: 200;
    overflow: hidden;
    animation: amPanelIn 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes amPanelIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Panel header ── */
  .am-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .am-header-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-1);
    letter-spacing: -0.1px;
  }

  .am-header-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-3);
    background: var(--surface-3);
    border-radius: 5px;
    padding: 1px 6px;
  }

  /* ── Member list ── */
  .am-list {
    padding: 8px 0;
    max-height: 220px;
    overflow-y: auto;
  }
  .am-list::-webkit-scrollbar { width: 3px; }
  .am-list::-webkit-scrollbar-track { background: transparent; }
  .am-list::-webkit-scrollbar-thumb {
    background: var(--surface-3);
    border-radius: 2px;
  }

  .am-member-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 14px;
    transition: background 0.12s ease;
  }
  .am-member-row:hover { background: var(--surface-2); }

  .am-member-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .am-member-info {
    min-width: 0;
  }

  .am-member-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .am-member-role {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    margin-top: 1px;
  }
  .am-member-role.owner {
    color: var(--accent-2);
  }
  .am-member-role.member {
    color: var(--text-3);
  }

  .am-remove-btn {
    font-family: 'Sora', sans-serif;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-3);
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    opacity: 0;
  }
  .am-member-row:hover .am-remove-btn { opacity: 1; }
  .am-remove-btn:hover {
    color: var(--danger);
    background: var(--danger-soft);
    border-color: rgba(255, 77, 109, 0.2);
  }

  /* ── Invite section ── */
  .am-invite {
    border-top: 1px solid var(--border);
    padding: 12px 14px 14px;
  }

  .am-invite-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--text-3);
    margin-bottom: 8px;
  }

  .am-error {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #ff8099;
    background: var(--danger-soft);
    border: 1px solid rgba(255, 77, 109, 0.2);
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
    animation: shake 0.3s ease;
  }

  .am-input-row {
    display: flex;
    gap: 7px;
  }

  .am-email-input {
    font-family: 'Sora', sans-serif;
    flex: 1;
    padding: 8px 10px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-1);
    font-size: 12px;
    outline: none;
    transition: all 0.18s ease;
    min-width: 0;
  }
  .am-email-input::placeholder { color: var(--text-3); }
  .am-email-input:focus {
    border-color: var(--accent);
    background: var(--surface-3);
    box-shadow: 0 0 0 2px var(--accent-soft);
  }

  .am-invite-btn {
    font-family: 'Sora', sans-serif;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.18s ease;
    box-shadow: 0 2px 8px var(--accent-glow);
    white-space: nowrap;
  }
  .am-invite-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px var(--accent-glow);
  }
  .am-invite-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .am-btn-spinner {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    animation: spin 0.6s linear infinite;
  }
`;

const AddMember = ({ board, onUpdate }) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  const isOwner = board?.owner?._id === user?._id;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShow(false);
        setError('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await boardsApi.addMember(board._id, email.trim());
      onUpdate(res.data.data);
      setEmail('');
      setShow(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await boardsApi.removeMember(board._id, memberId);
      onUpdate(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (!board) return null;

  return (
    <>
      <style>{addMemberStyles}</style>
      <div className="am-wrap" ref={dropdownRef}>

        {/* Trigger */}
        <button
          className={`am-trigger ${show ? 'open' : ''}`}
          onClick={() => setShow((p) => !p)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          Members
        </button>

        {/* Dropdown */}
        {show && (
          <div className="am-panel">

            {/* Header */}
            <div className="am-header">
              <span className="am-header-title">Board members</span>
              <span className="am-header-count">{board.members?.length ?? 0}</span>
            </div>

            {/* Member list */}
            <div className="am-list">
              {board.members?.map((member) => {
                const isThisOwner = member._id === board.owner?._id;
                return (
                  <div key={member._id} className="am-member-row">
                    <div className="am-member-left">
                      <Avatar name={member.name} avatar={member.avatar} size="sm" />
                      <div className="am-member-info">
                        <p className="am-member-name">{member.name}</p>
                        <span className={`am-member-role ${isThisOwner ? 'owner' : 'member'}`}>
                          {isThisOwner ? (
                            <>
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              Owner
                            </>
                          ) : 'Member'}
                        </span>
                      </div>
                    </div>

                    {isOwner && !isThisOwner && (
                      <button
                        className="am-remove-btn"
                        onClick={() => handleRemove(member._id)}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Invite section — owner only */}
            {isOwner && (
              <div className="am-invite">
                <p className="am-invite-label">Invite by email</p>

                {error && (
                  <div className="am-error">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                <form className="am-input-row" onSubmit={handleAdd}>
                  <input
                    type="email"
                    className="am-email-input"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="colleague@example.com"
                    autoComplete="off"
                  />
                  <button type="submit" className="am-invite-btn" disabled={loading}>
                    {loading ? (
                      <span className="am-btn-spinner" />
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                    Invite
                  </button>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
};

export default AddMember;