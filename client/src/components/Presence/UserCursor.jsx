import Avatar from '../common/Avatar';

const cursorStyles = `
  .ucursor-root {
    position: absolute;
    pointer-events: none;
    z-index: 9999;
    will-change: left, top;
    transition: left 75ms linear, top 75ms linear;
  }

  .ucursor-inner {
    position: relative;
    width: 0;
    height: 0;
  }

  .ucursor-svg {
    position: absolute;
    top: 0;
    left: 0;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
  }

  .ucursor-tag {
    position: absolute;
    top: 17px;
    left: 13px;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px 3px 4px;
    border-radius: 20px;
    white-space: nowrap;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.1px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
    animation: cursorTagIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes cursorTagIn {
    from { opacity: 0; transform: scale(0.75); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

/* Six distinct gradient pairs — assigned by hashing the last char of userId */
const CURSOR_PALETTES = [
  { from: '#6c63ff', to: '#a78bfa' }, // indigo-violet (accent)
  { from: '#ec4899', to: '#f472b6' }, // pink
  { from: '#14b8a6', to: '#34d399' }, // teal-green
  { from: '#f59e0b', to: '#fcd34d' }, // amber
  { from: '#ef4444', to: '#f87171' }, // red
  { from: '#3b82f6', to: '#60a5fa' }, // blue
];

const paletteFor = (userId = '') => {
  const code = userId.charCodeAt(userId.length - 1) || 0;
  return CURSOR_PALETTES[code % CURSOR_PALETTES.length];
};

const UserCursor = ({ name, avatar, x, y, userId }) => {
  const { from, to } = paletteFor(userId);
  const gradient = `linear-gradient(135deg, ${from}, ${to})`;

  return (
    <>
      <style>{cursorStyles}</style>
      <div
        className="ucursor-root"
        style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      >
        <div className="ucursor-inner">
          {/* SVG cursor arrow */}
          <svg
            className="ucursor-svg"
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L0 16L4.5 12L7.5 19L9.5 18.2L6.5 11L12 11L0 0Z"
              fill={from}
            />
            <path
              d="M0 0L0 16L4.5 12L7.5 19L9.5 18.2L6.5 11L12 11L0 0Z"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="0.5"
            />
          </svg>

          {/* Name tag */}
          <div className="ucursor-tag" style={{ background: gradient }}>
            <Avatar name={name} avatar={avatar} size="sm" style={{ width: 16, height: 16 }} />
            <span>{name}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserCursor;