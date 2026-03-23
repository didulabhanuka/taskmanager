import { useState, useEffect } from 'react';

const usePresence = (socketRef, boardId) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !boardId) return;

    // Listen for presence updates
    socket.on('presence:update', (users) => {
      setOnlineUsers(users);
    });

    // Listen for cursor movements from other users
    socket.on('cursor:moved', ({ userId, name, avatar, x, y }) => {
      setCursors((prev) => ({
        ...prev,
        [userId]: { name, avatar, x, y, updatedAt: Date.now() },
      }));
    });

    return () => {
      socket.off('presence:update');
      socket.off('cursor:moved');
    };
  }, [socketRef, boardId]);

  // Fade out cursors that haven't moved in 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((userId) => {
          if (now - updated[userId].updatedAt > 3000) {
            delete updated[userId];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { onlineUsers, cursors };
};

export default usePresence;