import Avatar from '../common/Avatar';

const presenceStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --surface-2: #18181f;
    --surface-3: #1e1e28;
    --border: rgba(255,255,255,0.06);
    --border-hover: rgba(255,255,255,0.12);
    --accent: #6c63ff;
    --accent-2: #a78bfa;
    --accent-soft: rgba(108,99,255,0.1);
    --text-1: #f0f0f8;
    --text-2: #8888aa;
    --text-3: #44445a;
    --success: #34d399;
  }

  .presence-root {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Sora', sans-serif;
  }

  /* Live indicator */
  .presence-live {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: var(--text-3);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .presence-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px rgba(52,211,153,0.6);
    animation: livePulse 2s ease infinite;
    flex-shrink: 0;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(0.85); }
  }

  /* Avatar stack */
  .presence-stack {
    display: flex;
    align-items: center;
  }
  .presence-stack > * { margin-left: -5px; }
  .presence-stack > *:first-child { margin-left: 0; }

  /* Individual user wrapper for tooltip */
  .presence-user {
    position: relative;
    cursor: default;
  }

  .presence-avatar-ring {
    display: block;
    border-radius: 50%;
    border: 2px solid rgba(10,10,15,0.9);
    transition: transform 0.15s ease, z-index 0s;
    position: relative;
    z-index: 1;
  }
  .presence-user:hover .presence-avatar-ring {
    transform: translateY(-3px);
    z-index: 10;
  }

  /* Online status ring glow */
  .presence-avatar-ring::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    border: 1.5px solid rgba(52,211,153,0.4);
    pointer-events: none;
  }

  /* Tooltip */
  .presence-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-2);
    border: 1px solid var(--border-hover);
    border-radius: 7px;
    padding: 5px 9px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
    transform: translateX(-50%) translateY(4px);
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }

  .presence-user:hover .presence-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .presence-tooltip-name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-1);
    display: block;
  }

  .presence-tooltip-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: var(--success);
    display: block;
    margin-top: 1px;
  }

  /* Tooltip arrow */
  .presence-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--border-hover);
  }

  /* Overflow badge */
  .presence-overflow {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--surface-3);
    border: 2px solid rgba(10,10,15,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    color: var(--text-2);
    flex-shrink: 0;
    margin-left: -5px;
  }
`;

const PresenceBar = ({ users }) => {
  if (!users || users.length === 0) return null;

  const visible = users.slice(0, 5);
  const overflow = users.length - 5;

  return (
    <>
      <style>{presenceStyles}</style>
      <div className="presence-root">
        <span className="presence-live">
          <span className="presence-live-dot" />
          {users.length} online
        </span>

        <div className="presence-stack">
          {visible.map((user) => (
            <div key={user._id} className="presence-user">
              <span className="presence-avatar-ring">
                <Avatar name={user.name} avatar={user.avatar} size="sm" />
              </span>
              <div className="presence-tooltip">
                <span className="presence-tooltip-name">{user.name}</span>
                <span className="presence-tooltip-status">● active now</span>
              </div>
            </div>
          ))}
          {overflow > 0 && (
            <div className="presence-overflow">+{overflow}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default PresenceBar;