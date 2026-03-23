// Reusable avatar component used across the app
const Avatar = ({ name, avatar, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  // Generate a consistent color from the name
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899',
    '#f59e0b', '#10b981', '#3b82f6',
  ];
  const colorIndex =
    name?.charCodeAt(0) % colors.length || 0;

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
      style={{ backgroundColor: colors[colorIndex], color: '#fff' }}
      title={name}
    >
      {avatar || name?.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default Avatar;