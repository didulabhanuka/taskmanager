import ActivityItem from './ActivityItem';

const feedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --surface: #111118;
    --surface-2: #18181f;
    --surface-3: #1e1e28;
    --border: rgba(255,255,255,0.06);
    --accent: #6c63ff;
    --accent-2: #a78bfa;
    --accent-soft: rgba(108,99,255,0.1);
    --text-1: #f0f0f8;
    --text-2: #8888aa;
    --text-3: #44445a;
  }

  .feed-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'Sora', sans-serif;
  }

  /* ── Empty ── */
  .feed-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px 20px;
    text-align: center;
  }

  .feed-empty-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-3);
  }

  .feed-empty-text {
    font-size: 12px;
    color: var(--text-3);
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.3px;
  }

  /* ── List ── */
  .feed-list {
    display: flex;
    flex-direction: column;
  }

  /* ── Scrollable area ── */
  .feed-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }
  .feed-scroll::-webkit-scrollbar { width: 3px; }
  .feed-scroll::-webkit-scrollbar-track { background: transparent; }
  .feed-scroll::-webkit-scrollbar-thumb {
    background: var(--surface-3);
    border-radius: 2px;
  }
`;

const ActivityFeed = ({ activities }) => {
  return (
    <>
      <style>{feedStyles}</style>
      <div className="feed-root">
        <div className="feed-scroll">
          {activities.length === 0 ? (
            <div className="feed-empty">
              <div className="feed-empty-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <span className="feed-empty-text">no activity yet</span>
            </div>
          ) : (
            <div className="feed-list">
              {activities.map((activity) => (
                <ActivityItem key={activity._id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityFeed;