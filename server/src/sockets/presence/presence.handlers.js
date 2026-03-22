// In-memory store of who is online on each board
// Structure: Map<boardId, Map<userId, userInfo>>
// This is intentionally simple — for multi-instance scaling you'd swap this for Redis
const presenceMap = new Map();

const addPresence = (boardId, user) => {
  if (!presenceMap.has(boardId)) {
    presenceMap.set(boardId, new Map());
  }
  presenceMap.get(boardId).set(user._id.toString(), {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  });
};

const removePresence = (boardId, userId) => {
  if (presenceMap.has(boardId)) {
    presenceMap.get(boardId).delete(userId.toString());
    // Clean up empty board entries
    if (presenceMap.get(boardId).size === 0) {
      presenceMap.delete(boardId);
    }
  }
};

const getPresence = (boardId) => {
  if (!presenceMap.has(boardId)) return [];
  return Array.from(presenceMap.get(boardId).values());
};

// Track which boards each socket is in — needed for cleanup on disconnect
const socketBoardMap = new Map();

const registerPresenceHandlers = (io, socket) => {
  const userId = socket.user._id.toString();

  socket.on('board:join', ({ boardId }) => {
    // Join the Socket.io room for this board
    socket.join(`board:${boardId}`);

    // Track this socket's board membership
    if (!socketBoardMap.has(socket.id)) {
      socketBoardMap.set(socket.id, new Set());
    }
    socketBoardMap.get(socket.id).add(boardId);

    // Add to presence and broadcast to everyone in the room
    addPresence(boardId, socket.user);
    io.to(`board:${boardId}`).emit('presence:update', getPresence(boardId));
  });

  socket.on('board:leave', ({ boardId }) => {
    socket.leave(`board:${boardId}`);

    // Remove from presence and broadcast updated list
    removePresence(boardId, userId);
    io.to(`board:${boardId}`).emit('presence:update', getPresence(boardId));

    // Clean up socket board map
    if (socketBoardMap.has(socket.id)) {
      socketBoardMap.get(socket.id).delete(boardId);
    }
  });

  // Throttled on client side at 50ms — broadcast cursor position to others in room
  socket.on('cursor:move', ({ boardId, x, y }) => {
    // Broadcast to everyone in the room except the sender
    socket.to(`board:${boardId}`).emit('cursor:moved', {
      userId,
      name: socket.user.name,
      avatar: socket.user.avatar,
      x,
      y,
    });
  });

  socket.on('disconnect', () => {
    // Remove user from all boards they were in
    if (socketBoardMap.has(socket.id)) {
      socketBoardMap.get(socket.id).forEach((boardId) => {
        removePresence(boardId, userId);
        io.to(`board:${boardId}`).emit('presence:update', getPresence(boardId));
      });
      socketBoardMap.delete(socket.id);
    }
  });
};

module.exports = registerPresenceHandlers;