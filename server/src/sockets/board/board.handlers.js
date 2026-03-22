const Card = require('../../models/Card');
const Column = require('../../models/Column');
const Activity = require('../../models/Activity');
const Board = require('../../models/Board');

// Check if user is a member of the board
const verifyBoardAccess = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, members: userId });
  if (!board) {
    const error = new Error('Board not found or access denied');
    error.statusCode = 404;
    throw error;
  }
  return board;
};

const registerBoardHandlers = (io, socket) => {
  const userId = socket.user._id.toString();

  // Create a card
  socket.on('card:create', async ({ title, description, columnId, boardId }) => {
    try {
      await verifyBoardAccess(boardId, userId);

      const column = await Column.findOne({ _id: columnId, boardId });
      if (!column) return socket.emit('error', { message: 'Column not found' });

      const lastCard = await Card.findOne({ columnId }).sort({ order: -1 });
      const order = lastCard ? lastCard.order + 1 : 0;

      const card = await Card.create({
        title,
        description,
        columnId,
        boardId,
        order,
      });

      const activity = await Activity.create({
        boardId,
        userId,
        action: 'card.created',
        meta: { cardTitle: card.title, columnTitle: column.title },
      });

      await activity.populate('userId', 'name email avatar');

      // Broadcast to everyone in the room including sender
      io.to(`board:${boardId}`).emit('card:created', { card });
      io.to(`board:${boardId}`).emit('activity:new', { activity });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Update a card
  socket.on('card:update', async ({ cardId, updates }) => {
    try {
      const card = await Card.findById(cardId);
      if (!card) return socket.emit('error', { message: 'Card not found' });

      await verifyBoardAccess(card.boardId, userId);

      const allowed = ['title', 'description', 'assignee', 'dueDate', 'labels'];
      allowed.forEach((field) => {
        if (updates[field] !== undefined) card[field] = updates[field];
      });

      await card.save();
      await card.populate('assignee', 'name email avatar');

      const activity = await Activity.create({
        boardId: card.boardId,
        userId,
        action: 'card.updated',
        meta: { cardTitle: card.title },
      });

      await activity.populate('userId', 'name email avatar');

      io.to(`board:${card.boardId}`).emit('card:updated', { card });
      io.to(`board:${card.boardId}`).emit('activity:new', { activity });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Move a card to a different column or position
  socket.on('card:move', async ({ cardId, toColumnId, newOrder }) => {
    try {
      const card = await Card.findById(cardId);
      if (!card) return socket.emit('error', { message: 'Card not found' });

      await verifyBoardAccess(card.boardId, userId);

      const fromColumnId = card.columnId.toString();

      const [fromColumn, toColumn] = await Promise.all([
        Column.findById(fromColumnId),
        Column.findById(toColumnId),
      ]);

      // Shift cards in destination column up to make room
      await Card.updateMany(
        { columnId: toColumnId, order: { $gte: newOrder }, _id: { $ne: cardId } },
        { $inc: { order: 1 } }
      );

      card.columnId = toColumnId;
      card.order = newOrder;
      await card.save();
      await card.populate('assignee', 'name email avatar');

      const activity = await Activity.create({
        boardId: card.boardId,
        userId,
        action: 'card.moved',
        meta: {
          cardTitle: card.title,
          fromColumnTitle: fromColumn?.title,
          toColumnTitle: toColumn?.title,
          fromColumnId,
          toColumnId,
        },
      });

      await activity.populate('userId', 'name email avatar');

      io.to(`board:${card.boardId}`).emit('card:moved', {
        card,
        fromColumnId,
        toColumnId,
      });
      io.to(`board:${card.boardId}`).emit('activity:new', { activity });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Delete a card
  socket.on('card:delete', async ({ cardId }) => {
    try {
      const card = await Card.findById(cardId);
      if (!card) return socket.emit('error', { message: 'Card not found' });

      await verifyBoardAccess(card.boardId, userId);

      const activity = await Activity.create({
        boardId: card.boardId,
        userId,
        action: 'card.deleted',
        meta: { cardTitle: card.title },
      });

      await activity.populate('userId', 'name email avatar');

      const boardId = card.boardId.toString();
      await card.deleteOne();

      io.to(`board:${boardId}`).emit('card:deleted', { cardId });
      io.to(`board:${boardId}`).emit('activity:new', { activity });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Create a column
  socket.on('column:create', async ({ title, boardId }) => {
    try {
      await verifyBoardAccess(boardId, userId);

      const lastColumn = await Column.findOne({ boardId }).sort({ order: -1 });
      const order = lastColumn ? lastColumn.order + 1 : 0;

      const column = await Column.create({ title, boardId, order });

      const activity = await Activity.create({
        boardId,
        userId,
        action: 'column.created',
        meta: { columnTitle: column.title },
      });

      await activity.populate('userId', 'name email avatar');

      io.to(`board:${boardId}`).emit('column:created', { column });
      io.to(`board:${boardId}`).emit('activity:new', { activity });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
};

module.exports = registerBoardHandlers;