import { formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';

const itemStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --surface-2: #18181f;
    --surface-3: #1e1e28;
    --border: rgba(255,255,255,0.06);
    --accent: #6c63ff;
    --accent-2: #a78bfa;
    --accent-soft: rgba(108,99,255,0.1);
    --text-1: #f0f0f8;
    --text-2: #8888aa;
    --text-3: #44445a;
    --success: #34d399;
    --danger: #ff4d6d;
    --warn: #f59e0b;
  }

  .ai-root {
    display: flex;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s ease;
    font-family: 'Sora', sans-serif;
    position: relative;
  }
  .ai-root:hover { background: var(--surface-2); }
  .ai-root:last-child { border-bottom: none; }

  /* Timeline line */
  .ai-root::before {
    content: '';
    position: absolute;
    left: 36px;
    top: 44px;
    bottom: -1px;
    width: 1px;
    background: var(--border);
    pointer-events: none;
  }
  .ai-root:last-child::before { display: none; }

  .ai-avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  /* Action type dot */
  .ai-action-dot {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--surface-2);
    transition: border-color 0.15s;
  }
  .ai-root:hover .ai-action-dot { border-color: var(--surface-2); }

  .ai-dot-create  { background: var(--success); }
  .ai-dot-move    { background: var(--accent-2); }
  .ai-dot-update  { background: var(--warn); }
  .ai-dot-delete  { background: var(--danger); }
  .ai-dot-default { background: var(--text-3); }

  .ai-content {
    flex: 1;
    min-width: 0;
  }

  .ai-text {
    font-size: 12px;
    color: var(--text-2);
    line-height: 1.55;
  }

  .ai-name {
    font-weight: 600;
    color: var(--text-1);
  }

  .ai-highlight {
    font-weight: 500;
    color: var(--text-1);
    background: var(--surface-3);
    padding: 0 4px;
    border-radius: 4px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
  }

  .ai-time {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--text-3);
  }
`;

const actionConfig = {
  'card.created': { dot: 'create',  verb: 'created',  prep: 'in' },
  'card.moved':   { dot: 'move',    verb: 'moved',    prep: 'to' },
  'card.updated': { dot: 'update',  verb: 'updated',  prep: null },
  'card.deleted': { dot: 'delete',  verb: 'deleted',  prep: null },
  'column.created': { dot: 'create', verb: 'created', prep: null },
};

const ActionText = ({ activity }) => {
  const { action, meta } = activity;
  const config = actionConfig[action];

  if (!config) return <span>{action}</span>;

  if (action === 'card.created') return (
    <>
      {config.verb} <span className="ai-highlight">{meta?.cardTitle}</span>
      {' '}in <span className="ai-highlight">{meta?.columnTitle}</span>
    </>
  );
  if (action === 'card.moved') return (
    <>
      {config.verb} <span className="ai-highlight">{meta?.cardTitle}</span>
      {' '}to <span className="ai-highlight">{meta?.toColumnTitle}</span>
    </>
  );
  if (action === 'card.updated') return (
    <>updated <span className="ai-highlight">{meta?.cardTitle}</span></>
  );
  if (action === 'card.deleted') return (
    <>deleted <span className="ai-highlight">{meta?.cardTitle}</span></>
  );
  if (action === 'column.created') return (
    <>created column <span className="ai-highlight">{meta?.columnTitle}</span></>
  );

  return <span>{action}</span>;
};

const ActivityItem = ({ activity }) => {
  const user = activity.userId;
  const config = actionConfig[activity.action];
  const dotClass = `ai-action-dot ai-dot-${config?.dot ?? 'default'}`;

  return (
    <>
      <style>{itemStyles}</style>
      <div className="ai-root">
        <div className="ai-avatar-wrap">
          <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
          <span className={dotClass} />
        </div>

        <div className="ai-content">
          <p className="ai-text">
            <span className="ai-name">{user?.name} </span>
            <ActionText activity={activity} />
          </p>
          <p className="ai-time">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </>
  );
};

export default ActivityItem;